/**
 * Middleware to handle session cache cleanup
 */
import sessionCache from "./sessionCache.js"

/**
 * Middleware to clean up expired cache entries periodically
 * @param {Object} options - Options for the middleware
 * @returns {Function} - Express middleware function
 */
const cacheCleanupMiddleware = (options = {}) => {
  const {
    cleanupInterval = 15 * 60 * 1000, // 15 minutes default
  } = options

  // Start periodic cleanup
  const intervalId = setInterval(() => {
    console.log("Running scheduled cache cleanup")
    sessionCache.cleanupExpiredCache()
  }, cleanupInterval)

  // Ensure cleanup on process exit
  process.on("SIGINT", () => {
    clearInterval(intervalId)
    process.exit(0)
  })

  return (req, res, next) => {
    // Attach cache utilities to the request object for convenience
    req.sessionCache = {
      get: (key) => sessionCache.get(req.sessionID, key),
      set: (key, value, expiration) => sessionCache.set(req.sessionID, key, value, expiration),
      remove: (key) => sessionCache.remove(req.sessionID, key),
      clear: () => sessionCache.clearSession(req.sessionID),
    }

    next()
  }
}

export default cacheCleanupMiddleware
