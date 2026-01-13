import { memo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface Props {
  conversationId: string | null;
  onExit: () => void;
}

function ChatBackButtonComponent({ conversationId, onExit }: Props) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId');

  const handleBack = useCallback(() => {
    // Call onExit to send end_conversation message
    if (conversationId) {
      onExit();
    }
    
    // Navigate back to appropriate page
    if (jobId) {
      // Came from dashboard - go back there
      navigate('/dashboard');
    } else {
      // Came directly - go to home
      navigate('/');
    }
  }, [conversationId, onExit, jobId, navigate]);

  return (
    <button className="chat-back-button" onClick={handleBack} title="Back">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
    </button>
  );
}

export const ChatBackButton = memo(ChatBackButtonComponent);
