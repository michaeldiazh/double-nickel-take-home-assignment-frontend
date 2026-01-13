import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ConversationSummary } from '../types';
import { API_BASE_URL } from '../utils/constants';
import { useAuth } from '../contexts/AuthContext';
import { getUserData } from '../services/api';

export function SummaryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialSummary = location.state as ConversationSummary | null;
  const { user, setUser } = useAuth();
  const [summary, setSummary] = useState<ConversationSummary | null>(initialSummary);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  const refreshUser = useCallback(async () => {
    if (user?.id) {
      const newUser = await getUserData(user.id);
      setUser(newUser);
    }
  }, [user?.id, setUser]);

  const fetchConversation = useCallback(async (applicationId: string) => {
    setIsLoadingSummary(true);
    try {
      const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/conversation`);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.warn('Conversation not found for application:', applicationId);
          setIsLoadingSummary(false);
          return;
        }
        throw new Error('Failed to fetch conversation summary');
      }

      const conversationData = await response.json();
      
      // Map snake_case response to camelCase ConversationSummary
      const updatedSummary: ConversationSummary = {
        applicationId: conversationData.application_id || applicationId,
        screeningDecision: conversationData.screening_decision || 'PENDING',
        screeningSummary: conversationData.screening_summary || null,
      };
      
      setSummary(updatedSummary);
    } catch (err) {
      console.error('Failed to fetch conversation:', err);
    } finally {
      setIsLoadingSummary(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Fetch conversation data when component mounts or when we have an applicationId
  useEffect(() => {
    if (summary?.applicationId) {
      fetchConversation(summary.applicationId);
    } else if (initialSummary?.applicationId) {
      fetchConversation(initialSummary.applicationId);
    }
  }, [summary?.applicationId, initialSummary?.applicationId, fetchConversation]);

  const handleDownload = useCallback(async () => {
    const applicationId = summary?.applicationId;
    
    if (!applicationId) {
      alert('Application ID not available. Please try again.');
      console.error('Download failed: No applicationId in summary', summary);
      return;
    }

    try {
      console.log('Downloading messages for application:', applicationId);
      const response = await fetch(
        `${API_BASE_URL}/conversation-summary/${applicationId}/messages`
      );
      
      console.log('Download response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 400) {
          throw new Error('Invalid application ID');
        }
        if (response.status === 404) {
          throw new Error('Conversation not found. The conversation may not be available yet.');
        }
        const errorText = await response.text();
        console.error('Download error response:', errorText);
        throw new Error(`Failed to download messages: ${response.status} ${response.statusText}`);
      }

      // Extract filename from Content-Disposition header if available
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `conversation_${applicationId}.txt`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      const blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error('Downloaded file is empty');
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Clean up after a short delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
      console.log('Download successful:', filename);
    } catch (err) {
      console.error('Download failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to download messages';
      alert(errorMessage);
    }
  }, [summary]);

  const handleBack = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  if (!summary && !isLoadingSummary) {
    return (
      <div className="summary-page">
        <div className="summary-container">
          <h1>No Summary Available</h1>
          <button onClick={handleBack} className="back-to-dashboard">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (isLoadingSummary) {
    return (
      <div className="summary-page">
        <div className="summary-container">
          <h1>Loading Summary...</h1>
          <button onClick={handleBack} className="back-to-dashboard">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const isApproved = summary.screeningDecision === 'APPROVED';
  const isDenied = summary.screeningDecision === 'DENIED';

  return (
    <div className="summary-page">
      <div className="summary-container">
        <h2>Summary Status</h2>
        
        <div className="status-buttons">
          <button className={`status-btn ${isApproved ? 'active approved' : ''}`}>
            Approved
          </button>
          <button className={`status-btn ${isDenied ? 'active denied' : ''}`}>
            Denied
          </button>
        </div>

        <h3>Overall Summary</h3>
        
        <div className="summary-text-box">
          {summary.screeningSummary || 'No summary available.'}
        </div>

        <button 
          className="download-btn" 
          onClick={handleDownload}
          disabled={!summary?.applicationId}
        >
          Download Messages
        </button>

        <button className="back-to-dashboard" onClick={handleBack}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
