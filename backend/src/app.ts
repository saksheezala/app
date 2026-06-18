import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { healthRouter } from './routes/health';
import { apiRouter } from './routes/api';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';

export function createApp(): Application {
  const app: Application = express();

  // ─── Security Middleware ───────────────────────────────────
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:5173'],
      credentials: true,
    }),
  );

  // ─── Logging ──────────────────────────────────────────────
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

  // ─── Body Parsing ─────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // ─── Routes ───────────────────────────────────────────────
  app.use('/health', healthRouter);
  app.use('/api/v1', apiRouter);

  // ─── Error Handling ───────────────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
