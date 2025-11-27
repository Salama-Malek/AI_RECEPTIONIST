import { config } from '../config/env';
import { logger } from '../utils/logger';

export type STTResult = {
  text: string;
  isFinal: boolean;
};

export class STTClient {
  constructor(private readonly model: string = config.STT_MODEL) {}

  async transcribeChunk(
    base64Audio: string,
    callId: string,
  ): Promise<STTResult | null> {
    try {
      const buffer = Buffer.from(base64Audio, 'base64');
      if (buffer.length === 0) return null;

      // Mock transcription: derive pseudo text from audio length for now.
      const text = `Caller said (${buffer.length} bytes)`;
      return { text, isFinal: true };
    } catch (error) {
      logger.error({ err: error, callId }, 'STT transcription failed');
      throw error;
    }
  }

  async close() {
    // Placeholder for closing connections to provider streams.
    return Promise.resolve();
  }
}
