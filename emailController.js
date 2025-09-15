/**
 * Email controller with session-bound caching
 */
const emailService = require("../services/emailService")

/**
 * Get a single email
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEmail = async (req, res) => {
  try {
    const { emailId } = req.params
    const sessionId = req.sessionID

    if (!sessionId) {
      return res.status(401).json({ error: "No session found" })
    }

    const forceRefresh = req.query.refresh === "true"

    const email = await emailService.fetchEmailWithCache(sessionId, emailId, { forceRefresh })

    res.json(email)
  } catch (error) {
    console.error("Error in getEmail controller:", error)
    res.status(500).json({ error: "Failed to fetch email" })
  }
}

/**
 * Get multiple emails
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEmails = async (req, res) => {
  try {
    const { emailIds } = req.body
    const sessionId = req.sessionID

    if (!sessionId) {
      return res.status(401).json({ error: "No session found" })
    }

    if (!Array.isArray(emailIds) || emailIds.length === 0) {
      return res.status(400).json({ error: "Invalid or empty emailIds array" })
    }

    const forceRefresh = req.query.refresh === "true"

    const emails = await emailService.fetchMultipleEmailsWithCache(sessionId, emailIds, { forceRefresh })

    res.json(emails)
  } catch (error) {
    console.error("Error in getEmails controller:", error)
    res.status(500).json({ error: "Failed to fetch emails" })
  }
}

/**
 * Clear email cache
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const clearCache = (req, res) => {
  try {
    const { emailId } = req.params
    const sessionId = req.sessionID

    if (!sessionId) {
      return res.status(401).json({ error: "No session found" })
    }

    emailService.clearEmailCache(sessionId, emailId || null)

    res.json({ success: true, message: "Cache cleared successfully" })
  } catch (error) {
    console.error("Error in clearCache controller:", error)
    res.status(500).json({ error: "Failed to clear cache" })
  }
}

module.exports = {
  getEmail,
  getEmails,
  clearCache,
}
