import { useState, useCallback, useRef, useEffect } from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { ChatMessage, ServerMessage, ConnectionStatus } from '../types';
import { WS_URL, TEST_USER_ID, TEST_JOB_ID } from '../utils/constants';
import { generateId } from '../utils/id';

interface UseChatReturn {
  messages: ChatMessage[];
  status: ConnectionStatus;
  error: string | null;
  conversationId: string | null;
  isStreaming: boolean;
  sendUserMessage: (text: string) => void;
  endConversation: () => void;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const wsRef = useRef<ReconnectingWebSocket | null>(null);
  const bufferRef = useRef<string>('');
  const conversationIdRef = useRef<string | null>(null);
  const hasStartedRef = useRef(false);

  // Keep conversationIdRef in sync
  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  // Connect to WebSocket - runs once on mount
  useEffect(() => {
    const ws = new ReconnectingWebSocket(WS_URL, [], {
      maxRetries: 5,
      connectionTimeout: 5000,
    });
    wsRef.current = ws;

    ws.addEventListener('open', () => {
      setStatus('connected');
      setError(null);
      
      // Start conversation automatically (only once)
      if (!hasStartedRef.current) {
        hasStartedRef.current = true;
        setIsStreaming(true);
        ws.send(JSON.stringify({
          type: 'start_conversation',
          userId: TEST_USER_ID,
          jobId: TEST_JOB_ID,
        }));
      }
    });

    ws.addEventListener('message', (event: MessageEvent) => {
      try {
        const data: ServerMessage = JSON.parse(event.data);
        
        // Capture conversationId whenever we see it
        if (data.conversationId && !conversationIdRef.current) {
          conversationIdRef.current = data.conversationId;
          setConversationId(data.conversationId);
        }

        switch (data.type) {
          case 'greeting':
          case 'message':
            // Buffer chunks - don't update UI yet
            if (data.message) {
              bufferRef.current += data.message;
            }
            break;

          case 'status_update':
            // Stream complete - add buffered message to UI
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
            break;

          case 'error':
            setError(data.error || 'Unknown error');
            setIsStreaming(false);
            bufferRef.current = '';
            break;

          case 'conversation_end':
            // Flush buffer
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
            // Add end message if any
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
  }, []);

  // Send user message
  const sendUserMessage = useCallback((text: string) => {
    const ws = wsRef.current;
    const convId = conversationIdRef.current;

    if (!text.trim() || !convId || !ws) {
      return;
    }

    // Add user message to UI
    setMessages(prev => [
      ...prev,
      {
        id: generateId('user'),
        text: text.trim(),
        isUser: true,
        timestamp: new Date(),
      },
    ]);

    // Reset buffer for new response
    bufferRef.current = '';
    setIsStreaming(true);

    // Send to server
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
