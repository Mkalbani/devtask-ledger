import { PrismaClient, Task } from '@prisma/client';
import { CreateTaskDto } from '../dto';

export class TaskRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: number): Promise<Task | null> {
    return this.prisma.task.findUnique({
      where: { id },
    });
  }

  async findByTxId(txId: string): Promise<Task | null> {
    return this.prisma.task.findFirst({
      where: { txId },
    });
  }

  async findByDeveloper(
    developerAddress: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: { developerAddress },
      take: limit,
      skip: offset,
      orderBy: { timestamp: 'desc' },
    });
  }

  async findRecent(limit: number = 20): Promise<Task[]> {
    return this.prisma.task.findMany({
      take: limit,
      orderBy: { timestamp: 'desc' },
      include: {
        developer: true,
      },
    });
  }

  async create(data: CreateTaskDto): Promise<Task> {
    return this.prisma.task.create({
      data: {
        developerAddress: data.developerAddress,
        taskId: data.taskId,
        title: data.title,
        description: data.description,
        blockHeight: data.blockHeight,
        txId: data.txId,
        timestamp: data.timestamp,
      },
    });
  }

  async createWithDeveloper(data: CreateTaskDto): Promise<Task> {
    // Use transaction to create task and update developer atomically
    return this.prisma.$transaction(async (tx) => {
      // Upsert developer
      await tx.developer.upsert({
        where: { address: data.developerAddress },
        create: {
          address: data.developerAddress,
          taskCount: 1,
          firstTaskAt: data.timestamp,
          lastTaskAt: data.timestamp,
        },
        update: {
          taskCount: { increment: 1 },
          lastTaskAt: data.timestamp,
        },
      });

      // Create task
      return tx.task.create({
        data: {
          developerAddress: data.developerAddress,
          taskId: data.taskId,
          title: data.title,
          description: data.description,
          blockHeight: data.blockHeight,
          txId: data.txId,
          timestamp: data.timestamp,
        },
      });
    });
  }

  async exists(developerAddress: string, taskId: number): Promise<boolean> {
    const count = await this.prisma.task.count({
      where: {
        developerAddress,
        taskId,
      },
    });
    return count > 0;
  }

  async count(): Promise<number> {
    return this.prisma.task.count();
  }

  async countByDeveloper(developerAddress: string): Promise<number> {
    return this.prisma.task.count({
      where: { developerAddress },
    });
  }

  async countSince(since: Date): Promise<number> {
    return this.prisma.task.count({
      where: {
        timestamp: {
          gte: since,
        },
      },
    });
  }

  async getLatestBlockHeight(): Promise<bigint | null> {
    const latest = await this.prisma.task.findFirst({
      orderBy: { blockHeight: 'desc' },
      select: { blockHeight: true },
    });
    return latest?.blockHeight || null;
  }
}
