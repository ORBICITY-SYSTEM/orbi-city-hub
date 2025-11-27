import Redis from "ioredis";

/**
 * Redis cache manager
 * Provides caching layer for frequently accessed data
 */

let redis: Redis | null = null;

/**
 * Initialize Redis connection
 */
export function initRedis() {
  if (redis) {
    return redis;
  }

  const redisUrl = process.env.REDIS_URL;
  
  if (!redisUrl) {
    console.log("[Cache] Redis not configured, caching disabled");
    return null;
  }

  try {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) {
          console.error("[Cache] Redis connection failed after 3 retries");
          return null;
        }
        return Math.min(times * 200, 2000);
      },
    });

    redis.on("connect", () => {
      console.log("[Cache] Redis connected successfully");
    });

    redis.on("error", (err) => {
      console.error("[Cache] Redis error:", err);
    });

    return redis;
  } catch (error) {
    console.error("[Cache] Failed to initialize Redis:", error);
    return null;
  }
}

/**
 * Get Redis client
 */
export function getRedis(): Redis | null {
  return redis;
}

/**
 * Cache helper functions
 */

export interface CacheOptions {
  ttl?: number; // Time to live in seconds (default: 1 hour)
}

/**
 * Get value from cache
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redis) return null;

  try {
    const value = await redis.get(key);
    if (!value) return null;
    
    return JSON.parse(value) as T;
  } catch (error) {
    console.error(`[Cache] Error getting key ${key}:`, error);
    return null;
  }
}

/**
 * Set value in cache
 */
export async function cacheSet(
  key: string,
  value: any,
  options: CacheOptions = {}
): Promise<boolean> {
  if (!redis) return false;

  try {
    const ttl = options.ttl || 3600; // Default 1 hour
    const serialized = JSON.stringify(value);
    
    await redis.setex(key, ttl, serialized);
    return true;
  } catch (error) {
    console.error(`[Cache] Error setting key ${key}:`, error);
    return false;
  }
}

/**
 * Delete value from cache
 */
export async function cacheDel(key: string): Promise<boolean> {
  if (!redis) return false;

  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.error(`[Cache] Error deleting key ${key}:`, error);
    return false;
  }
}

/**
 * Delete multiple keys matching pattern
 */
export async function cacheDelPattern(pattern: string): Promise<number> {
  if (!redis) return 0;

  try {
    const keys = await redis.keys(pattern);
    if (keys.length === 0) return 0;
    
    await redis.del(...keys);
    return keys.length;
  } catch (error) {
    console.error(`[Cache] Error deleting pattern ${pattern}:`, error);
    return 0;
  }
}

/**
 * Get or set cache (cache-aside pattern)
 */
export async function cacheGetOrSet<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  // Try to get from cache first
  const cached = await cacheGet<T>(key);
  if (cached !== null) {
    return cached;
  }

  // If not in cache, fetch and store
  const value = await fetcher();
  await cacheSet(key, value, options);
  
  return value;
}

/**
 * Cache statistics
 */
export async function getCacheStats() {
  if (!redis) {
    return {
      connected: false,
      keys: 0,
      memory: "0",
    };
  }

  try {
    const info = await redis.info("stats");
    const dbSize = await redis.dbsize();
    const memory = await redis.info("memory");
    
    return {
      connected: true,
      keys: dbSize,
      memory: memory.match(/used_memory_human:(.+)/)?.[1] || "unknown",
    };
  } catch (error) {
    console.error("[Cache] Error getting stats:", error);
    return {
      connected: false,
      keys: 0,
      memory: "0",
    };
  }
}

/**
 * Clear all cache
 */
export async function cacheClear(): Promise<boolean> {
  if (!redis) return false;

  try {
    await redis.flushdb();
    console.log("[Cache] All cache cleared");
    return true;
  } catch (error) {
    console.error("[Cache] Error clearing cache:", error);
    return false;
  }
}
