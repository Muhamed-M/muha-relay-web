export interface User {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName?: string | null;
  avatar?: string;
  phoneNumber?: string | null;
  activityStatus: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  conversations?: ConversationMember[]; // Array of ConversationMember objects
  messages?: Message[]; // Array of Message objects
  receipts?: MessageReceipt[]; // Array of MessageReceipt objects
  token: string; // JWT token
  expiresOn: number; // Timestamp of when the session expires
}

export interface Conversation {
  id: number;
  name?: string | null;
  isGroup: boolean;
  lastMessageContent?: string | null; // Content of the last message sent
  lastMessageAt?: Date | null; // Timestamp of when the last message was sent
  createdAt: Date;
  updatedAt: Date;
  messages?: Message[]; // Array of Message objects
  members?: ConversationMember[]; // Array of ConversationMember objects
  _count?: {
    messages: number;
  }; // Conversation count object
}

export interface ConversationMember {
  id: number;
  userId: number;
  conversationId: number;
  addedAt: Date;
  role?: string | null; // Role in the group (e.g., admin, member)
  user?: User; // Associated User object
  conversation?: Conversation; // Associated Conversation object
}

export interface Message {
  id: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  conversationId: number;
  senderId: number;
  conversation?: Conversation; // Associated Conversation object
  sender?: User; // Associated User object (the sender)
  receipts?: MessageReceipt[]; // Array of MessageReceipt objects
}

export interface MessageReceipt {
  id: number;
  messageId: number;
  userId: number;
  readAt?: string | null; // Timestamp of when the message was read; null if not read
  message?: Message; // Associated Message object
  user?: User; // Associated User object
}
