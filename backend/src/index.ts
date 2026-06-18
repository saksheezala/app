import 'dotenv/config';
import { createApp } from './app';

const PORT = parseInt(process.env.PORT ?? '3000', 10);
const HOST = process.env.HOST ?? '0.0.0.0';

const app = createApp();

const server = app.listen(PORT, HOST, () => {
  console.info(`🚀 Server running at http://${HOST}:${PORT}`);
  console.info(`📦 Environment: ${process.env.NODE_ENV ?? 'development'}`);
});

// ─── Graceful Shutdown ────────────────────────────────────────
const shutdown = (signal: string): void => {
  console.info(`\n⚠️  ${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.info('✅ Server closed.');
    process.exit(0);
  });
  // Force exit after 10 s
  setTimeout(() => {
    console.error('💀 Forced exit after timeout.');
    process.exit(1);
  }, 10_000);
};

process.on('SIGTERM', () => { shutdown('SIGTERM'); });
process.on('SIGINT', () => { shutdown('SIGINT'); });
