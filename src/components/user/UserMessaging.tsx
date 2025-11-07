// UserMessaging component for user-to-user communication
import React, { useState, useEffect, useRef } from 'react';
import type { Message, ConversationWithUsers } from '../../types';
import messagingService, { type SendMessageData } from '../../services/messagingService';
import '../../styles/messaging.css';

interface UserMessagingProps {
  selectedUserId?: string;
  onClose?: () => void;
}

const UserMessaging: React.FC<UserMessagingProps> = ({ selectedUserId, onClose }) => {
  const [conversations, setConversations] = useState<ConversationWithUsers[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations on component mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Start conversation with selected user if provided
  useEffect(() => {
    if (selectedUserId) {
      startConversationWithUser(selectedUserId);
    }
  }, [selectedUserId]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
    }
  }, [selectedConversation]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Subscribe to new messages
  useEffect(() => {
    const unsubscribe = messagingService.onNewMessage((message) => {
      if (message.conversationId === selectedConversation) {
        setMessages(prev => [...prev, message]);
      }
      // Refresh conversations to update last message
      loadConversations();
    });

    return unsubscribe;
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const convs = await messagingService.getConversations();
      setConversations(convs);
      
      // Auto-select first conversation if none selected
      if (!selectedConversation && convs.length > 0) {
        setSelectedConversation(convs[0].id);
      }
    } catch (err) {
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const msgs = await messagingService.getMessages(conversationId);
      setMessages(msgs);
      
      // Mark messages as read
      await messagingService.markAsRead(conversationId);
      
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
  };

  const startConversationWithUser = async (userId: string) => {
    try {
      const conversationId = await messagingService.startConversation(userId);
      setSelectedConversation(conversationId);
      await loadConversations();
    } catch (err) {
      setError('Failed to start conversation');
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;

    const conversation = conversations.find(c => c.id === selectedConversation);
    if (!conversation) return;

    const receiverId = conversation.participants.find((id: string) => id !== 'current_user') || '';

    try {
      const messageData: SendMessageData = {
        receiverId,
        content: newMessage.trim(),
      };

      await messagingService.sendMessage(messageData);
      setNewMessage('');
      
      // Refresh conversations and messages
      await loadConversations();
      await loadMessages(selectedConversation);
    } catch (err) {
      setError('Failed to send message');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return messageDate.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const selectedConversationData = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="messaging-container">
      {onClose && (
        <div className="messaging-header">
          <h2>Messages</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>
      )}

      <div className="messaging-content">
        {/* Conversations List */}
        <div className="conversations-sidebar">
          <div className="conversations-header">
            <h3>Conversations</h3>
          </div>
          
          {loading && conversations.length === 0 ? (
            <div className="loading">Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="empty-state">
              <p>No conversations yet</p>
              <p>Start chatting with other users to see conversations here</p>
            </div>
          ) : (
            <div className="conversations-list">
              {conversations.map(conversation => (
                <div
                  key={conversation.id}
                  className={`conversation-item ${selectedConversation === conversation.id ? 'active' : ''}`}
                  onClick={() => setSelectedConversation(conversation.id)}
                >
                  <div className="conversation-avatar">
                    {conversation.otherUser.profile.avatar ? (
                      <img src={conversation.otherUser.profile.avatar} alt={conversation.otherUser.username} />
                    ) : (
                      <div className="avatar-placeholder">
                        {conversation.otherUser.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  <div className="conversation-info">
                    <div className="conversation-header">
                      <span className="username">{conversation.otherUser.username}</span>
                      {conversation.lastMessage && (
                        <span className="timestamp">
                          {formatMessageTime(conversation.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    
                    {conversation.lastMessage && (
                      <div className="last-message">
                        {conversation.lastMessage.content}
                      </div>
                    )}
                    
                    {conversation.unreadCount > 0 && (
                      <div className="unread-badge">{conversation.unreadCount}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Messages Area */}
        <div className="messages-area">
          {selectedConversationData ? (
            <>
              <div className="messages-header">
                <div className="conversation-info">
                  <div className="avatar">
                    {selectedConversationData.otherUser.profile.avatar ? (
                      <img src={selectedConversationData.otherUser.profile.avatar} alt={selectedConversationData.otherUser.username} />
                    ) : (
                      <div className="avatar-placeholder">
                        {selectedConversationData.otherUser.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3>{selectedConversationData.otherUser.username}</h3>
                    <p>{selectedConversationData.otherUser.profile.location}</p>
                  </div>
                </div>
              </div>

              <div className="messages-list">
                {messages.length === 0 ? (
                  <div className="empty-messages">
                    <p>No messages yet</p>
                    <p>Start the conversation!</p>
                  </div>
                ) : (
                  messages.map(message => (
                    <div
                      key={message.id}
                      className={`message ${message.senderId === 'current_user' ? 'sent' : 'received'}`}
                    >
                      <div className="message-content">
                        {message.content}
                      </div>
                      <div className="message-time">
                        {formatMessageTime(message.createdAt)}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={sendMessage} className="message-input-form">
                <div className="message-input-container">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="message-input"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="send-button"
                  >
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="no-conversation-selected">
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
    </div>
  );
};

export default UserMessaging;