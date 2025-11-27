import { config } from '../config/env';
import { logger } from '../utils/logger';

export type ConversationTurn = { role: 'caller' | 'assistant'; text: string };

export class LLMClient {
  constructor(private readonly apiKey: string | undefined = config.OPENAI_API_KEY) {}

  async generateReply(history: ConversationTurn[]): Promise<string> {
    const lastUser = [...history].reverse().find((h) => h.role === 'caller');
    const prompt = lastUser?.text || 'Hello, how may I help you?';

    // Mock LLM: echo prompt with polite acknowledgement.
    const reply = `Understood: ${prompt}`;
    logger.debug({ reply }, 'LLM generated reply');
    return reply;
  }

  async close() {
    return Promise.resolve();
  }
}
