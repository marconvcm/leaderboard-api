import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import leaderboardRoutes from "./routes/leaderboard.routes";
import logger from './utils/logger';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './utils/errorHandler';
import healthCheck from './utils/healthCheck';
import swaggerUi from 'swagger-ui-express';
// @ts-ignore
import openapi from './utils/openapi';

dotenv.config();

const app = express();
app.use(express.json());

// Security headers
app.use(helmet());
// CORS (allow all by default, restrict as needed)
app.use(cors());
// Rate limiting
app.use(rateLimit({
   windowMs: 15 * 60 * 1000, // 15 minutes
   max: 100, // limit each IP to 100 requests per windowMs
   standardHeaders: true,
   legacyHeaders: false,
}));

app.use((req: Request, res: Response, next: NextFunction) => {
   logger.info('Incoming request', { method: req.method, url: req.url, ip: req.ip });
   next();
});

app.use("/v1/leaderboard", leaderboardRoutes);

app.use('/health', healthCheck);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi));

// Centralized error handler for consistent error responses
app.use(errorHandler);

const mongoUrl = process.env.MONGO_URI || "mongodb://localhost:27017/leaderboard";

mongoose.connect(mongoUrl, { timeoutMS: 10000 })
   .then(() => logger.info("MongoDB connected"))
   .catch(err => logger.error("MongoDB error", { error: err }));

export default app;
