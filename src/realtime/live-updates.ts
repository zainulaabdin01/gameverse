/**
 * Live Updates System
 * Handles real-time data updates for matches, news, and notifications
 */

import { handleLiveMatchUpdate, handleNewsUpdate, sendNotification } from "./websocket-server";
import { getDB } from "../server/db";

export interface LiveUpdateConfig {
  enableLiveScores: boolean;
  enableLiveNews: boolean;
  enableNotifications: boolean;
  updateInterval: number; // milliseconds
}

/**
 * Live update manager for orchestrating real-time updates
 */
class LiveUpdateManager {
  private config: LiveUpdateConfig;
  private updateIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(config: LiveUpdateConfig) {
    this.config = config;
  }

  /**
   * Start live update monitoring
   */
  start(): void {
    console.log('[Live Updates] Starting real-time monitoring...');
    
    if (this.config.enableLiveScores) {
      this.startLiveMatchMonitoring();
    }
    
    if (this.config.enableLiveNews) {
      this.startNewsMonitoring();
    }
  }

  /**
   * Stop all live update monitoring
   */
  stop(): void {
    console.log('[Live Updates] Stopping real-time monitoring...');
    
    this.updateIntervals.forEach((interval, key) => {
      clearInterval(interval);
      console.log(`[Live Updates] Stopped monitoring: ${key}`);
    });
    
    this.updateIntervals.clear();
  }

  /**
   * Monitor live matches and update scores
   */
  private startLiveMatchMonitoring(): void {
    const interval = setInterval(async () => {
      await this.checkLiveMatches();
    }, this.config.updateInterval);
    
    this.updateIntervals.set('live_matches', interval);
    console.log('[Live Updates] Started live match monitoring');
  }

  /**
   * Monitor news for new articles and trending content
   */
  private startNewsMonitoring(): void {
    const interval = setInterval(async () => {
      await this.checkNewsUpdates();
    }, this.config.updateInterval * 2); // Check news less frequently
    
    this.updateIntervals.set('news_updates', interval);
    console.log('[Live Updates] Started news monitoring');
  }

  /**
   * Check for live match updates
   */
  private async checkLiveMatches(): Promise<void> {
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
        ORDER BY m.last_updated DESC
        LIMIT 20
      `).all();

      const liveMatches = result.results || [];
      
      // Check for score changes and broadcast updates
      for (const match of liveMatches) {
        await this.checkMatchScoreChange(match);
      }
    } catch (error) {
      console.error('[Live Updates] Failed to check live matches:', error);
    }
  }

  /**
   * Check for match score changes and broadcast if needed
   */
  private async checkMatchScoreChange(match: any): Promise<void> {
    try {
      // Simulate score change detection (in real implementation, this would come from external API)
      const scoreChange = Math.random() > 0.7; // 30% chance of score change
      
      if (scoreChange) {
        const newScore = {
          team_a: match.team_a_score + Math.floor(Math.random() * 3),
          team_b: match.team_b_score + Math.floor(Math.random() * 3)
        };

        const update = {
          matchId: match.id,
          score: newScore,
          status: match.status,
          viewers: match.viewers + Math.floor(Math.random() * 100)
        };

        await handleLiveMatchUpdate(update);
        console.log(`[Live Updates] Score update for match ${match.id}: ${newScore.team_a}-${newScore.team_b}`);
      }
    } catch (error) {
      console.error('[Live Updates] Failed to check match score change:', error);
    }
  }

  /**
   * Check for news updates
   */
  private async checkNewsUpdates(): Promise<void> {
    try {
      const db = await getDB();
      const result = await db.prepare(`
        SELECT * FROM articles 
        WHERE published_at > datetime('now', '-1 hour')
        ORDER BY published_at DESC
        LIMIT 10
      `).all();

      const recentArticles = result.results || [];
      
      // Check for trending articles
      for (const article of recentArticles) {
        if (this.isTrendingArticle(article)) {
          const update = {
            articleId: article.id as string,
            updateType: 'trending' as const,
            title: article.title as string,
            summary: article.summary as string
          };

          await handleNewsUpdate(update);
          console.log(`[Live Updates] Trending article detected: ${article.title}`);
        }
      }
    } catch (error) {
      console.error('[Live Updates] Failed to check news updates:', error);
    }
  }

  /**
   * Determine if an article is trending
   */
  private isTrendingArticle(article: any): boolean {
    // Simple trending detection based on views and recency
    const views = article.views || 0;
    const hoursSincePublished = (Date.now() - new Date(article.published_at).getTime()) / (1000 * 60 * 60);
    
    // Consider trending if high views in short time
    return views > 100 && hoursSincePublished < 2;
  }

  /**
   * Send live event notification
   */
  async sendLiveEventNotification(title: string, message: string, priority: 'low' | 'medium' | 'high' = 'medium'): Promise<void> {
    if (!this.config.enableNotifications) return;

    const notification = {
      title,
      message,
      type: 'live_event' as const,
      priority
    };

    await sendNotification(notification);
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<LiveUpdateConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('[Live Updates] Configuration updated:', this.config);
  }
}

// Default configuration
const defaultConfig: LiveUpdateConfig = {
  enableLiveScores: true,
  enableLiveNews: true,
  enableNotifications: true,
  updateInterval: 30000 // 30 seconds
};

// Global live update manager instance
export const liveUpdateManager = new LiveUpdateManager(defaultConfig);

/**
 * Initialize live update system
 */
export function initializeLiveUpdates(): void {
  liveUpdateManager.start();
  console.log('[Live Updates] System initialized');
}

/**
 * Handle external live score updates (from real data sources)
 */
export async function handleExternalScoreUpdate(matchId: string, teamAScore: number, teamBScore: number): Promise<void> {
  try {
    const db = await getDB();
    const match = await db.prepare("SELECT * FROM esports_matches WHERE id = ?").bind(matchId).first();

    if (match) {
      const update = {
        matchId,
        score: { team_a: teamAScore, team_b: teamBScore },
        status: match.status as 'live' | 'finished' | 'paused',
        viewers: match.viewers as number
      };

      await handleLiveMatchUpdate(update);
      
      // Send notification for important matches
      if ((match.viewers as number) > 1000) {
        await liveUpdateManager.sendLiveEventNotification(
          '🔴 Live Match Update!',
          `${match.team_a_name} vs ${match.team_b_name}: ${teamAScore}-${teamBScore}`,
          'high'
        );
      }
    }
  } catch (error) {
    console.error('[Live Updates] Failed to handle external score update:', error);
  }
}

/**
 * Handle breaking news updates
 */
export async function handleBreakingNews(articleId: string, title: string, summary: string): Promise<void> {
  try {
    const update = {
      articleId,
      updateType: 'new' as const,
      title,
      summary
    };

    await handleNewsUpdate(update);
    
    // Send notification for breaking news
    await liveUpdateManager.sendLiveEventNotification(
      '📰 Breaking News!',
      title,
      'high'
    );
  } catch (error) {
    console.error('[Live Updates] Failed to handle breaking news:', error);
  }
}
