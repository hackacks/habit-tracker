import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { habitRepository } from './src/repositories/habitRepository';
import prisma from './src/lib/prisma';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const client = jwksClient({
  jwksUri: `https://cognito-idp.${process.env.HABIT_FLOW_COGNITO_REGION}.amazonaws.com/${process.env.HABIT_FLOW_COGNITO_USER_POOL_ID}/.well-known/jwks.json`,
});

function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, function(err, key) {
    const signingKey = key?.getPublicKey();
    callback(err, signingKey);
  });
}

const requireAuth = (req: any, res: any, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  jwt.verify(token, getKey, {
    algorithms: ['RS256'],
    issuer: `https://cognito-idp.${process.env.HABIT_FLOW_COGNITO_REGION}.amazonaws.com/${process.env.HABIT_FLOW_COGNITO_USER_POOL_ID}`
  }, (err, decoded: any) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    req.user = decoded;
    req.userId = decoded.sub; // Cognito user sub
    next();
  });
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '10mb' })); // Increased limit for imports

  // --- API ROUTES ---

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/health', async (req, res) => {
    try {
      // Test DB connection
      await prisma.$queryRaw`SELECT 1`;
      
      // Check Cognito config
      const cognitoConfigured = !!(process.env.HABIT_FLOW_COGNITO_REGION && process.env.HABIT_FLOW_COGNITO_USER_POOL_ID);
      
      res.json({ 
        status: 'ok', 
        database: 'connected', 
        cognito: cognitoConfigured ? 'configured' : 'missing_credentials' 
      });
    } catch (error: any) {
      res.status(500).json({ 
        status: 'error', 
        database: 'failed', 
        error: error.message 
      });
    }
  });

  // Get all habits
  app.get('/api/habits', requireAuth, async (req: any, res: any) => {
    try {
      const habits = await habitRepository.getAllHabits(req.userId);
      res.json(habits);
    } catch (error) {
      console.error('Error fetching habits:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Create a habit
  app.post('/api/habits', requireAuth, async (req: any, res: any) => {
    try {
      const habit = await habitRepository.createHabit(req.userId, req.body);
      res.status(201).json(habit);
    } catch (error) {
      console.error('Error creating habit:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Update a habit
  app.put('/api/habits/:id', requireAuth, async (req: any, res: any) => {
    try {
      const habit = await habitRepository.updateHabit(req.userId, req.params.id, req.body);
      res.json(habit);
    } catch (error) {
      console.error('Error updating habit:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Delete a habit
  app.delete('/api/habits/:id', requireAuth, async (req: any, res: any) => {
    try {
      await habitRepository.deleteHabit(req.userId, req.params.id);
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting habit:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Toggle habit completion
  app.post('/api/habits/:id/completions/:dateStr', requireAuth, async (req: any, res: any) => {
    try {
      await habitRepository.toggleCompletion(req.userId, req.params.id, req.params.dateStr, req.body);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error toggling completion:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Import / Batch create habits
  app.post('/api/habits/batch', requireAuth, async (req: any, res: any) => {
    try {
      await habitRepository.batchCreateHabits(req.userId, req.body);
      res.status(201).json({ success: true });
    } catch (error) {
      console.error('Error batch creating habits:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Clear all data
  app.delete('/api/habits/clear-all/confirm', requireAuth, async (req: any, res: any) => {
    try {
      await habitRepository.clearAll(req.userId);
      res.status(204).end();
    } catch (error) {
      console.error('Error clearing data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // --- VITE MIDDLEWARE (Development) or STATIC FILES (Production) ---

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
