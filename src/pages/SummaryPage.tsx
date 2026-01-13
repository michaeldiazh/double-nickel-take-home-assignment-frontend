import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ConversationSummary } from '../types';
import { API_BASE_URL } from '../utils/constants';

export function SummaryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const summary = location.state as ConversationSummary | null;

  const handleDownload = useCallback(async () => {
    if (!summary?.applicationId) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/conversation-summary/${summary.applicationId}/messages`
      );
      
      if (!response.ok) {
        if (response.status === 400) {
          throw new Error('Invalid application ID');
        }
        if (response.status === 404) {
          throw new Error('Conversation not found');
        }
        throw new Error('Failed to download messages');
      }

      // Extract filename from Content-Disposition header if available
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `conversation_${summary.applicationId}.txt`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download failed:', err);
      alert(err instanceof Error ? err.message : 'Failed to download messages');
    }
  }, [summary]);

  const handleBack = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  if (!summary) {
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

        <button className="download-btn" onClick={handleDownload}>
          Download Messages
        </button>

        <button className="back-to-dashboard" onClick={handleBack}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
