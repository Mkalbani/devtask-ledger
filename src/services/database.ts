import { Pool } from 'pg';
import { CONFIG } from '../config';

class DatabaseService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: CONFIG.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.pool.on('error', (err) => {
      console.error('Unexpected database error:', err);
    });
  }

  async query(text: string, params?: any[]) {
    const start = Date.now();
    const res = await this.pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Query executed', { text, duration, rows: res.rowCount });
    return res;
  }

  // Developer operations
  async upsertDeveloper(address: string) {
    const query = `
      INSERT INTO developers (address, first_task_at, last_task_at)
      VALUES ($1, NOW(), NOW())
      ON CONFLICT (address) 
      DO UPDATE SET 
        last_task_at = NOW(),
        updated_at = NOW()
      RETURNING *
    `;
    return this.query(query, [address]);
  }

  async getDeveloper(address: string) {
    const query = 'SELECT * FROM developers WHERE address = $1';
    const result = await this.query(query, [address]);
    return result.rows[0];
  }

  async getAllDevelopers(limit = 100, offset = 0) {
    const query = `
      SELECT * FROM developers 
      ORDER BY task_count DESC, last_task_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await this.query(query, [limit, offset]);
    return result.rows;
  }

  async getTopDevelopers(limit = 10) {
    const query = `
      SELECT * FROM developers 
      ORDER BY task_count DESC 
      LIMIT $1
    `;
    const result = await this.query(query, [limit]);
    return result.rows;
  }

  async updateDeveloperTaskCount(address: string) {
    const query = `
      UPDATE developers 
      SET task_count = (
        SELECT COUNT(*) FROM tasks WHERE developer_address = $1
      ),
      updated_at = NOW()
      WHERE address = $1
      RETURNING *
    `;
    return this.query(query, [address]);
  }

  // Task operations
  async insertTask(data: {
    developer_address: string;
    task_id: number;
    title: string;
    description: string;
    block_height: number;
    tx_id: string;
    timestamp: Date;
  }) {
    const query = `
      INSERT INTO tasks (
        developer_address, task_id, title, description, 
        block_height, tx_id, timestamp
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (developer_address, task_id) 
      DO NOTHING
      RETURNING *
    `;
    return this.query(query, [
      data.developer_address,
      data.task_id,
      data.title,
      data.description,
      data.block_height,
      data.tx_id,
      data.timestamp,
    ]);
  }

  async getTasksByDeveloper(address: string, limit = 50) {
    const query = `
      SELECT * FROM tasks 
      WHERE developer_address = $1 
      ORDER BY timestamp DESC 
      LIMIT $2
    `;
    const result = await this.query(query, [address, limit]);
    return result.rows;
  }

  async getRecentTasks(limit = 20) {
    const query = `
      SELECT t.*, d.address as developer_address
      FROM tasks t
      JOIN developers d ON t.developer_address = d.address
      ORDER BY t.timestamp DESC
      LIMIT $1
    `;
    const result = await this.query(query, [limit]);
    return result.rows;
  }

  async getTaskByTxId(txId: string) {
    const query = 'SELECT * FROM tasks WHERE tx_id = $1';
    const result = await this.query(query, [txId]);
    return result.rows[0];
  }

  // Achievement operations
  async unlockAchievement(address: string, achievementId: string) {
    const query = `
      INSERT INTO achievements (developer_address, achievement_id)
      VALUES ($1, $2)
      ON CONFLICT (developer_address, achievement_id) 
      DO NOTHING
      RETURNING *
    `;
    return this.query(query, [address, achievementId]);
  }

  async getDeveloperAchievements(address: string) {
    const query = `
      SELECT * FROM achievements 
      WHERE developer_address = $1 
      ORDER BY unlocked_at DESC
    `;
    const result = await this.query(query, [address]);
    return result.rows;
  }

  // Activity log
  async logActivity(address: string, actionType: string, metadata: any = {}) {
    const query = `
      INSERT INTO activity_log (developer_address, action_type, metadata)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    return this.query(query, [address, actionType, JSON.stringify(metadata)]);
  }

  async getRecentActivity(limit = 50) {
    const query = `
      SELECT * FROM activity_log 
      ORDER BY timestamp DESC 
      LIMIT $1
    `;
    const result = await this.query(query, [limit]);
    return result.rows;
  }

  // Global stats
  async getGlobalStats() {
    const query = 'SELECT * FROM global_stats';
    const result = await this.query(query);
    return result.rows[0];
  }

  // Search
  async searchDevelopers(searchTerm: string) {
    const query = `
      SELECT * FROM developers 
      WHERE address ILIKE $1 
      ORDER BY task_count DESC 
      LIMIT 20
    `;
    const result = await this.query(query, [`%${searchTerm}%`]);
    return result.rows;
  }

  // Health check
  async healthCheck() {
    const query = 'SELECT NOW() as time';
    const result = await this.query(query);
    return result.rows[0];
  }

  async close() {
    await this.pool.end();
  }
}

export const db = new DatabaseService();
