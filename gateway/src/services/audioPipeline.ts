import { STTClient } from './sttClient';
import { LLMClient, ConversationTurn } from './llmClient';
import { TTSClient } from './ttsClient';
import { logger } from '../utils/logger';

type Session = {
  callId: string;
  language: string;
  history: ConversationTurn[];
  queue: Promise<void>;
  active: boolean;
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

  async initSession(callId: string, languageHint: string = 'auto') {
    const existing = this.sessions.get(callId);
    if (existing) {
      existing.language = languageHint;
      return existing;
    }
    const session: Session = {
      callId,
      language: languageHint,
      history: [],
      queue: Promise.resolve(),
      active: true,
    };
    this.sessions.set(callId, session);
    logger.info({ callId, languageHint }, 'Audio session initialized');
    return session;
  }

  async handleAudio(callId: string, base64Chunk: string) {
    const session = this.sessions.get(callId);
    if (!session || !session.active) {
      throw new Error(`Session not found for callId=${callId}`);
    }

    session.queue = session.queue
      .then(async () => {
        const stt = await this.sttClient.transcribeChunk(base64Chunk, callId);
        if (!stt) return;

        session.history.push({ role: 'caller', text: stt.text });
        this.callbacks.onTranscript({
          callId,
          role: 'caller',
          text: stt.text,
        });

        const reply = await this.llmClient.generateReply(session.history);
        session.history.push({ role: 'assistant', text: reply });
        this.callbacks.onTranscript({
          callId,
          role: 'assistant',
          text: reply,
        });

        const audioOut = await this.ttsClient.synthesize(reply, session.language);
        this.callbacks.onAudioOut({ callId, chunk: audioOut });
      })
      .catch((err) => {
        logger.error({ err, callId }, 'Pipeline error');
        this.callbacks.onError?.(err, callId);
      });

    return session.queue;
  }

  async cleanup(callId: string) {
    const session = this.sessions.get(callId);
    if (!session) return;
    session.active = false;
    await session.queue.catch(() => undefined);
    this.sessions.delete(callId);
    logger.info({ callId }, 'Audio session cleaned up');
  }

  async shutdown() {
    const pending = [...this.sessions.keys()].map((callId) => this.cleanup(callId));
    await Promise.all(pending);
    await Promise.all([this.sttClient.close(), this.llmClient.close(), this.ttsClient.close()]);
  }
}
