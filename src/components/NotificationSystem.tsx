/**
 * Notification System Component
 * Handles real-time notifications and user alerts
 */

import { useState, useEffect, useCallback } from "react";
import { Bell, X, Info, AlertTriangle, CheckCircle } from "lucide-react";
import { wsManager } from "@/realtime/websocket-server";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'live_event';
  priority: 'low' | 'medium' | 'high';
  timestamp: number;
  read: boolean;
}

export interface NotificationSystemProps {
  className?: string;
}

export function NotificationSystem({ className }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // Listen for WebSocket notifications
  useEffect(() => {
    const handleNotification = (message: any) => {
      if (message.type === 'notification') {
        const notification: Notification = {
          id: crypto.randomUUID(),
          title: message.data.title,
          message: message.data.message,
          type: message.data.type,
          priority: message.data.priority,
          timestamp: message.timestamp,
          read: false
        };

        setNotifications(prev => [notification, ...prev]);
        
        // Auto-hide low priority notifications after 5 seconds
        if (message.data.priority === 'low') {
          setTimeout(() => {
            markAsRead(notification.id);
          }, 5000);
        }

        // Show browser notification if permitted
        if (Notification.permission === 'granted') {
          new BrowserNotification(message.data.title, {
            body: message.data.message,
            icon: '/favicon.ico',
            tag: notification.id
          });
        }
      }
    };

    // Register with WebSocket manager (simplified for demo)
    const ws = wsManager as any;
    if (ws.on) {
      ws.on('notification', handleNotification);
    }

    return () => {
      if (ws.off) {
        ws.off('notification', handleNotification);
      }
    };
  }, []);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  // Remove notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'live_event': return <Bell className="h-4 w-4 text-red-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-blue-500 bg-blue-50';
    }
  };

  // Unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm ${className || ''}`}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="relative p-2 rounded-full bg-surface border border-border hover:bg-muted transition-colors"
        aria-label={`Notifications (${unreadCount})`}
      >
        <Bell className="h-5 w-5 text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      {isVisible && (
        <div className="absolute top-12 right-0 w-80 max-h-96 bg-surface border border-border rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-border">
            <h3 className="font-semibold text-foreground">Notifications</h3>
            <div className="flex gap-2">
              <button
                onClick={clearAllNotifications}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <Info className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-l-4 ${getPriorityColor(notification.priority)} ${
                      notification.read ? 'opacity-60' : ''
                    } transition-all duration-200`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-foreground text-sm">
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {new Date(notification.timestamp).toLocaleTimeString()}
                            </span>
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs text-primary hover:text-primary/80 transition-colors"
                              >
                                Mark as read
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                      </div>
                      <button
                        onClick={() => removeNotification(notification.id)}
                        className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Browser notification wrapper
class BrowserNotification extends Notification {
  constructor(title: string, options?: NotificationOptions) {
    super(title, options);
  }
}
