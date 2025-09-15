import { useState, useEffect } from 'react';
import axios from 'axios';

interface EmailDraft {
  id: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  lastModified: string;
}

export function useEmailDrafts() {
  const [drafts, setDrafts] = useState<EmailDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDrafts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('http://localhost:5000/api/email/drafts', {
        withCredentials: true,
      });
      
      setDrafts(response.data);
    } catch (err) {
      console.error('Failed to fetch drafts:', err);
      setError('Failed to load drafts');
    } finally {
      setLoading(false);
    }
  };

  const deleteDraft = async (draftId: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/email/draft/${draftId}`, {
        withCredentials: true,
      });
      
      // Update the local state
      setDrafts(drafts.filter(draft => draft.id !== draftId));
      return true;
    } catch (err) {
      console.error('Failed to delete draft:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  return {
    drafts,
    loading,
    error,
    fetchDrafts,
    deleteDraft,
  };
} 