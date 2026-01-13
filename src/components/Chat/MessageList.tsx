import { memo, useEffect, useRef } from 'react';
import { ChatMessage } from '../../types';

interface Props {
  messages: ChatMessage[];
  isStreaming: boolean;
}

function MessageListComponent({ messages, isStreaming }: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="message-list">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`message ${msg.isUser ? 'user' : 'bot'}`}
        >
          <div className="message-bubble">{msg.text}</div>
        </div>
      ))}
      {isStreaming && messages.length > 0 && !messages[messages.length - 1]?.isUser && (
        <div className="typing-indicator">
          <span /><span /><span />
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}

export const MessageList = memo(MessageListComponent);
