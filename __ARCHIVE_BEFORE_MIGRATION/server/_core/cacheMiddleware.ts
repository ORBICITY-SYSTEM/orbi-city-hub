import { middleware, publicProcedure } from "./trpc";
import { cacheGet, cacheSet, CacheOptions } from "./cache";

/**
 * tRPC middleware for caching query results
 * 
 * Usage:
 * ```ts
 * cachedProcedure({ ttl: 300 }).query(async () => {
 *   // This result will be cached for 5 minutes
 *   return await expensiveOperation();
 * });
 * ```
 */

export interface CachedProcedureOptions extends CacheOptions {
  keyPrefix?: string;
}

/**
 * Create a cached procedure
 */
export function cachedProcedure(options: CachedProcedureOptions = {}) {
  const cacheMiddleware = middleware(async ({ ctx, next, path, type }) => {
    // Only cache queries, not mutations
    if (type !== "query") {
      return next();
    }

    // Generate cache key
    const keyPrefix = options.keyPrefix || "trpc";
    const cacheKey = `${keyPrefix}:${path}:${JSON.stringify(ctx)}`;

    // Try to get from cache
    const cached = await cacheGet(cacheKey);
    if (cached !== null) {
      console.log(`[Cache] HIT: ${path}`);
      return cached;
    }

    // If not in cache, execute query
    console.log(`[Cache] MISS: ${path}`);
    const result = await next();

    // Store in cache
    if (result.ok) {
      await cacheSet(cacheKey, result.data, options);
    }

    return result;
  });

  return publicProcedure.use(cacheMiddleware);
}
