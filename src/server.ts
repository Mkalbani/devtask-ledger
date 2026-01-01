import express from 'express';
import cors from 'cors';
import { CONFIG } from './config';
import routes from './api/routes';
import { cache } from './services/cache';
import { db } from './services/database';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// API routes
app.use('/api', routes);

// Error handling
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error('Error:', err);
    res.status(500).json({
      error: 'Internal server error',
      message: CONFIG.NODE_ENV === 'development' ? err.message : undefined,
    });
  },
);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
async function start() {
  try {
    // Connect to cache
    await cache.connect();
    console.log('✅ Cache connected');

    // Test database connection
    await db.healthCheck();
    console.log('✅ Database connected');

    // Start HTTP server
    app.listen(CONFIG.PORT, () => {
      console.log(`🚀 Server running on port ${CONFIG.PORT}`);
      console.log(`📊 API available at http://localhost:${CONFIG.PORT}/api`);
      console.log(
        `🏥 Health check: http://localhost:${CONFIG.PORT}/api/health`,
      );
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await cache.close();
  await db.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await cache.close();
  await db.close();
  process.exit(0);
});

start();
