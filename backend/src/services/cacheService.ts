// backend/src/services/cacheService.ts
import Redis from 'ioredis';
import { LRUCache } from 'lru-cache';

export class CacheService {
  private redis: Redis;
  private memoryCache: LRUCache<string, any>;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL!);
    this.memoryCache = new LRUCache({
      max: 1000, // Maximum number of items
      ttl: 1000 * 60 * 5, // 5 minutes
      allowStale: false,
      updateAgeOnGet: false,
      updateAgeOnHas: false
    });
  }

  // Multi-level caching: Memory -> Redis -> Database
  async get<T>(key: string): Promise<T | null> {
    // Try memory cache first
    const memoryResult = this.memoryCache.get(key);
    if (memoryResult !== undefined) {
      return memoryResult;
    }

    // Try Redis cache
    try {
      const redisResult = await this.redis.get(key);
      if (redisResult) {
        const parsed = JSON.parse(redisResult);
        // Store in memory cache for faster access
        this.memoryCache.set(key, parsed);
        return parsed;
      }
    } catch (error) {
      console.error('Redis get error:', error);
    }

    return null;
  }

  async set(key: string, value: any, ttl: number = 300): Promise<void> {
    // Store in memory cache
    this.memoryCache.set(key, value);

    // Store in Redis
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    // Remove from memory cache
    this.memoryCache.delete(key);

    // Remove from Redis
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Redis del error:', error);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('Redis pattern invalidation error:', error);
    }

    // Clear memory cache (simple approach - clear all)
    this.memoryCache.clear();
  }

  // Specific caching methods for different data types
  async cacheBookMetadata(bookId: string, metadata: any, ttl: number = 3600): Promise<void> {
    await this.set(`book:metadata:${bookId}`, metadata, ttl);
  }

  async getCachedBookMetadata(bookId: string): Promise<any> {
    return await this.get(`book:metadata:${bookId}`);
  }

  async cacheUserRecommendations(userId: string, recommendations: any[], ttl: number = 1800): Promise<void> {
    await this.set(`user:recommendations:${userId}`, recommendations, ttl);
  }

  async getCachedUserRecommendations(userId: string): Promise<any[]> {
    return await this.get(`user:recommendations:${userId}`) || [];
  }

  async cacheSearchResults(searchKey: string, results: any[], ttl: number = 600): Promise<void> {
    await this.set(`search:${searchKey}`, results, ttl);
  }

  async getCachedSearchResults(searchKey: string): Promise<any[]> {
    return await this.get(`search:${searchKey}`) || [];
  }

  async cacheGeneratedAudio(textHash: string, audioData: Buffer, ttl: number = 86400): Promise<void> {
    try {
      await this.redis.setex(`audio:tts:${textHash}`, ttl, audioData);
    } catch (error) {
      console.error('Audio cache error:', error);
    }
  }

  async getCachedGeneratedAudio(textHash: string): Promise<Buffer | null> {
    try {
      const result = await this.redis.getBuffer(`audio:tts:${textHash}`);
      return result;
    } catch (error) {
      console.error('Audio cache retrieval error:', error);
      return null;
    }
  }

  // Cache warming strategies
  async warmCache(): Promise<void> {
    console.log('Starting cache warming...');

    // Warm popular books cache
    await this.warmPopularBooks();

    // Warm trending content cache
    await this.warmTrendingContent();

    console.log('Cache warming completed');
  }

  private async warmPopularBooks(): Promise<void> {
    // This would typically fetch from database and cache popular books
    // Implementation depends on your specific needs
  }

  private async warmTrendingContent(): Promise<void> {
    // Cache trending books, popular reviews, etc.
  }

  // Cache statistics and monitoring
  async getCacheStats(): Promise<{
    memoryCache: any;
    redisStats: any;
  }> {
    const memoryStats = {
      size: this.memoryCache.size,
      max: this.memoryCache.max,
      calculatedSize: this.memoryCache.calculatedSize
    };

    let redisStats = {};
    try {
      const info = await this.redis.info('memory');
      redisStats = this.parseRedisInfo(info);
    } catch (error) {
      console.error('Failed to get Redis stats:', error);
    }

    return {
      memoryCache: memoryStats,
      redisStats
    };
  }

  private parseRedisInfo(info: string): any {
    const stats: any = {};
    const lines = info.split('\\r\\n');

    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        stats[key] = value;
      }
    }

    return stats;
  }
}

// Usage in controllers
export class BookController {
  constructor(
    private bookService: BookService,
    private cacheService: CacheService
  ) {}

  async getBook(req: Request, res: Response) {
    const { bookId } = req.params;
    const cacheKey = `book:${bookId}`;

    try {
      // Try cache first
      let book = await this.cacheService.get(cacheKey);

      if (!book) {
        // Fetch from database
        book = await this.bookService.getBookById(bookId);

        if (book) {
          // Cache for 1 hour
          await this.cacheService.set(cacheKey, book, 3600);
        }
      }

      if (!book) {
        return res.status(404).json({ error: 'Book not found' });
      }

      res.json({ book });
    } catch (error) {
      console.error('Get book error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async searchBooks(req: Request, res: Response) {
    const searchParams = req.query;
    const searchKey = Buffer.from(JSON.stringify(searchParams)).toString('base64');
    const cacheKey = `search:${searchKey}`;

    try {
      // Try cache first
      let results = await this.cacheService.getCachedSearchResults(cacheKey);

      if (results.length === 0) {
        // Perform search
        results = await this.bookService.searchBooks(searchParams);

        // Cache results for 10 minutes
        await this.cacheService.cacheSearchResults(cacheKey, results, 600);
      }

      res.json({ books: results });
    } catch (error) {
      console.error('Search books error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
