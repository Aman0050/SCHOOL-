import winston from 'winston';

const { combine, timestamp, json, errors, colorize, printf } = winston.format;

// Custom format for local development
const devFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  if (stack) {
    msg += `\n${stack}`;
  }
  return msg;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }),
    timestamp(),
    json() // Structured JSON logs for production (Datadog/Loki)
  ),
  defaultMeta: { service: 'eduxeno-api' },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production' 
        ? combine(timestamp(), json()) 
        : combine(colorize(), timestamp(), devFormat),
    }),
    // In production, we could add File transports or HTTP transports to log aggregators here
  ],
});
