import { PrismaClient, Developer, Task } from '@prisma/client';
import { CreateTaskDto, UpdateDeveloperDto } from '../dto';

export class DeveloperRepository {
  constructor(private prisma: PrismaClient) {}

  async findByAddress(address: string): Promise<Developer | null> {
    return this.prisma.developer.findUnique({
      where: { address },
    });
  }

  async findByAddressWithTasks(address: string) {
    return this.prisma.developer.findUnique({
      where: { address },
      include: {
        tasks: {
          orderBy: { timestamp: 'desc' },
          take: 50,
        },
        achievements: {
          orderBy: { unlockedAt: 'desc' },
        },
      },
    });
  }

  async findAll(limit: number = 100, offset: number = 0): Promise<Developer[]> {
    return this.prisma.developer.findMany({
      take: limit,
      skip: offset,
      orderBy: [{ taskCount: 'desc' }, { lastTaskAt: 'desc' }],
    });
  }

  async findTop(limit: number = 10): Promise<Developer[]> {
    return this.prisma.developer.findMany({
      take: limit,
      orderBy: { taskCount: 'desc' },
    });
  }

  async create(address: string): Promise<Developer> {
    return this.prisma.developer.create({
      data: {
        address,
        firstTaskAt: new Date(),
        lastTaskAt: new Date(),
      },
    });
  }

  async upsert(address: string): Promise<Developer> {
    return this.prisma.developer.upsert({
      where: { address },
      create: {
        address,
        firstTaskAt: new Date(),
        lastTaskAt: new Date(),
      },
      update: {
        lastTaskAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(address: string, data: UpdateDeveloperDto): Promise<Developer> {
    return this.prisma.developer.update({
      where: { address },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async incrementTaskCount(address: string): Promise<Developer> {
    return this.prisma.developer.update({
      where: { address },
      data: {
        taskCount: { increment: 1 },
        lastTaskAt: new Date(),
      },
    });
  }

  async recalculateTaskCount(address: string): Promise<Developer> {
    const count = await this.prisma.task.count({
      where: { developerAddress: address },
    });

    return this.prisma.developer.update({
      where: { address },
      data: { taskCount: count },
    });
  }

  async search(query: string, limit: number = 20): Promise<Developer[]> {
    return this.prisma.developer.findMany({
      where: {
        address: {
          contains: query,
          mode: 'insensitive',
        },
      },
      take: limit,
      orderBy: { taskCount: 'desc' },
    });
  }

  async count(): Promise<number> {
    return this.prisma.developer.count();
  }

  async countActive(since: Date): Promise<number> {
    return this.prisma.developer.count({
      where: {
        lastTaskAt: {
          gte: since,
        },
      },
    });
  }
}
