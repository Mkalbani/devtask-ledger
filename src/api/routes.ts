import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { DeveloperService } from '../services/DeveloperService';

const router = Router();
const prisma = new PrismaClient();
const developerService = new DeveloperService(prisma);

// Health check
router.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT NOW()`;
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch {
    res.status(500).json({ status: 'error', message: 'Service unavailable' });
  }
});

// Global stats
router.get('/stats/global', async (req, res) => {
  try {
    const stats = await developerService.getGlobalStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching global stats:', error);
    res.status(500).json({ error: 'Failed to fetch global stats' });
  }
});

// Leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const leaderboard = await developerService.getLeaderboard(limit);
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// All developers
router.get('/developers', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;

    const developers = await developerService.getAllDevelopers(limit, offset);
    res.json(developers);
  } catch (error) {
    console.error('Error fetching developers:', error);
    res.status(500).json({ error: 'Failed to fetch developers' });
  }
});

// Developer profile
router.get('/developers/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const developer = await developerService.getDeveloperProfile(address);

    if (!developer) {
      return res.status(404).json({ error: 'Developer not found' });
    }

    res.json(developer);
  } catch (error) {
    console.error('Error fetching developer:', error);
    res.status(500).json({ error: 'Failed to fetch developer' });
  }
});

// Developer tasks
router.get('/developers/:address/tasks', async (req, res) => {
  try {
    const { address } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const taskRepo = new (
      await import('../repositories/TaskRepository')
    ).TaskRepository(prisma);
    const tasks = await taskRepo.findByDeveloper(address, limit, offset);

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Developer achievements
router.get('/developers/:address/achievements', async (req, res) => {
  try {
    const { address } = req.params;

    const achievements = await prisma.achievement.findMany({
      where: { developerAddress: address },
      orderBy: { unlockedAt: 'desc' },
    });

    res.json(achievements);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

// Recent tasks (all developers)
router.get('/tasks/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;

    const taskRepo = new (
      await import('../repositories/TaskRepository')
    ).TaskRepository(prisma);
    const tasks = await taskRepo.findRecent(limit);

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching recent tasks:', error);
    res.status(500).json({ error: 'Failed to fetch recent tasks' });
  }
});

// Task by transaction ID
router.get('/tasks/:txId', async (req, res) => {
  try {
    const { txId } = req.params;

    const taskRepo = new (
      await import('../repositories/TaskRepository')
    ).TaskRepository(prisma);
    const task = await taskRepo.findByTxId(txId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// Activity feed
router.get('/activity', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;

    const activities = await prisma.activityLog.findMany({
      take: limit,
      orderBy: { timestamp: 'desc' },
      include: {
        developer: {
          select: {
            address: true,
            taskCount: true,
          },
        },
      },
    });

    res.json(activities);
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// Search developers
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query required' });
    }

    const results = await developerService.searchDevelopers(q);
    res.json(results);
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
