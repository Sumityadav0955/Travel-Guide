// Message notification component for real-time message alerts
import React, { useState, useEffect } from 'react';
import type { Message } from '../../types';
import messagingService from '../../services/messagingService';

interface MessageNotificationProps {
  onMessageClick?: (message: Message) => void;
}

const MessageNotification: React.FC<MessageNotificationProps> = ({ onMessageClick }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestMessage, setLatestMessage] = useState<Message | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Update unread count on mount
    updateUnreadCount();

    // Subscribe to new messages
    const unsubscribe = messagingService.onNewMessage((message) => {
      // Only show notification for received messages
      if (message.receiverId === 'current_user') {
        setLatestMessage(message);
        setShowNotification(true);
        updateUnreadCount();

        // Auto-hide notification after 5 seconds
        setTimeout(() => {
          setShowNotification(false);
        }, 5000);
      }
    });

    return unsubscribe;
  }, []);

  const updateUnreadCount = () => {
    const count = messagingService.getUnreadCount();
    setUnreadCount(count);
  };

  const handleNotificationClick = () => {
    if (latestMessage && onMessageClick) {
      onMessageClick(latestMessage);
    }
    setShowNotification(false);
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowNotification(false);
  };

  if (!showNotification || !latestMessage) {
    return unreadCount > 0 ? (
      <div className="message-badge">
        {unreadCount}
      </div>
    ) : null;
  }

  return (
    <>
      {unreadCount > 0 && (
        <div className="message-badge">
          {unreadCount}
        </div>
      )}
      
      <div className="message-notification" onClick={handleNotificationClick}>
        <div className="notification-content">
          <div className="notification-header">
            <span className="notification-title">New Message</span>
            <button onClick={handleDismiss} className="notification-close">×</button>
          </div>
          <div className="notification-body">
            <p className="notification-message">{latestMessage.content}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default MessageNotification;