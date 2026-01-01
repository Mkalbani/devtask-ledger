import { createClient } from 'redis';
import { CONFIG } from '../config';

class CacheService {
  private client: ReturnType<typeof createClient>;
  private isConnected = false;

  constructor() {
    this.client = createClient({
      url: CONFIG.REDIS_URL,
    });

    this.client.on('error', (err) => {
      console.error('Redis error:', err);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      console.log('Redis connected');
      this.isConnected = true;
    });
  }

  async connect() {
    if (!this.isConnected) {
      await this.client.connect();
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) return null;

    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(
    key: string,
    value: any,
    ttl: number = CONFIG.CACHE_TTL,
  ): Promise<void> {
    if (!this.isConnected) return;

    try {
      await this.client.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isConnected) return;

    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async delPattern(pattern: string): Promise<void> {
    if (!this.isConnected) return;

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      console.error('Cache delete pattern error:', error);
    }
  }

  // Specialized cache methods
  async getDeveloperStats(address: string) {
    return this.get(`dev:${address}`);
  }

  async setDeveloperStats(address: string, stats: any) {
    return this.set(`dev:${address}`, stats, 120); // 2 min cache
  }

  async getGlobalStats() {
    return this.get('global:stats');
  }

  async setGlobalStats(stats: any) {
    return this.set('global:stats', stats, 60); // 1 min cache
  }

  async getLeaderboard() {
    return this.get('leaderboard');
  }

  async setLeaderboard(data: any) {
    return this.set('leaderboard', data, 120);
  }

  async invalidateDeveloperCache(address: string) {
    await this.del(`dev:${address}`);
    await this.delPattern('leaderboard*');
    await this.del('global:stats');
  }

  async close() {
    if (this.isConnected) {
      await this.client.quit();
    }
  }
}

export const cache = new CacheService();
