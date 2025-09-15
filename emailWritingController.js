/**
 * Email writing controller for composing and sending emails
 */
import emailWritingService from "../services/emailWritingService.js";

/**
 * Send an email
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const sendEmail = async (req, res) => {
  try {
    const { to, cc, bcc, subject, body, attachments } = req.body;
    
    if (!to || !subject || !body) {
      return res.status(400).json({ error: "Missing required email fields (to, subject, body)" });
    }
    
    // Use tokens from the session
    const tokens = req.session.tokens;
    if (!tokens) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const result = await emailWritingService.sendEmail(tokens, {
      to,
      cc,
      bcc,
      subject,
      body,
      attachments,
      from: req.session.email,
    });
    
    // Add to sent emails cache to make it immediately visible in the UI
    const SENT_CACHE_KEY = "sent_email_list";
    const existingSentEmails = req.sessionCache.get(SENT_CACHE_KEY) || [];
    
    // Add the newly sent email to the top of the list
    const newSentEmail = {
      id: result.messageId,
      subject,
      to,
      date: new Date().toISOString(),
      snippet: body.substring(0, 100).replace(/<[^>]*>/g, ''),
    };
    
    // Update the cache with the new email at the beginning
    req.sessionCache.set(
      SENT_CACHE_KEY, 
      [newSentEmail, ...existingSentEmails],
      60 * 60 * 1000 // 1 hour cache
    );
    
    res.json(result);
  } catch (error) {
    console.error("Error in sendEmail controller:", error);
    res.status(500).json({ error: "Failed to send email", message: error.message });
  }
};

/**
 * Save email draft
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const saveDraft = (req, res) => {
  try {
    const { draftId, to, cc, bcc, subject, body, attachments } = req.body;
    const sessionId = req.sessionID;
    
    if (!sessionId) {
      return res.status(401).json({ error: "No session found" });
    }
    
    const draftData = emailWritingService.saveDraft(sessionId, draftId, {
      to,
      cc,
      bcc,
      subject,
      body,
      attachments,
    });
    
    res.json(draftData);
  } catch (error) {
    console.error("Error in saveDraft controller:", error);
    res.status(500).json({ error: "Failed to save draft", message: error.message });
  }
};

/**
 * Get email draft
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDraft = (req, res) => {
  try {
    const { draftId } = req.params;
    const sessionId = req.sessionID;
    
    if (!sessionId) {
      return res.status(401).json({ error: "No session found" });
    }
    
    const draft = emailWritingService.getDraft(sessionId, draftId);
    
    if (!draft) {
      return res.status(404).json({ error: "Draft not found" });
    }
    
    res.json(draft);
  } catch (error) {
    console.error("Error in getDraft controller:", error);
    res.status(500).json({ error: "Failed to get draft", message: error.message });
  }
};

/**
 * List all email drafts
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const listDrafts = (req, res) => {
  try {
    const sessionId = req.sessionID;
    
    if (!sessionId) {
      return res.status(401).json({ error: "No session found" });
    }
    
    const drafts = emailWritingService.listDrafts(sessionId);
    res.json(drafts);
  } catch (error) {
    console.error("Error in listDrafts controller:", error);
    res.status(500).json({ error: "Failed to list drafts", message: error.message });
  }
};

/**
 * Delete email draft
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteDraft = (req, res) => {
  try {
    const { draftId } = req.params;
    const sessionId = req.sessionID;
    
    if (!sessionId) {
      return res.status(401).json({ error: "No session found" });
    }
    
    const success = emailWritingService.deleteDraft(sessionId, draftId);
    
    if (!success) {
      return res.status(404).json({ error: "Draft not found or could not be deleted" });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error in deleteDraft controller:", error);
    res.status(500).json({ error: "Failed to delete draft", message: error.message });
  }
};

export default {
  sendEmail,
  saveDraft,
  getDraft,
  listDrafts,
  deleteDraft,
}; 