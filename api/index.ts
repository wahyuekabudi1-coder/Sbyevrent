import express, { Request, Response } from 'express';
import { apiRouter } from '../server/routes.ts';
import { initDatabase } from '../server/db.ts';

const app = express();

// Standard middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for API requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-admin-key');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Initialize database schema and seeds
try {
  initDatabase();
} catch (error) {
  console.warn('[Vercel Serverless Function] DB init notice:', error);
}

// Mount API router
app.use('/api', apiRouter);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    serverless: true,
  });
});

export default app;
