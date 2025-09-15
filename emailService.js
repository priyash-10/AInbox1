/**
 * Email service with session-bound caching
 */
const sessionCache = require("../utils/sessionCache")

// Cache key prefix for emails
const EMAIL_CACHE_PREFIX = "email:"

/**
 * Fetch an email with caching
 * @param {string} sessionId - The user's session ID
 * @param {string} emailId - The ID of the email to fetch
 * @param {Object} options - Options for fetching and caching
 * @returns {Promise<Object>} - The email data
 */
const fetchEmailWithCache = async (sessionId, emailId, options = {}) => {
  const {
    forceRefresh = false,
    cacheExpiration = 15 * 60 * 1000, // 15 minutes default
  } = options

  const cacheKey = `${EMAIL_CACHE_PREFIX}${emailId}`

  // Try to get from cache first (unless forceRefresh is true)
  if (!forceRefresh) {
    const cachedEmail = sessionCache.get(sessionId, cacheKey)
    if (cachedEmail) {
      console.log(`Cache hit for email ${emailId} in session ${sessionId}`)
      return cachedEmail
    }
  }

  // Cache miss or forced refresh, fetch the email
  console.log(`Cache miss for email ${emailId} in session ${sessionId}, fetching...`)

  try {
    // Replace this with your actual email fetching logic
    const email = await fetchEmailFromSource(emailId)

    // Store in cache
    sessionCache.set(sessionId, cacheKey, email, cacheExpiration)

    return email
  } catch (error) {
    console.error(`Error fetching email ${emailId}:`, error)
    throw error
  }
}

/**
 * Fetch multiple emails with caching
 * @param {string} sessionId - The user's session ID
 * @param {Array<string>} emailIds - Array of email IDs to fetch
 * @param {Object} options - Options for fetching and caching
 * @returns {Promise<Array<Object>>} - Array of email data
 */
const fetchMultipleEmailsWithCache = async (sessionId, emailIds, options = {}) => {
  const emails = []
  const fetchPromises = []

  for (const emailId of emailIds) {
    fetchPromises.push(
      fetchEmailWithCache(sessionId, emailId, options)
        .then((email) => emails.push(email))
        .catch((error) => {
          console.error(`Error fetching email ${emailId}:`, error)
          // Push null for failed emails to maintain order
          emails.push(null)
        }),
    )
  }

  await Promise.all(fetchPromises)
  return emails.filter((email) => email !== null)
}

/**
 * Clear cached emails for a session
 * @param {string} sessionId - The user's session ID
 * @param {string} [emailId] - Optional specific email ID to clear
 */
const clearEmailCache = (sessionId, emailId = null) => {
  if (emailId) {
    // Clear specific email
    const cacheKey = `${EMAIL_CACHE_PREFIX}${emailId}`
    sessionCache.remove(sessionId, cacheKey)
  } else {
    // Clear all email cache for this session
    // This is a simplified approach - in a real implementation,
    // you might want to only clear email-related cache items
    sessionCache.clearSession(sessionId)
  }
}

/**
 * Mock function to simulate fetching an email from a data source
 * Replace this with your actual implementation
 * @param {string} emailId - The ID of the email to fetch
 * @returns {Promise<Object>} - The email data
 */
const fetchEmailFromSource = async (emailId) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Mock email data
  return {
    id: emailId,
    subject: `Email subject ${emailId}`,
    body: `This is the body of email ${emailId}`,
    sender: "sender@example.com",
    receivedAt: new Date().toISOString(),
    attachments: [],
  }
}

module.exports = {
  fetchEmailWithCache,
  fetchMultipleEmailsWithCache,
  clearEmailCache,
}
