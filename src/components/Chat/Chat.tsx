import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useChat } from '../../hooks/useChat';
import { useChatWithParams } from '../../hooks/useChatWithParams';
import { ChatHeader } from './ChatHeader';
import { ChatBackButton } from './ChatBackButton';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import './Chat.css';

export function Chat() {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId');
  
  // Use different hook based on whether we have a jobId from URL
  const chatHook = jobId ? useChatWithParams : useChat;
  const { messages, status, error, conversationId, isStreaming, sendUserMessage, endConversation } = chatHook();

  const handleSend = useCallback((text: string) => {
    sendUserMessage(text);
  }, [sendUserMessage]);

  const isDisabled = status !== 'connected' || !conversationId;

  return (
    <div className="chat-container">
      <div className="chat-header-row">
        <ChatBackButton conversationId={conversationId} onExit={endConversation} />
        <ChatHeader status={status} />
      </div>
      
      {error && (
        <div className="error-banner">{error}</div>
      )}

      <MessageList messages={messages} isStreaming={isStreaming} />

      <ChatInput onSend={handleSend} disabled={isDisabled} />
    </div>
  );
}
