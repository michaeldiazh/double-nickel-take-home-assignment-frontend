import { memo } from 'react';
import { ConnectionStatus } from '../../types';

interface Props {
  status: ConnectionStatus;
}

function ChatHeaderComponent({ status }: Props) {
  const isConnected = status === 'connected';
  
  return (
    <div className="chat-header-content">
      <h1>Let's Chat!</h1>
      <span
        className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}
        title={status}
      />
    </div>
  );
}

export const ChatHeader = memo(ChatHeaderComponent);
