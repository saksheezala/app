import { Router, Request, Response } from 'express';

export const healthRouter = Router();

healthRouter.get('/', (_req: Request, res: Response): void => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV ?? 'development',
    version: process.env.npm_package_version ?? '1.0.0',
  });
});

healthRouter.get('/ready', (_req: Request, res: Response): void => {
  // Add dependency checks (DB, cache, etc.) here
  res.status(200).json({ status: 'ready' });
});

healthRouter.get('/live', (_req: Request, res: Response): void => {
  res.status(200).json({ status: 'alive' });
});
