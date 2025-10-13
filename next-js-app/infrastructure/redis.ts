import { createClient, RedisClientType } from 'redis';

// Create a singleton Redis client that can be shared across domains
let redisClient: RedisClientType | null = null;
let connectionFailed = false;

// Define a minimal Redis client interface for dependency injection
export interface RedisClient {
    get(key: string): Promise<string | null>;
    set(key: string, value: string, options?: { EX: number }): Promise<any>;
    del(key: string): Promise<any>;
  }

// Initialize the Redis client
async function initRedisClient() {
  if (redisClient || connectionFailed) {
    return redisClient;
  }

  try {
    const url = process.env.NEXT_PUBLIC_REDIS_URL || 'redis://localhost:6379';
    console.log(`Attempting to connect to Redis at ${url}`);    
    
    redisClient = createClient({
      url,
      socket: {
        reconnectStrategy: (retries) => {
          // Only try to reconnect a few times then give up
          if (retries > 3) {
            connectionFailed = true;
            console.warn('Redis connection failed after multiple attempts, disabling cache');
            return false; // Stop reconnecting
          }
          return Math.min(retries * 100, 3000); // Wait longer between retries
        },
        connectTimeout: 5000, // 5 seconds timeout
      }
    });

    redisClient.on('error', (err: Error) => {
      console.error('Redis client error:', err);
    });

    redisClient.on('connect', () => {
      console.log('Redis client connected successfully');
      connectionFailed = false;
    });

    await redisClient.connect();
    console.log('Redis client initialized');
  } catch (error) {
    console.error('Failed to initialize Redis client:', error);
    connectionFailed = true;
    redisClient = null;
  }
  
  return redisClient;
}

// Initialize the client right away
const redisPromise = initRedisClient();

// Create a no-op redis client for graceful fallback
const noopRedis: RedisClient = {
  get: async () => null,
  set: async () => null,
  del: async () => 0
};

// Export a singleton instance with graceful fallback
export const redis: RedisClient = {
  get: async (key: string) => {
    try {
      const client = await redisPromise;
      if (!client) return null;
      return client.get(key);
    } catch (error) {
      console.error('Redis get error, using database fallback:', error);
      return null;
    }
  },
  set: async (key: string, value: string, options?: { EX: number }) => {
    try {
      const client = await redisPromise;
      if (!client) return null;
      return client.set(key, value, options);
    } catch (error) {
      console.error('Redis set error:', error);
      return null;
    }
  },
  del: async (key: string) => {
    try {
      const client = await redisPromise;
      if (!client) return 0;
      return client.del(key);
    } catch (error) {
      console.error('Redis del error:', error);
      return 0;
    }
  }
};

export async function closeRedisConnection() {
  if (redisClient) {
    try {
      await redisClient.quit();
    } catch (error) {
      console.error('Error closing Redis connection:', error);
    } finally {
      redisClient = null;
    }
  }
}