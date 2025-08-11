// backend/src/middleware/caching.ts
import { Request, Response, NextFunction } from 'express';
import { createClient } from 'redis';

interface CacheOptions {
  ttl?: number;
  key?: string;
}

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

// Connect to Redis
redisClient.connect().catch(console.error);

export const cacheMiddleware = (options: CacheOptions = {}) => {
  const { ttl = 300, key } = options; // Default TTL: 5 minutes

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Generate cache key
      const cacheKey = key || `cache:${req.method}:${req.originalUrl}`;

      // Try to get from cache
      const cachedData = await redisClient.get(cacheKey);
      
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        return res.json(parsed);
      }

      // If not in cache, intercept the response
      const originalSend = res.json;
      res.json = function(data: any) {
        // Cache the response
        redisClient.setEx(cacheKey, ttl, JSON.stringify(data))
          .catch(err => console.error('Cache set error:', err));
        
        // Call original send
        return originalSend.call(this, data);
      };

      return next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      return next(); // Continue without caching
    }
  };
};

export const clearCache = async (pattern: string) => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error('Cache clear error:', error);
  }
};

export const getCache = async (key: string) => {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

export const setCache = async (key: string, data: any, ttl: number = 300) => {
  try {
    await redisClient.setEx(key, ttl, JSON.stringify(data));
  } catch (error) {
    console.error('Cache set error:', error);
  }
};
