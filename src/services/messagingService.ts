// Messaging service for user-to-user communication
import type { Message, Conversation, User } from '../types';

export interface SendMessageData {
  receiverId: string;
  content: string;
}

export interface ConversationWithUsers extends Conversation {
  otherUser: User;
}

class MessagingService {
  private conversations: Map<string, Conversation> = new Map();
  private messages: Map<string, Message[]> = new Map();
  private messageListeners: Set<(message: Message) => void> = new Set();

  constructor() {
    // Initialize with mock data
    this.initializeMockData();
  }

  // Initialize mock conversations and messages
  private initializeMockData(): void {
    const mockConversations: Conversation[] = [
      {
        id: 'conv_1',
        participants: ['current_user', 'user_2'],
        lastActivity: new Date(Date.now() - 3600000), // 1 hour ago
        unreadCount: 2,
      },
      {
        id: 'conv_2',
        participants: ['current_user', 'user_3'],
        lastActivity: new Date(Date.now() - 86400000), // 1 day ago
        unreadCount: 0,
      },
    ];

    const mockMessages: Message[] = [
      {
        id: 'msg_1',
        conversationId: 'conv_1',
        senderId: 'user_2',
        receiverId: 'current_user',
        content: 'Hi! I saw your recommendation for the hidden waterfall. Could you share more details about the hiking trail?',
        createdAt: new Date(Date.now() - 3600000),
        read: false,
      },
      {
        id: 'msg_2',
        conversationId: 'conv_1',
        senderId: 'user_2',
        receiverId: 'current_user',
        content: 'Also, is it accessible for beginners?',
        createdAt: new Date(Date.now() - 3500000),
        read: false,
      },
      {
        id: 'msg_3',
        conversationId: 'conv_2',
        senderId: 'current_user',
        receiverId: 'user_3',
        content: 'Thanks for the great review of the local market! It really helped other travelers.',
        createdAt: new Date(Date.now() - 86400000),
        read: true,
      },
    ];

    // Store conversations
    mockConversations.forEach(conv => {
      this.conversations.set(conv.id, conv);
    });

    // Group messages by conversation
    mockMessages.forEach(message => {
      const conversationMessages = this.messages.get(message.conversationId) || [];
      conversationMessages.push(message);
      this.messages.set(message.conversationId, conversationMessages);
    });

    // Update last messages in conversations
    mockConversations.forEach(conv => {
      const messages = this.messages.get(conv.id) || [];
      if (messages.length > 0) {
        conv.lastMessage = messages[messages.length - 1];
      }
    });
  }

  // Get all conversations for current user
  async getConversations(): Promise<ConversationWithUsers[]> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      const conversationList = Array.from(this.conversations.values());
      
      // Mock user data for other participants
      const mockUsers: Record<string, User> = {
        user_2: {
          id: 'user_2',
          username: 'maria_local',
          email: 'maria@example.com',
          userType: 'local',
          profile: {
            bio: 'Local guide in Costa Rica',
            location: 'San José, Costa Rica',
            expertise: ['nature', 'adventure'],
            avatar: '/avatars/maria.jpg',
          },
          reputation: 85,
          joinedAt: new Date('2023-06-15'),
        },
        user_3: {
          id: 'user_3',
          username: 'alex_traveler',
          email: 'alex@example.com',
          userType: 'traveler',
          profile: {
            bio: 'Digital nomad exploring hidden gems',
            location: 'Currently in Thailand',
            expertise: ['culture', 'food'],
            avatar: '/avatars/alex.jpg',
          },
          reputation: 72,
          joinedAt: new Date('2023-08-20'),
        },
      };

      return conversationList.map(conv => {
        const otherUserId = conv.participants.find(id => id !== 'current_user') || '';
        return {
          ...conv,
          otherUser: mockUsers[otherUserId] || mockUsers.user_2,
        };
      }).sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
    } catch (error) {
      throw new Error('Failed to load conversations');
    }
  }

  // Get messages for a specific conversation
  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));

      const messages = this.messages.get(conversationId) || [];
      return messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    } catch (error) {
      throw new Error('Failed to load messages');
    }
  }

  // Send a new message
  async sendMessage(data: SendMessageData): Promise<Message> {
    try {
      // Find or create conversation
      let conversationId = this.findConversationWithUser(data.receiverId);
      
      if (!conversationId) {
        conversationId = `conv_${Date.now()}`;
        const newConversation: Conversation = {
          id: conversationId,
          participants: ['current_user', data.receiverId],
          lastActivity: new Date(),
          unreadCount: 0,
        };
        this.conversations.set(conversationId, newConversation);
        this.messages.set(conversationId, []);
      }

      // Create new message
      const newMessage: Message = {
        id: `msg_${Date.now()}`,
        conversationId,
        senderId: 'current_user',
        receiverId: data.receiverId,
        content: data.content,
        createdAt: new Date(),
        read: false,
      };

      // Add message to conversation
      const conversationMessages = this.messages.get(conversationId) || [];
      conversationMessages.push(newMessage);
      this.messages.set(conversationId, conversationMessages);

      // Update conversation
      const conversation = this.conversations.get(conversationId);
      if (conversation) {
        conversation.lastMessage = newMessage;
        conversation.lastActivity = new Date();
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Notify listeners
      this.messageListeners.forEach(listener => listener(newMessage));

      return newMessage;
    } catch (error) {
      throw new Error('Failed to send message');
    }
  }

  // Mark messages as read
  async markAsRead(conversationId: string): Promise<void> {
    try {
      const messages = this.messages.get(conversationId) || [];
      messages.forEach(message => {
        if (message.receiverId === 'current_user') {
          message.read = true;
        }
      });

      const conversation = this.conversations.get(conversationId);
      if (conversation) {
        conversation.unreadCount = 0;
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      throw new Error('Failed to mark messages as read');
    }
  }

  // Start a new conversation with a user
  async startConversation(userId: string): Promise<string> {
    try {
      const existingConversationId = this.findConversationWithUser(userId);
      if (existingConversationId) {
        return existingConversationId;
      }

      const conversationId = `conv_${Date.now()}`;
      const newConversation: Conversation = {
        id: conversationId,
        participants: ['current_user', userId],
        lastActivity: new Date(),
        unreadCount: 0,
      };

      this.conversations.set(conversationId, newConversation);
      this.messages.set(conversationId, []);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));

      return conversationId;
    } catch (error) {
      throw new Error('Failed to start conversation');
    }
  }

  // Find conversation with specific user
  private findConversationWithUser(userId: string): string | null {
    for (const [id, conversation] of this.conversations) {
      if (conversation.participants.includes(userId) && conversation.participants.includes('current_user')) {
        return id;
      }
    }
    return null;
  }

  // Subscribe to new messages
  onNewMessage(callback: (message: Message) => void): () => void {
    this.messageListeners.add(callback);
    return () => {
      this.messageListeners.delete(callback);
    };
  }

  // Get unread message count
  getUnreadCount(): number {
    let totalUnread = 0;
    for (const conversation of this.conversations.values()) {
      totalUnread += conversation.unreadCount;
    }
    return totalUnread;
  }
}

// Export singleton instance
const messagingService = new MessagingService();
export default messagingService;