// WebSocket Message Types
export interface StartConversationMessage {
  type: 'start_conversation';
  userId: string;
  jobId: string;
}

export interface SendMessageMessage {
  type: 'send_message';
  conversationId: string;
  message: string;
}

export interface PauseConversationMessage {
  type: 'pause_conversation';
  conversationId: string;
}

export interface ContinueConversationMessage {
  type: 'continue_conversation';
  conversationId: string;
}

export interface EndConversationMessage {
  type: 'end_conversation';
  conversationId: string;
}

export type ClientMessage =
  | StartConversationMessage
  | SendMessageMessage
  | PauseConversationMessage
  | ContinueConversationMessage
  | EndConversationMessage;

export type ServerMessageType =
  | 'greeting'
  | 'message'
  | 'error'
  | 'status_update'
  | 'conversation_end';

export interface ServerMessage {
  type: ServerMessageType;
  conversationId?: string;
  message?: string;
  status?: string;
  error?: string;
  // Completion fields
  conversationComplete?: boolean;
  screeningDecision?: 'APPROVED' | 'DENIED' | 'PENDING' | 'USER_CANCELED';
  screeningSummary?: string | null;
}

// Chat Types
export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

// Connection State
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

// User & Auth Types
export type ScreeningDecision = 'Approved' | 'Denied' | 'Pending' | 'Canceled';

export interface JobApplication {
  applicationId: string;
  jobId: string;
  jobName: string;
  jobDescription: string;
  jobLocation: string;
  screeningDecision: ScreeningDecision;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  aptNum?: string;
  state: string;
  zipCode: string;
  jobApplications: JobApplication[];
}

export interface Job {
  id: string;  // Job ID from backend
  jobName: string;
  jobDescription: string;
  jobLocation: string;
  isActive: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse extends User {}

export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  address: string;
  aptNum?: string;
  state: string;
  zipCode: string;
}

export interface SignupResponse extends User {}

// Summary Types
export interface ConversationSummary {
  applicationId: string;
  screeningDecision: 'APPROVED' | 'DENIED' | 'PENDING' | 'USER_CANCELED';
  screeningSummary: string | null;
}
