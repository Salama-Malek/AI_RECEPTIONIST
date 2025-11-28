import { STTClient } from './sttClient';
import { LLMClient, ConversationTurn } from './llmClient';
import { TTSClient } from './ttsClient';
import { logger } from '../utils/logger';
import { backendClient } from './backendClient';
import { config } from '../config/env';

type Session = {
  id: string;
  callSid?: string;
  language: string;
  history: ConversationTurn[];
  queue: Promise<void>;
  active: boolean;
  conversationId?: string;
  hasSentFallback?: boolean;
};

export interface PipelineCallbacks {
  onTranscript: (data: { callId: string; role: 'caller' | 'assistant'; text: string }) => void;
  onAudioOut: (data: { callId: string; chunk: string }) => void;
  onError?: (error: Error, callId?: string) => void;
}

export class AudioPipeline {
  private sessions = new Map<string, Session>();
  private readonly sttClient: STTClient;
  private readonly llmClient: LLMClient;
  private readonly ttsClient: TTSClient;
  private readonly callbacks: PipelineCallbacks;

  constructor(
    callbacks: PipelineCallbacks,
    deps?: { sttClient?: STTClient; llmClient?: LLMClient; ttsClient?: TTSClient },
  ) {
    this.callbacks = callbacks;
    this.sttClient = deps?.sttClient ?? new STTClient();
    this.llmClient = deps?.llmClient ?? new LLMClient();
    this.ttsClient = deps?.ttsClient ?? new TTSClient();
  }

  async createSession(sessionId: string, options?: { languageHint?: string; callSid?: string }) {
    const existing = this.sessions.get(sessionId);
    if (existing) return existing;
    const session: Session = {
      id: sessionId,
      callSid: options?.callSid,
      language: options?.languageHint || 'auto',
      history: [],
      queue: Promise.resolve(),
      active: true,
    };
    this.sessions.set(sessionId, session);
    logger.info({ sessionId, language: session.language }, 'Audio session initialized');
    return session;
  }

  async handleAudioFrame(sessionId: string, audioBuffer: Buffer) {
    const session = this.sessions.get(sessionId);
    if (!session || !session.active) {
      throw new Error(`Session not found for sessionId=${sessionId}`);
    }

    // TODO: Twilio streams are 8kHz mu-law/PCMU. Transcode to your STT expected format if needed.
    const base64Chunk = audioBuffer.toString('base64');

    session.queue = session.queue
      .then(async () => {
        const stt = await this.sttClient.transcribeChunk(base64Chunk, sessionId);
        if (!stt) return;

        const text = stt.text;
        session.history.push({ role: 'caller', text });
        this.callbacks.onTranscript({
          callId: sessionId,
          role: 'caller',
          text,
        });

        if (config.AI_CONVERSATION_ENABLED !== 'true') {
          return;
        }

        if (!session.conversationId) {
          await this.startBackendConversation(session, text);
        } else {
          await this.sendMessageToBackend(session, text);
        }
      })
      .catch((err) => {
        logger.error({ err, sessionId }, 'Pipeline error');
        this.callbacks.onError?.(err, sessionId);
      });

    return session.queue;
  }

  async endSession(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    session.active = false;
    await session.queue.catch(() => undefined);
    this.sessions.delete(sessionId);
    logger.info({ sessionId }, 'Audio session cleaned up');
  }

  async shutdown() {
    const pending = [...this.sessions.keys()].map((id) => this.endSession(id));
    await Promise.all(pending);
    await Promise.all([this.sttClient.close(), this.llmClient.close(), this.ttsClient.close()]);
  }

  private async startBackendConversation(session: Session, firstUtterance: string) {
    try {
      const res = await backendClient.startConversation({
        callerName: 'Unknown caller',
        phoneNumber: session.callSid || 'unknown',
        languageHint: session.language as any,
        context: `callSid=${session.callSid || 'n/a'}; firstUtterance=${firstUtterance}`,
      });
      session.conversationId = res.conversationId;
      const replyText = res.initialAssistantMessage;
      session.history.push({ role: 'assistant', text: replyText });
      this.callbacks.onTranscript({
        callId: session.id,
        role: 'assistant',
        text: replyText,
      });
      const audioOut = await this.ttsClient.synthesize(replyText, session.language);
      this.callbacks.onAudioOut({ callId: session.id, chunk: audioOut });
      logger.info({ conversationId: res.conversationId }, 'Backend conversation started');
    } catch (error) {
      if (session.hasSentFallback) return;
      session.hasSentFallback = true;
      logger.error({ err: error }, 'Failed to start backend conversation; sending fallback');
      const fallback = 'Sorry, our receptionist is unavailable right now.';
      const audioOut = await this.ttsClient.synthesize(fallback, session.language);
      this.callbacks.onAudioOut({ callId: session.id, chunk: audioOut });
    }
  }

  private async sendMessageToBackend(session: Session, text: string) {
    if (!session.conversationId) return;
    try {
      const res = await backendClient.sendMessage({
        conversationId: session.conversationId,
        from: 'caller',
        text,
      });
      const replyText = res.reply;
      session.history.push({ role: 'assistant', text: replyText });
      this.callbacks.onTranscript({
        callId: session.id,
        role: 'assistant',
        text: replyText,
      });
      const audioOut = await this.ttsClient.synthesize(replyText, session.language);
      this.callbacks.onAudioOut({ callId: session.id, chunk: audioOut });
    } catch (error) {
      if (session.hasSentFallback) return;
      session.hasSentFallback = true;
      logger.error({ err: error }, 'Failed to send message to backend; sending fallback');
      const fallback = 'Apologies, I could not process that. Please try again later.';
      const audioOut = await this.ttsClient.synthesize(fallback, session.language);
      this.callbacks.onAudioOut({ callId: session.id, chunk: audioOut });
    }
  }
}
