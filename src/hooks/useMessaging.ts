// Custom hook for messaging functionality
import { useState, useEffect, useCallback } from 'react';
import type { Message, ConversationWithUsers } from '../types';
import messagingService, { type SendMessageData } from '../services/messagingService';

export const useMessaging = () => {
  const [conversations, setConversations] = useState<ConversationWithUsers[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const convs = await messagingService.getConversations();
      setConversations(convs);
      updateUnreadCount();
    } catch (err) {
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      setError(null);
      const msgs = await messagingService.getMessages(conversationId);
      setMessages(msgs);
      
      // Mark as read
      await messagingService.markAsRead(conversationId);
      updateUnreadCount();
      
      // Update conversation unread count
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    } catch (err) {
      setError('Failed to load messages');
    }
  }, []);

  // Send a message
  const sendMessage = useCallback(async (data: SendMessageData) => {
    try {
      setError(null);
      const message = await messagingService.sendMessage(data);
      
      // Update local state
      setMessages(prev => [...prev, message]);
      
      // Refresh conversations to update last message
      await loadConversations();
      
      return message;
    } catch (err) {
      setError('Failed to send message');
      throw err;
    }
  }, [loadConversations]);

  // Start conversation with user
  const startConversation = useCallback(async (userId: string) => {
    try {
      setError(null);
      const conversationId = await messagingService.startConversation(userId);
      await loadConversations();
      return conversationId;
    } catch (err) {
      setError('Failed to start conversation');
      throw err;
    }
  }, [loadConversations]);

  // Update unread count
  const updateUnreadCount = useCallback(() => {
    const count = messagingService.getUnreadCount();
    setUnreadCount(count);
  }, []);

  // Subscribe to new messages
  useEffect(() => {
    const unsubscribe = messagingService.onNewMessage((message) => {
      // Update conversations
      loadConversations();
      
      // If message is for current conversation, add to messages
      setMessages(prev => {
        const isCurrentConversation = prev.length > 0 && 
          prev[0].conversationId === message.conversationId;
        
        if (isCurrentConversation) {
          return [...prev, message];
        }
        
        return prev;
      });
      
      updateUnreadCount();
    });

    return unsubscribe;
  }, [loadConversations, updateUnreadCount]);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return {
    conversations,
    messages,
    loading,
    error,
    unreadCount,
    loadConversations,
    loadMessages,
    sendMessage,
    startConversation,
    clearError: () => setError(null),
  };
};