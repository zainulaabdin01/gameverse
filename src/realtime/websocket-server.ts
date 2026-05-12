/**
 * Real-time WebSocket Server Implementation
 * Handles live data updates, notifications, and connection management
 */

import { getDB } from "../server/db";
import { getCachedData, invalidateCachePattern, CACHE_KEYS } from "../server/cache";

export interface WebSocketMessage {
  type: 'live_match_update' | 'news_update' | 'notification' | 'heartbeat' | 'subscribe_live_matches';
  data: any;
  timestamp: number;
}

export interface LiveMatchUpdate {
  matchId: string;
  score: { team_a: number; team_b: number };
  status: 'live' | 'finished' | 'paused';
  viewers?: number;
}

export interface NewsUpdate {
  articleId: string;
  updateType: 'new' | 'updated' | 'trending';
  title: string;
  summary?: string;
}

export interface NotificationMessage {
  userId?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'live_event';
  priority: 'low' | 'medium' | 'high';
}

/**
 * WebSocket connection manager
 */
class WebSocketManager {
  private connections: Map<string, any> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startHeartbeat();
  }

  /**
   * Add new WebSocket connection
   */
  addConnection(id: string, ws: any): void {
    this.connections.set(id, ws);
    console.log(`[WebSocket] New connection: ${id}`);
    
    // Send initial data
    this.sendInitialData(ws);
  }

  /**
   * Remove WebSocket connection
   */
  removeConnection(id: string): void {
    this.connections.delete(id);
    console.log(`[WebSocket] Connection removed: ${id}`);
  }

  /**
   * Broadcast message to all connected clients
   */
  broadcast(message: WebSocketMessage): void {
    const messageStr = JSON.stringify(message);
    
    this.connections.forEach((ws, clientId) => {
      try {
        if (typeof ws.send === 'function') {
          ws.send(messageStr);
        }
      } catch (error) {
        console.error(`[WebSocket] Failed to send to ${clientId}:`, error);
        this.removeConnection(clientId);
      }
    });
  }

  /**
   * Send message to specific user
   */
  sendToUser(userId: string, message: WebSocketMessage): void {
    const ws = this.connections.get(userId);
    if (ws && typeof ws.send === 'function') {
      try {
        ws.send(JSON.stringify(message));
      } catch (error) {
        console.error(`[WebSocket] Failed to send to user ${userId}:`, error);
      }
    }
  }

  /**
   * Send initial data to new connection
   */
  public async sendInitialData(ws: any): Promise<void> {
    try {
      // Send current live matches
      const liveMatches = await this.getCurrentLiveMatches();
      const message: WebSocketMessage = {
        type: 'live_match_update',
        data: liveMatches,
        timestamp: Date.now()
      };
      
      if (typeof ws.send === 'function') {
        ws.send(JSON.stringify(message));
      }
    } catch (error) {
      console.error('[WebSocket] Failed to send initial data:', error);
    }
  }

  /**
   * Get current live matches from database
   */
  private async getCurrentLiveMatches(): Promise<LiveMatchUpdate[]> {
    try {
      const db = await getDB();
      const result = await db.prepare(`
        SELECT m.*, 
               t_a.name as team_a_name, t_a.tag as team_a_tag,
               t_b.name as team_b_name, t_b.tag as team_b_tag
        FROM esports_matches m
        LEFT JOIN esports_teams t_a ON m.team_a_id = t_a.id
        LEFT JOIN esports_teams t_b ON m.team_b_id = t_b.id
        WHERE m.status = 'live'
        ORDER BY m.viewers DESC, m.starts_at DESC
        LIMIT 10
      `).all();

      return result.results?.map((match: any) => ({
        matchId: match.id,
        score: { team_a: match.team_a_score || 0, team_b: match.team_b_score || 0 },
        status: match.status,
        viewers: match.viewers
      })) || [];
    } catch (error) {
      console.error('[WebSocket] Failed to get live matches:', error);
      return [];
    }
  }

  /**
   * Start heartbeat to keep connections alive
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.broadcast({
        type: 'heartbeat',
        data: { timestamp: Date.now() },
        timestamp: Date.now()
      });
    }, 30000); // 30 seconds
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.connections.clear();
  }
}

// Global WebSocket manager instance
export const wsManager = new WebSocketManager();

/**
 * Handle live match updates from external sources
 */
export async function handleLiveMatchUpdate(update: LiveMatchUpdate): Promise<void> {
  try {
    // Update database
    const db = await getDB();
    await db.prepare(`
      UPDATE esports_matches 
      SET team_a_score = ?, team_b_score = ?, status = ?, viewers = ?
      WHERE id = ?
    `).bind(
      update.score.team_a,
      update.score.team_b,
      update.status,
      update.viewers || 0,
      update.matchId
    ).run();

    // Invalidate cache
    await invalidateCachePattern('esports:live');
    await invalidateCachePattern(`esports:match:${update.matchId}`);

    // Broadcast to all connected clients
    wsManager.broadcast({
      type: 'live_match_update',
      data: update,
      timestamp: Date.now()
    });

    console.log(`[WebSocket] Live match update broadcasted: ${update.matchId}`);
  } catch (error) {
    console.error('[WebSocket] Failed to handle live match update:', error);
  }
}

/**
 * Handle news updates and trending changes
 */
export async function handleNewsUpdate(update: NewsUpdate): Promise<void> {
  try {
    // Invalidate relevant cache
    await invalidateCachePattern('news:');
    await invalidateCachePattern('article:');
    await invalidateCachePattern(CACHE_KEYS.HOMEPAGE_DATA);

    // Broadcast to all connected clients
    wsManager.broadcast({
      type: 'news_update',
      data: update,
      timestamp: Date.now()
    });

    console.log(`[WebSocket] News update broadcasted: ${update.articleId}`);
  } catch (error) {
    console.error('[WebSocket] Failed to handle news update:', error);
  }
}

/**
 * Send notification to specific user or all users
 */
export async function sendNotification(notification: NotificationMessage): Promise<void> {
  try {
    const message: WebSocketMessage = {
      type: 'notification',
      data: notification,
      timestamp: Date.now()
    };

    if (notification.userId) {
      wsManager.sendToUser(notification.userId, message);
    } else {
      wsManager.broadcast(message);
    }

    console.log(`[WebSocket] Notification sent: ${notification.title}`);
  } catch (error) {
    console.error('[WebSocket] Failed to send notification:', error);
  }
}

/**
 * WebSocket connection handler for Cloudflare Workers
 */
export function handleWebSocketConnection(request: Request): any {
  const url = new URL(request.url);
  const clientId = crypto.randomUUID();

  // Cloudflare Workers WebSocket upgrade response
  const pair = new WebSocketPair();
  const client = pair[0];
  const server = pair[1];

  // Accept the WebSocket connection
  server.accept();

  // Add connection to manager
  wsManager.addConnection(clientId, server);

  // Handle incoming messages
  server.addEventListener('message', (event: any) => {
    try {
      const data = JSON.parse(event.data) as WebSocketMessage;
      handleWebSocketMessage(clientId, data);
    } catch (error) {
      console.error('[WebSocket] Invalid message format:', error);
    }
  });

  // Handle connection close
  server.addEventListener('close', () => {
    wsManager.removeConnection(clientId);
  });

  // Handle connection errors
  server.addEventListener('error', (error: any) => {
    console.error(`[WebSocket] Connection error for ${clientId}:`, error);
    wsManager.removeConnection(clientId);
  });

  // Send initial data
  wsManager.sendInitialData(server);

  return new Response(null, {
    status: 101,
    webSocket: client
  });
}

/**
 * Handle incoming WebSocket messages
 */
async function handleWebSocketMessage(clientId: string, message: WebSocketMessage): Promise<void> {
  switch (message.type) {
    case 'heartbeat':
      // Client heartbeat response - no action needed
      break;
    
    case 'subscribe_live_matches':
      // Send current live matches to this client
      const liveMatches = await wsManager['getCurrentLiveMatches']();
      wsManager.sendToUser(clientId, {
        type: 'live_match_update',
        data: liveMatches,
        timestamp: Date.now()
      });
      break;
    
    default:
      console.log(`[WebSocket] Unknown message type: ${message.type}`);
  }
}
