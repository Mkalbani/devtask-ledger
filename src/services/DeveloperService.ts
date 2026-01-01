import { PrismaClient } from '@prisma/client';
import { DeveloperRepository } from '../repositories/DeveloperRepository';
import { TaskRepository } from '../repositories/TaskRepository';
import { cache } from '../services/cache';
import {
  DeveloperResponseDto,
  GlobalStatsDto,
  LeaderboardEntryDto,
} from '../dto';

export class DeveloperService {
  private developerRepo: DeveloperRepository;
  private taskRepo: TaskRepository;

  constructor(private prisma: PrismaClient) {
    this.developerRepo = new DeveloperRepository(prisma);
    this.taskRepo = new TaskRepository(prisma);
  }

  async getDeveloperProfile(
    address: string,
  ): Promise<DeveloperResponseDto | null> {
    // Try cache first
    const cached = await cache.getDeveloperStats(address);
    if (cached) return cached;

    // Fetch from database
    const developer = await this.developerRepo.findByAddressWithTasks(address);
    if (!developer) return null;

    const profile: DeveloperResponseDto = {
      address: developer.address,
      taskCount: developer.taskCount,
      firstTaskAt: developer.firstTaskAt,
      lastTaskAt: developer.lastTaskAt,
      createdAt: developer.createdAt,
      tasks: developer.tasks.map((t) => ({
        id: t.id,
        developerAddress: t.developerAddress,
        taskId: t.taskId,
        title: t.title,
        description: t.description,
        blockHeight: t.blockHeight,
        txId: t.txId,
        timestamp: t.timestamp,
        createdAt: t.createdAt,
      })),
      achievements: developer.achievements.map((a) => ({
        id: a.id,
        achievementId: a.achievementId,
        unlockedAt: a.unlockedAt,
      })),
    };

    // Cache it
    await cache.setDeveloperStats(address, profile);

    return profile;
  }

  async getLeaderboard(limit: number = 10): Promise<LeaderboardEntryDto[]> {
    // Try cache
    const cached = await cache.getLeaderboard();
    if (cached) return cached;

    // Fetch from database
    const developers = await this.developerRepo.findTop(limit);

    const leaderboard = developers.map((dev, index) => ({
      address: dev.address,
      taskCount: dev.taskCount,
      lastTaskAt: dev.lastTaskAt,
      rank: index + 1,
    }));

    // Cache it
    await cache.setLeaderboard(leaderboard);

    return leaderboard;
  }

  async getGlobalStats(): Promise<GlobalStatsDto> {
    // Try cache
    const cached = await cache.getGlobalStats();
    if (cached) return cached;

    // Calculate stats
    const [totalDevelopers, totalTasks, latestTask] = await Promise.all([
      this.developerRepo.count(),
      this.taskRepo.count(),
      this.taskRepo.findRecent(1),
    ]);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const activeToday = await this.developerRepo.countActive(yesterday);

    const stats: GlobalStatsDto = {
      totalDevelopers,
      totalTasks,
      activeToday,
      lastActivity: latestTask[0]?.timestamp || null,
    };

    // Cache it
    await cache.setGlobalStats(stats);

    return stats;
  }

  async searchDevelopers(query: string): Promise<DeveloperResponseDto[]> {
    const developers = await this.developerRepo.search(query);

    return developers.map((dev) => ({
      address: dev.address,
      taskCount: dev.taskCount,
      firstTaskAt: dev.firstTaskAt,
      lastTaskAt: dev.lastTaskAt,
      createdAt: dev.createdAt,
    }));
  }

  async getAllDevelopers(
    limit: number = 100,
    offset: number = 0,
  ): Promise<DeveloperResponseDto[]> {
    const developers = await this.developerRepo.findAll(limit, offset);

    return developers.map((dev) => ({
      address: dev.address,
      taskCount: dev.taskCount,
      firstTaskAt: dev.firstTaskAt,
      lastTaskAt: dev.lastTaskAt,
      createdAt: dev.createdAt,
    }));
  }

  async invalidateCache(address: string): Promise<void> {
    await cache.invalidateDeveloperCache(address);
  }
}
