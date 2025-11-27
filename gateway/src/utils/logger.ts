import pino, { LoggerOptions } from 'pino';
import { config } from '../config/env';

const options: LoggerOptions = {
  level: config.LOG_LEVEL,
  transport:
    process.env.NODE_ENV === 'production'
      ? undefined
      : { target: 'pino-pretty', options: { colorize: true } },
};

export const logger = pino(options);
