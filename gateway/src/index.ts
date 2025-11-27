import { WsServer } from './server/wsServer';
import { config } from './config/env';
import { logger } from './utils/logger';

async function bootstrap() {
  try {
    const server = new WsServer();
    server.start();
    logger.info({ port: config.GATEWAY_PORT }, 'Voice gateway started');
  } catch (error) {
    logger.error({ err: error }, 'Failed to start voice gateway');
    process.exit(1);
  }
}

bootstrap();
