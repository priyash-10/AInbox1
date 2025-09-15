/**
 * Email writing service for composing and sending emails via Gmail API
 */
import { google } from "googleapis";
import sessionCache from "../utils/sessionCache.js";

// Cache key prefix for draft emails
const EMAIL_DRAFT_CACHE_PREFIX = "email_draft:";

// Cache expiration time (in milliseconds)
const CACHE_EXPIRY = {
  DRAFT: 24 * 60 * 60 * 1000, // 24 hours
};

/**
 * Send an email using Gmail API with OAuth2
 * @param {Object} tokens - OAuth2 tokens
 * @param {Object} emailData - The email data to send
 * @returns {Promise<Object>} - The result of the email send operation
 */
const sendEmail = async (tokens, emailData) => {
  if (!tokens) {
    throw new Error("No authentication tokens provided");
  }

  const { to, cc, bcc, subject, body, from } = emailData;

  if (!to || !subject || !body) {
    throw new Error("Missing required email fields (to, subject, body)");
  }

  try {
    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.REDIRECT_URIS
    );
    
    oauth2Client.setCredentials(tokens);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    // Simple email format
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [];
    
    // Basic headers
    messageParts.push(`From: ${from || tokens.email}`);
    messageParts.push(`To: ${to}`);
    if (cc) messageParts.push(`Cc: ${cc}`);
    if (bcc) messageParts.push(`Bcc: ${bcc}`);
    
    messageParts.push('MIME-Version: 1.0');
    messageParts.push('Content-Type: text/html; charset=utf-8');
    messageParts.push(`Subject: ${subject}`);
    messageParts.push('');
    messageParts.push(body);
    
    const message = messageParts.join('\r\n');
    
    // The message needs to be base64url encoded
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    
    // Send the email using Gmail API
    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });
    
    console.log(`Email sent with message ID: ${res.data.id}`);
    
    return {
      success: true,
      messageId: res.data.id,
      threadId: res.data.threadId
    };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

/**
 * Save a draft email in session cache
 * @param {string} sessionId - The user's session ID
 * @param {string} draftId - Optional draft ID for updating existing draft
 * @param {Object} emailData - The email data to save as draft
 * @returns {Object} - The saved draft data with ID
 */
const saveDraft = (sessionId, draftId, emailData) => {
  if (!sessionId) {
    throw new Error("No session ID provided");
  }

  // Generate a new draft ID if not provided
  const newDraftId = draftId || `draft_${Date.now()}`;
  const cacheKey = `${EMAIL_DRAFT_CACHE_PREFIX}${newDraftId}`;

  // Prepare draft data with ID and timestamp
  const draftData = {
    id: newDraftId,
    ...emailData,
    lastModified: new Date().toISOString(),
  };

  // Save to session cache
  sessionCache.set(sessionId, cacheKey, draftData, CACHE_EXPIRY.DRAFT);
  
  return draftData;
};

/**
 * Retrieve a draft email from session cache
 * @param {string} sessionId - The user's session ID
 * @param {string} draftId - The draft ID to retrieve
 * @returns {Object|null} - The draft data or null if not found
 */
const getDraft = (sessionId, draftId) => {
  if (!sessionId || !draftId) {
    return null;
  }

  const cacheKey = `${EMAIL_DRAFT_CACHE_PREFIX}${draftId}`;
  return sessionCache.get(sessionId, cacheKey);
};

/**
 * List all draft emails for a session
 * @param {string} sessionId - The user's session ID
 * @returns {Array<Object>} - Array of draft email data
 */
const listDrafts = (sessionId) => {
  if (!sessionId) {
    return [];
  }

  // This is a simplified approach - in a real implementation, 
  // you might want to maintain a separate index of drafts
  const allCacheEntries = sessionCache.getAllForSession(sessionId) || {};
  
  // Filter entries that start with the draft prefix
  const drafts = Object.entries(allCacheEntries)
    .filter(([key]) => key.startsWith(EMAIL_DRAFT_CACHE_PREFIX))
    .map(([_, value]) => value);
  
  return drafts;
};

/**
 * Delete a draft email from session cache
 * @param {string} sessionId - The user's session ID
 * @param {string} draftId - The draft ID to delete
 * @returns {boolean} - Whether the deletion was successful
 */
const deleteDraft = (sessionId, draftId) => {
  if (!sessionId || !draftId) {
    return false;
  }

  const cacheKey = `${EMAIL_DRAFT_CACHE_PREFIX}${draftId}`;
  sessionCache.remove(sessionId, cacheKey);
  return true;
};

export default {
  sendEmail,
  saveDraft,
  getDraft,
  listDrafts,
  deleteDraft,
}; 