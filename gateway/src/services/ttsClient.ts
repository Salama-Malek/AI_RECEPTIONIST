import { config } from '../config/env';
import { logger } from '../utils/logger';

export class TTSClient {
  constructor(private readonly voice: string = config.TTS_VOICE) {}

  async synthesize(text: string, _language?: string): Promise<string> {
    try {
      // Mock TTS: convert text to a Buffer and base64 encode.
      const audioBuffer = Buffer.from(`voice:${this.voice}:${text}`, 'utf8');
      return audioBuffer.toString('base64');
    } catch (error) {
      logger.error({ err: error }, 'TTS synthesis failed');
      throw error;
    }
  }

  async close() {
    return Promise.resolve();
  }
}
