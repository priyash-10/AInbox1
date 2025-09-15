/**
 * Email routes with session-bound caching
 */
const express = require("express")
const router = express.Router()
const emailController = require("../controllers/emailController")

// Get a single email (with caching)
router.get("/emails/:emailId", emailController.getEmail)

// Get multiple emails (with caching)
router.post("/emails/batch", emailController.getEmails)

// Clear email cache (specific email or all emails)
router.delete("/emails/cache/:emailId?", emailController.clearCache)

module.exports = router
