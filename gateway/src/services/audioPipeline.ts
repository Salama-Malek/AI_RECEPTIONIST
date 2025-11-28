import { STTClient } from './sttClient';
import { LLMClient, ConversationTurn } from './llmClient';
import { TTSClient } from './ttsClient';
import { logger } from '../utils/logger';

type Session = {
  id: string;
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

  async createSession(sessionId: string, options?: { languageHint?: string }) {
    const existing = this.sessions.get(sessionId);
    if (existing) return existing;
    const session: Session = {
      id: sessionId,
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

        session.history.push({ role: 'caller', text: stt.text });
        this.callbacks.onTranscript({
          callId: sessionId,
          role: 'caller',
          text: stt.text,
        });

        const reply = await this.llmClient.generateReply(session.history);
        session.history.push({ role: 'assistant', text: reply });
        this.callbacks.onTranscript({
          callId: sessionId,
          role: 'assistant',
          text: reply,
        });

        const audioOut = await this.ttsClient.synthesize(reply, session.language);
        // TODO: ensure audioOut encoding matches Twilio requirements (e.g., base64 PCMU)
        this.callbacks.onAudioOut({ callId: sessionId, chunk: audioOut });
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
}
