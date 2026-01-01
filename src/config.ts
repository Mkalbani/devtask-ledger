import dotenv from 'dotenv';

dotenv.config();

export const CONFIG = {
  // Server
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Stacks
  CONTRACT_ADDRESS:
    process.env.CONTRACT_ADDRESS || 'ST3C1W3GS1ZWN14DSJ9744K21F03HSS37A6SKVMKQ',
  CONTRACT_NAME: process.env.CONTRACT_NAME || 'devtask-ledger',
  NETWORK: process.env.NETWORK || 'testnet',
  STACKS_API_URL: process.env.STACKS_API_URL || 'https://api.testnet.hiro.so',

  // Database
  DATABASE_URL:
    process.env.DATABASE_URL || 'postgresql://localhost:5432/devtask_ledger',

  // Redis
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',

  // Caching
  CACHE_TTL: 60, // seconds

  // Indexer
  INDEXER_INTERVAL: 30000, // 30 seconds
  INDEXER_BATCH_SIZE: 100,
};
