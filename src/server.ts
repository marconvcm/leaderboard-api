import mongoose from "mongoose";
import app from "./app";
import logger from "./utils/logger";

const server = app.listen(process.env.PORT || 3000, () => {
   logger.info(`Server started on port ${process.env.PORT || 3000}`);
});

async function shutdown(signal: string) {
   logger.info(`received ${signal}, shutting down gracefully...`);
   await mongoose.connection.close();
   logger.info('database connection closed.');
   
   server.close(() => {
      logger.info('leaderboard-api server closed.');
      process.exit(0);
   });
   
   setTimeout(() => {
      logger.error('forcefully shutting down.');
      process.exit(1);
   }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
