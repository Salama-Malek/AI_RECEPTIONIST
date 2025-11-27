import * as dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const schema = z.object({
  GATEWAY_PORT: z.coerce.number().int().positive().default(4000),
  OPENAI_API_KEY: z.string().optional(),
  STT_MODEL: z.string().default('whisper-1'),
  TTS_VOICE: z.string().default('alloy'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('Invalid environment configuration', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = parsed.data;
