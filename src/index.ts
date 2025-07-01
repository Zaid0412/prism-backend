import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClerkClient } from '@clerk/backend';
import { PrismaClient } from '../generated/prisma';
import { requireAuth } from '@clerk/express';
// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: "*",
  credentials: true
}));
app.use(express.json());

// Clerk authentication middleware
const authenticateUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);
    const session = await clerk.sessions.verifySession(token, token);
    
    if (!session) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    req.user = { id: session.userId };
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
      auth?: { userId: string };
    }
  }
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Prism Backend is running' });
});

// Protect all solve routes with Clerk's requireAuth middleware
app.use('/api/solves', requireAuth());
app.use('/api/stats', requireAuth());

// Get all solves for a user
app.get('/api/solves', async (req, res) => {
  try {
    const { puzzleType, state, sortBy = 'date', sortOrder = 'desc' } = req.query;
    const userId = req.auth!.userId;
    const where: any = { userId };
    if (puzzleType && puzzleType !== 'all') {
      where.puzzleType = puzzleType;
    }
    if (state && state !== 'all') {
      where.state = state;
    }
    const orderBy: any = {};
    if (sortBy === 'time') {
      orderBy.time = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }
    const solves = await prisma.solve.findMany({
      where,
      orderBy,
    });
    res.json(solves);
  } catch (error) {
    console.error('Error fetching solves:', error);
    res.status(500).json({ error: 'Failed to fetch solves' });
  }
});

// Create a new solve
app.post('/api/solves', async (req, res) => {
  try {
    const { time, scramble, puzzleType = '3x3', state = 'none' } = req.body;
    if (!time || !scramble) {
      res.status(400).json({ error: 'Time and scramble are required' });
      return;
    }
    const userId = req.auth!.userId;
    const solve = await prisma.solve.create({
      data: {
        userId,
        time: parseFloat(time),
        scramble,
        puzzleType,
        state,
      },
    });
    res.status(201).json(solve);
  } catch (error) {
    console.error('Error creating solve:', error);
    res.status(500).json({ error: 'Failed to create solve' });
  }
});

// Update solve state (+2, DNF)
app.patch('/api/solves/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { state } = req.body;
    const userId = req.auth!.userId;
    if (!['none', '+2', 'DNF'].includes(state)) {
      res.status(400).json({ error: 'Invalid state' });
      return;
    }
    const solve = await prisma.solve.findFirst({ where: { id, userId } });
    if (!solve) {
      res.status(404).json({ error: 'Solve not found' });
      return;
    }
    const updatedSolve = await prisma.solve.update({
      where: { id },
      data: { state },
    });
    res.json(updatedSolve);
  } catch (error) {
    console.error('Error updating solve:', error);
    res.status(500).json({ error: 'Failed to update solve' });
  }
});

// Delete a solve
app.delete('/api/solves/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.auth!.userId;
    const solve = await prisma.solve.findFirst({ where: { id, userId } });
    if (!solve) {
      res.status(404).json({ error: 'Solve not found' });
      return;
    }
    await prisma.solve.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting solve:', error);
    res.status(500).json({ error: 'Failed to delete solve' });
  }
});

// Get user stats
app.get('/api/stats', async (req, res) => {
  try {
    const { puzzleType = '3x3' } = req.query;
    const userId = req.auth!.userId;
    const solves = await prisma.solve.findMany({
      where: {
        userId,
        puzzleType: puzzleType as string,
        state: { not: 'DNF' },
      },
      orderBy: { time: 'asc' },
    });
    if (solves.length === 0) {
      res.status(404).json({ error: 'No solves found' });
      return;
    }
    // Calculate stats here...
    res.json({ solves });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Prism Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});