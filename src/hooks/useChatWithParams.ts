import { useState, useCallback, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { ChatMessage, ServerMessage, ConnectionStatus, ConversationSummary } from '../types';
import { WS_URL } from '../utils/constants';
import { generateId } from '../utils/id';
import { useAuth } from '../contexts/AuthContext';
import { getUserData } from '../services/api';

interface UseChatWithParamsReturn {
  messages: ChatMessage[];
  status: ConnectionStatus;
  error: string | null;
  conversationId: string | null;
  isStreaming: boolean;
  sendUserMessage: (text: string) => void;
  endConversation: () => void;
}

export function useChatWithParams(): UseChatWithParamsReturn {
  const [searchParams] = useSearchParams();
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const wsRef = useRef<ReconnectingWebSocket | null>(null);
  const bufferRef = useRef<string>('');
  const conversationIdRef = useRef<string | null>(null);
  const hasStartedRef = useRef(false);
  const applicationIdRef = useRef<string | null>(null);

  // Get user ID and job ID
  const userId = user?.id;
  const jobId = searchParams.get('jobId');

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    if (!userId || !jobId) {
      setError('Missing user ID or job ID');
      return;
    }

    const ws = new ReconnectingWebSocket(WS_URL, [], {
      maxRetries: 5,
      connectionTimeout: 5000,
    });
    wsRef.current = ws;

    ws.addEventListener('open', () => {
      setStatus('connected');
      setError(null);
      
      if (!hasStartedRef.current) {
        hasStartedRef.current = true;
        setIsStreaming(true);
        ws.send(JSON.stringify({
          type: 'start_conversation',
          userId,
          jobId,
        }));
      }
    });

    ws.addEventListener('message', async (event: MessageEvent) => {
      try {
        const data: ServerMessage = JSON.parse(event.data);
        
        if (data.conversationId && !conversationIdRef.current) {
          conversationIdRef.current = data.conversationId;
          setConversationId(data.conversationId);
        }

        switch (data.type) {
          case 'greeting':
          case 'message':
            if (data.message) {
              bufferRef.current += data.message;
            }
            break;

          case 'status_update':
            if (bufferRef.current) {
              const fullMessage = bufferRef.current;
              setMessages(prev => [
                ...prev,
                {
                  id: generateId('bot'),
                  text: fullMessage,
                  isUser: false,
                  timestamp: new Date(),
                },
              ]);
            }
            bufferRef.current = '';
            setIsStreaming(false);
            
            // Check if conversation is complete
            if (data.conversationComplete && data.screeningDecision) {
              // Refresh user data to get the latest applicationId
              // Use IIFE to handle async operation
              (async () => {
                try {
                  if (userId) {
                    const updatedUser = await getUserData(userId);
                    setUser(updatedUser);
                    
                    // Find the applicationId for this job
                    const application = updatedUser.jobApplications?.find(
                      app => app.jobId === jobId
                    );
                    
                    if (application?.applicationId) {
                      const summary: ConversationSummary = {
                        applicationId: application.applicationId,
                        screeningDecision: data.screeningDecision,
                        screeningSummary: data.screeningSummary || null,
                      };
                      // Navigate to summary page with data
                      navigate('/summary', { state: summary });
                    } else {
                      // Fallback: use conversationId if applicationId not found yet
                      console.warn('ApplicationId not found, using conversationId as fallback');
                      const summary: ConversationSummary = {
                        applicationId: conversationIdRef.current || '',
                        screeningDecision: data.screeningDecision,
                        screeningSummary: data.screeningSummary || null,
                      };
                      navigate('/summary', { state: summary });
                    }
                  }
                } catch (err) {
                  console.error('Failed to refresh user data:', err);
                  // Fallback navigation with conversationId
                  const summary: ConversationSummary = {
                    applicationId: conversationIdRef.current || '',
                    screeningDecision: data.screeningDecision,
                    screeningSummary: data.screeningSummary || null,
                  };
                  navigate('/summary', { state: summary });
                }
              })();
            }
            break;

          case 'error':
            setError(data.error || 'Unknown error');
            setIsStreaming(false);
            bufferRef.current = '';
            break;

          case 'conversation_end':
            if (bufferRef.current) {
              const fullMessage = bufferRef.current;
              setMessages(prev => [
                ...prev,
                {
                  id: generateId('bot'),
                  text: fullMessage,
                  isUser: false,
                  timestamp: new Date(),
                },
              ]);
              bufferRef.current = '';
            }
            if (data.message) {
              setMessages(prev => [
                ...prev,
                {
                  id: generateId('end'),
                  text: data.message!,
                  isUser: false,
                  timestamp: new Date(),
                },
              ]);
            }
            setIsStreaming(false);
            break;
        }
      } catch (e) {
        console.error('Failed to parse message:', e);
        setError('Failed to parse server message');
      }
    });

    ws.addEventListener('error', () => {
      setStatus('error');
      setError('Connection error');
    });

    ws.addEventListener('close', () => {
      setStatus('disconnected');
    });

    return () => {
      ws.close();
    };
  }, [userId, jobId, navigate, setUser]);

  const sendUserMessage = useCallback((text: string) => {
    const ws = wsRef.current;
    const convId = conversationIdRef.current;

    if (!text.trim() || !convId || !ws) {
      return;
    }

    setMessages(prev => [
      ...prev,
      {
        id: generateId('user'),
        text: text.trim(),
        isUser: true,
        timestamp: new Date(),
      },
    ]);

    bufferRef.current = '';
    setIsStreaming(true);

    ws.send(JSON.stringify({
      type: 'send_message',
      conversationId: convId,
      message: text.trim(),
    }));
  }, []);

  const endConversation = useCallback(() => {
    const ws = wsRef.current;
    const convId = conversationIdRef.current;

    if (ws && convId) {
      ws.send(JSON.stringify({
        type: 'pause_conversation',
        conversationId: convId,
      }));
    }
  }, []);

  return {
    messages,
    status,
    error,
    conversationId,
    isStreaming,
    sendUserMessage,
    endConversation,
  };
}
