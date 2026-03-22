import winston from 'winston';
import { env, APP_NAME } from '../config';

const PII_PATTERNS = [
  { regex: /\b\d{5}\b/g, replacement: '[PLZ]' },
  { regex: /\+?\d{10,15}/g, replacement: '[PHONE]' },
  { regex: /[\w.-]+@[\w.-]+\.\w+/g, replacement: '[EMAIL]' },
];

function sanitizeForLog(message: string): string {
  if (env.NODE_ENV === 'production') {
    let sanitized = message;
    for (const { regex, replacement } of PII_PATTERNS) {
      sanitized = sanitized.replace(regex, replacement);
    }
    return sanitized;
  }
  return message;
}

const sanitizeFormat = winston.format((info) => {
  if (typeof info.message === 'string') {
    info.message = sanitizeForLog(info.message);
  }
  return info;
});

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  sanitizeFormat(),
  winston.format.errors({ stack: true }),
  env.NODE_ENV === 'production'
    ? winston.format.json()
    : winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
          return `${timestamp} [${APP_NAME}] ${level}: ${message}${metaStr}`;
        }),
      ),
);

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: logFormat,
  defaultMeta: { service: APP_NAME },
  transports: [
    new winston.transports.Console(),
    ...(env.NODE_ENV === 'production'
      ? [
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 5,
          }),
          new winston.transports.File({
            filename: 'logs/combined.log',
            maxsize: 10 * 1024 * 1024,
            maxFiles: 10,
          }),
        ]
      : []),
  ],
});
