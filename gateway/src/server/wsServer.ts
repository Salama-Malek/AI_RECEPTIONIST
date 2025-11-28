import { WebSocketServer, WebSocket } from 'ws';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import {
  TwilioStreamEventUnion,
  TwilioStreamStartEvent,
  TwilioStreamMediaEvent,
  TwilioStreamStopEvent,
} from '../types/messages';
import { AudioPipeline } from '../services/audioPipeline';
import { SessionManager } from './sessionManager';

export class WsServer {
  private wss: WebSocketServer | null = null;
  private sessionManager = new SessionManager();

  private pipeline = new AudioPipeline({
    onTranscript: (data) =>
      logger.debug({ callId: data.callId, role: data.role }, `Transcript: ${data.text}`),
    onAudioOut: (data) => this.sendAssistantAudio(data.callId, data.chunk),
    onError: (error, callId) => logger.error({ err: error, callId }, 'Pipeline error'),
  });

  start() {
    this.wss = new WebSocketServer({ port: config.GATEWAY_PORT });

    this.wss.on('connection', (ws) => {
      logger.info('Twilio Media Stream connected');
      ws.on('message', (data) => this.handleMessage(ws, data.toString()));
      ws.on('close', () => this.handleClose(ws));
      ws.on('error', (err) => {
        logger.error({ err }, 'WebSocket error');
        this.handleClose(ws);
      });
    });

    this.wss.on('listening', () => {
      logger.info(`Gateway WebSocket server listening on port ${config.GATEWAY_PORT}`);
    });
  }

  private async handleMessage(ws: WebSocket, raw: string) {
    let payload: TwilioStreamEventUnion;
    try {
      payload = JSON.parse(raw);
    } catch (error) {
      logger.warn({ raw }, 'Failed to parse JSON from Twilio');
      return;
    }

    if (!payload || typeof (payload as any).event !== 'string') {
      logger.warn({ payload }, 'Invalid payload: missing event');
      return;
    }

    switch (payload.event) {
      case 'start':
        return this.handleStart(ws, payload as TwilioStreamStartEvent);
      case 'media':
        return this.handleMedia(ws, payload as TwilioStreamMediaEvent);
      case 'stop':
        return this.handleStop(ws, payload as TwilioStreamStopEvent);
      default:
        logger.warn({ event: (payload as any).event }, 'Unknown Twilio event');
    }
  }

  private async handleStart(ws: WebSocket, event: TwilioStreamStartEvent) {
    const streamSid = event.start.streamSid;
    const callSid = event.start.callSid;
    this.sessionManager.getOrCreateSession(streamSid, { callSid });
    await this.pipeline.createSession(streamSid);
    (ws as any)._streamSid = streamSid;
    logger.info({ streamSid, callSid }, 'Twilio stream started');
  }

  private async handleMedia(_ws: WebSocket, event: TwilioStreamMediaEvent) {
    const streamSid = event.media.streamSid;
    const session = this.sessionManager.getSession(streamSid);
    if (!session) {
      logger.warn({ streamSid }, 'Media received for unknown session');
      return;
    }
    const buffer = Buffer.from(event.media.payload, 'base64');
    await this.pipeline.handleAudioFrame(streamSid, buffer);
    session.lastActivityAt = Date.now();
  }

  private async handleStop(ws: WebSocket, event: TwilioStreamStopEvent) {
    const streamSid = event.stop.streamSid;
    await this.pipeline.endSession(streamSid);
    this.sessionManager.removeSession(streamSid);
    logger.info({ streamSid }, 'Twilio stream stopped');
    try {
      ws.close();
    } catch (error) {
      logger.warn({ err: error }, 'Error closing WebSocket on stop');
    }
  }

  private sendAssistantAudio(streamSid: string, base64Pcm: string) {
    // Twilio expects base64 PCMU/8kHz frames in an outbound "media" event.
    const msg = JSON.stringify({
      event: 'media',
      media: { payload: base64Pcm }, // TODO: ensure encoding matches Twilio expectations (PCMU 8kHz).
    });
    if (!this.wss) return;

    this.wss.clients.forEach((client: WebSocket & { _streamSid?: string }) => {
      if (client.readyState === WebSocket.OPEN && client._streamSid === streamSid) {
        client.send(msg);
      }
    });
  }

  private async handleClose(ws: WebSocket & { _streamSid?: string }) {
    const streamSid = ws._streamSid;
    if (streamSid) {
      await this.pipeline.endSession(streamSid);
      this.sessionManager.removeSession(streamSid);
      logger.info({ streamSid }, 'Session cleaned up on socket close');
    }
  }
}
