import { env, APP_NAME } from './config';
import { logger } from './utils';
import app from './app';

const server = app.listen(env.PORT, () => {
  logger.info(`${APP_NAME} running on port ${env.PORT} [${env.NODE_ENV}]`);
});

function gracefulShutdown(signal: string) {
  logger.info(`${signal} received – shutting down gracefully`);
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', { reason });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});
