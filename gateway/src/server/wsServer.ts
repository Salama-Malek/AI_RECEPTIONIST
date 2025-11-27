import { WebSocketServer, WebSocket } from 'ws';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import {
  IncomingMessage,
  InitMessage,
  AudioInMessage,
  OutgoingMessage,
} from '../types/messages';
import { AudioPipeline } from '../services/audioPipeline';

type ClientState = {
  callIds: Set<string>;
};

export class WsServer {
  private wss: WebSocketServer | null = null;
  private clients = new Map<WebSocket, ClientState>();

  private pipeline = new AudioPipeline({
    onTranscript: (data) => this.broadcast(data.callId, { type: 'transcript', ...data }),
    onAudioOut: (data) => this.broadcast(data.callId, { type: 'audio_out', ...data }),
    onError: (error, callId) => this.broadcast(callId || 'unknown', { type: 'error', message: error.message }),
  });

  start() {
    this.wss = new WebSocketServer({ port: config.GATEWAY_PORT });

    this.wss.on('connection', (ws) => {
      this.clients.set(ws, { callIds: new Set() });
      logger.info('WebSocket client connected');

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

  private async handleMessage(ws: WebSocket, data: string) {
    let message: IncomingMessage;
    try {
      message = JSON.parse(data);
    } catch (error) {
      logger.warn({ data }, 'Received non-JSON message');
      return this.send(ws, { type: 'error', message: 'Invalid JSON payload' });
    }

    if (!this.isIncomingMessage(message)) {
      return this.send(ws, { type: 'error', message: 'Unsupported message format' });
    }

    switch (message.type) {
      case 'init':
        return this.handleInit(ws, message);
      case 'audio':
        return this.handleAudio(ws, message);
      default:
        return this.send(ws, { type: 'error', message: 'Unknown message type' });
    }
  }

  private async handleInit(ws: WebSocket, message: InitMessage) {
    const state = this.clients.get(ws);
    if (!state) return;
    await this.pipeline.initSession(message.callId, message.languageHint || 'auto');
    state.callIds.add(message.callId);
    this.send(ws, { type: 'ready', callId: message.callId });
  }

  private async handleAudio(ws: WebSocket, message: AudioInMessage) {
    const state = this.clients.get(ws);
    if (!state || !state.callIds.has(message.callId)) {
      logger.warn({ callId: message.callId }, 'Audio received for unknown session');
      return this.send(ws, {
        type: 'error',
        callId: message.callId,
        message: 'Session not initialized. Send init first.',
      });
    }

    try {
      await this.pipeline.handleAudio(message.callId, message.chunk);
    } catch (error) {
      logger.error({ err: error, callId: message.callId }, 'Pipeline error');
      this.send(ws, {
        type: 'error',
        callId: message.callId,
        message: (error as Error).message,
      });
    }
  }

  private async handleClose(ws: WebSocket) {
    const state = this.clients.get(ws);
    if (!state) return;

    for (const callId of state.callIds) {
      await this.pipeline.cleanup(callId);
    }
    this.clients.delete(ws);
    logger.info('WebSocket client disconnected and sessions cleaned up');
  }

  private send(ws: WebSocket, message: OutgoingMessage) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private broadcast(callId: string, message: OutgoingMessage) {
    for (const [ws, state] of this.clients.entries()) {
      if (state.callIds.has(callId) && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    }
  }

  private isIncomingMessage(msg: any): msg is IncomingMessage {
    if (!msg || typeof msg !== 'object' || typeof msg.type !== 'string') return false;
    if (msg.type === 'init') {
      return typeof msg.callId === 'string';
    }
    if (msg.type === 'audio') {
      return typeof msg.callId === 'string' && typeof msg.chunk === 'string';
    }
    return false;
  }
}
