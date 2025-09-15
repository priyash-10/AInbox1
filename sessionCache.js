/**
 * Session-bound cache memory system
 * Stores data in memory with session ID as the key
 */

// Cache storage - Map of session IDs to cache objects
const sessionCaches = new Map()

// Default cache expiration time (30 minutes in milliseconds)
const DEFAULT_EXPIRATION = 30 * 60 * 1000

/**
 * Get a value from the session cache
 * @param {string} sessionId - The session ID
 * @param {string} key - The cache key
 * @returns {any|null} - The cached value or null if not found
 */
const get = (sessionId, key) => {
  if (!sessionId || !key) return null

  const sessionCache = sessionCaches.get(sessionId)
  if (!sessionCache) return null

  const cacheItem = sessionCache.get(key)
  if (!cacheItem) return null

  // Check if the cache item has expired
  if (cacheItem.expiry && cacheItem.expiry < Date.now()) {
    sessionCache.delete(key)
    return null
  }

  return cacheItem.value
}

/**
 * Set a value in the session cache
 * @param {string} sessionId - The session ID
 * @param {string} key - The cache key
 * @param {any} value - The value to cache
 * @param {number} [expiration] - Optional expiration time in milliseconds
 */
const set = (sessionId, key, value, expiration = DEFAULT_EXPIRATION) => {
  if (!sessionId || !key) return

  // Create session cache if it doesn't exist
  if (!sessionCaches.has(sessionId)) {
    sessionCaches.set(sessionId, new Map())
  }

  const sessionCache = sessionCaches.get(sessionId)
  const expiry = expiration ? Date.now() + expiration : null

  sessionCache.set(key, {
    value,
    expiry,
    createdAt: Date.now(),
  })
}

/**
 * Remove a specific item from the session cache
 * @param {string} sessionId - The session ID
 * @param {string} key - The cache key to remove
 */
const remove = (sessionId, key) => {
  if (!sessionId || !key) return

  const sessionCache = sessionCaches.get(sessionId)
  if (sessionCache) {
    sessionCache.delete(key)
  }
}

/**
 * Clear all cache for a specific session
 * @param {string} sessionId - The session ID
 */
const clearSession = (sessionId) => {
  if (!sessionId) return
  sessionCaches.delete(sessionId)
}

/**
 * Clean up expired cache entries across all sessions
 * Should be called periodically (e.g., by a cron job)
 */
const cleanupExpiredCache = () => {
  const now = Date.now()

  sessionCaches.forEach((cache, sessionId) => {
    cache.forEach((item, key) => {
      if (item.expiry && item.expiry < now) {
        cache.delete(key)
      }
    })

    // Remove empty session caches
    if (cache.size === 0) {
      sessionCaches.delete(sessionId)
    }
  })
}

/**
 * Get cache statistics
 * @returns {Object} - Statistics about the cache
 */
const getStats = () => {
  const stats = {
    totalSessions: sessionCaches.size,
    totalCacheItems: 0,
    sessionsBreakdown: [],
  }

  sessionCaches.forEach((cache, sessionId) => {
    stats.totalCacheItems += cache.size
    stats.sessionsBreakdown.push({
      sessionId,
      itemCount: cache.size,
    })
  })

  return stats
}

/**
 * Get all cache entries for a session
 * @param {string} sessionId - The session ID
 * @returns {Object|null} - All cache entries for the session or null if none exists
 */
const getAllForSession = (sessionId) => {
  if (!sessionId) return null;
  
  const sessionCache = sessionCaches.get(sessionId);
  if (!sessionCache) return null;
  
  // Create a copy of the cache entries to return
  const entries = {};
  for (const [key, entry] of sessionCache.entries()) {
    if (!entry.isExpired()) {
      entries[key] = entry.value;
    }
  }
  
  return entries;
};

export default {
  get,
  set,
  remove,
  clearSession,
  cleanupExpiredCache,
  getStats,
  getAllForSession,
}
