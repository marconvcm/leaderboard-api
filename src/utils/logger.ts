import winston from 'winston';

const isTest = process.env.NODE_ENV === 'test';

const logger = winston.createLogger({
   level: process.env.LOG_LEVEL || 'info',
   format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
         return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
      })
   ),
   silent: isTest,
   transports: isTest ? [new winston.transports.Console({ silent: true })] : [
      new winston.transports.Console(),
   ],
});

export default logger;
