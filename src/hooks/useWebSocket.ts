/**
 * WebSocket Hook
 * Provides WebSocket connection and real-time data updates
 */

import { useState, useEffect, useCallback, useRef } from "react";

export interface WebSocketState {
  connected: boolean;
  error: string | null;
  lastMessage: any;
}

export interface UseWebSocketOptions {
  url?: string;
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const [state, setState] = useState<WebSocketState>({
    connected: false,
    error: null,
    lastMessage: null
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const {
    url = 'ws://localhost:8081/ws',
    reconnectAttempts = 5,
    reconnectInterval = 3000
  } = options;

  // Connect to WebSocket
  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WebSocket] Connected');
        setState(prev => ({ ...prev, connected: true, error: null }));
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setState(prev => ({ ...prev, lastMessage: data }));
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('[WebSocket] Disconnected:', event.code, event.reason);
        setState(prev => ({ ...prev, connected: false }));
        
        // Attempt reconnection if not clean close
        if (event.code !== 1000 && reconnectAttemptsRef.current < reconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        setState(prev => ({ ...prev, error: 'Connection failed' }));
      };

    } catch (error) {
      console.error('[WebSocket] Connection failed:', error);
      setState(prev => ({ ...prev, error: 'Connection failed' }));
    }
  }, [url, reconnectAttempts, reconnectInterval]);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
      wsRef.current = null;
    }
    
    setState(prev => ({ ...prev, connected: false }));
  }, []);

  // Send message
  const sendMessage = useCallback((message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('[WebSocket] Not connected, cannot send message');
    }
  }, []);

  // Initialize connection
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect]);

  return {
    ...state,
    connect,
    disconnect,
    sendMessage
  };
}

/**
 * Live data hook for real-time updates
 */
export function useLiveData() {
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [liveNews, setLiveNews] = useState<any[]>([]);

  const { connected, lastMessage, sendMessage } = useWebSocket();

  // Handle incoming messages
  useEffect(() => {
    if (lastMessage && connected) {
      switch (lastMessage.type) {
        case 'live_match_update':
          setLiveMatches(prev => {
            const updated = [...prev];
            const index = updated.findIndex(m => m.matchId === lastMessage.data.matchId);
            if (index !== -1) {
              updated[index] = lastMessage.data;
            }
            return updated;
          });
          break;

        case 'news_update':
          setLiveNews(prev => [lastMessage.data, ...prev]);
          break;

        case 'notification':
          // Handle notifications through NotificationSystem
          break;

        default:
          console.log('[Live Data] Unknown message type:', lastMessage.type);
      }
    }
  }, [lastMessage, connected]);

  // Subscribe to live matches updates
  const subscribeToLiveMatches = useCallback(() => {
    sendMessage({ type: 'subscribe_live_matches' });
  }, [sendMessage]);

  return {
    liveMatches,
    liveNews,
    connected,
    subscribeToLiveMatches
  };
}
