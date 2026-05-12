/**
 * Performance Metrics Collector
 * Collects and tracks system performance data
 */

import { createServerFn } from "@tanstack/react-start";
import { getDB } from "../server/db";
import { getCachedData, CACHE_TTL } from "../server/cache";

export interface PerformanceMetric {
  id: string;
  metricType: 'page_load' | 'api_response' | 'cache_hit' | 'error_rate' | 'user_interaction';
  value: number;
  metadata: {
    url?: string;
    endpoint?: string;
    cacheKey?: string;
    userAgent?: string;
    userId?: string;
    errorType?: string;
  };
  timestamp: number;
}

export interface PerformanceSummary {
  totalMetrics: number;
  averagePageLoad: number;
  averageApiResponse: number;
  cacheHitRate: number;
  errorRate: number;
  topSlowPages: Array<{ url: string; avgLoadTime: number; count: number }>;
  topSlowEndpoints: Array<{ endpoint: string; avgResponseTime: number; count: number }>;
  recentErrors: Array<{ errorType: string; count: number; lastOccurrence: string }>;
}

/**
 * Record performance metric
 */
export const recordMetricFn = createServerFn({ method: "POST" })
  .inputValidator((data: Omit<PerformanceMetric, 'id' | 'timestamp'>) => data)
  .handler(async ({ data }) => {
    try {
      const db = await getDB();
      
      const metric: PerformanceMetric = {
        id: crypto.randomUUID(),
        metricType: data.metricType,
        value: data.value,
        metadata: data.metadata,
        timestamp: Date.now()
      };
      
      await db.prepare(`
        INSERT INTO performance_metrics (id, metric_type, value, metadata, timestamp)
        VALUES (?, ?, ?, ?, ?)
      `).bind(
        metric.id,
        metric.metricType,
        metric.value,
        JSON.stringify(metric.metadata),
        metric.timestamp
      ).run();
      
      console.log(`[Performance] Recorded ${data.metricType}: ${data.value}ms`);
      return { success: true, metricId: metric.id };
    } catch (error) {
      console.error('[Performance] Failed to record metric:', error);
      return { success: false, error: 'Failed to record metric' };
    }
  });

/**
 * Get performance summary
 */
export const getPerformanceSummaryFn = createServerFn({ method: "GET" })
  .handler(async () => {
    return await getCachedData(
      'performance_summary',
      async () => {
        const db = await getDB();
        const result = await db.prepare(`
          SELECT 
            COUNT(*) as total_metrics,
            AVG(CASE WHEN metric_type = 'page_load' THEN value END) as avg_page_load,
            AVG(CASE WHEN metric_type = 'api_response' THEN value END) as avg_api_response,
            SUM(CASE WHEN metric_type = 'cache_hit' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as cache_hit_rate,
            SUM(CASE WHEN metric_type = 'error_rate' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as error_rate
          FROM performance_metrics
          WHERE timestamp >= datetime('now', '-24 hours')
        `).first();
        
        // Get top slow pages
        const slowPages = await db.prepare(`
          SELECT 
            JSON_EXTRACT(metadata, '$.url') as url,
            AVG(value) as avg_load_time,
            COUNT(*) as count
          FROM performance_metrics
          WHERE metric_type = 'page_load' AND timestamp >= datetime('now', '-24 hours')
          GROUP BY JSON_EXTRACT(metadata, '$.url')
          HAVING count >= 3
          ORDER BY avg_load_time DESC
          LIMIT 10
        `).all();
        
        // Get top slow endpoints
        const slowEndpoints = await db.prepare(`
          SELECT 
            JSON_EXTRACT(metadata, '$.endpoint') as endpoint,
            AVG(value) as avg_response_time,
            COUNT(*) as count
          FROM performance_metrics
          WHERE metric_type = 'api_response' AND timestamp >= datetime('now', '-24 hours')
          GROUP BY JSON_EXTRACT(metadata, '$.endpoint')
          HAVING count >= 3
          ORDER BY avg_response_time DESC
          LIMIT 10
        `).all();
        
        // Get recent errors
        const recentErrors = await db.prepare(`
          SELECT 
            JSON_EXTRACT(metadata, '$.errorType') as error_type,
            COUNT(*) as count,
            MAX(timestamp) as last_occurrence
          FROM performance_metrics
          WHERE metric_type = 'error_rate' AND timestamp >= datetime('now', '-24 hours')
          GROUP BY JSON_EXTRACT(metadata, '$.errorType')
          ORDER BY count DESC
          LIMIT 10
        `).all();
        
        return {
          totalMetrics: result?.total_metrics || 0,
          averagePageLoad: Math.round(result?.avg_page_load || 0),
          averageApiResponse: Math.round(result?.avg_api_response || 0),
          cacheHitRate: Math.round((result?.cache_hit_rate || 0) * 100) / 100,
          errorRate: Math.round((result?.error_rate || 0) * 100) / 100,
          topSlowPages: slowPages.results?.map((row: any) => ({
            url: row.url || 'Unknown',
            avgLoadTime: Math.round(row.avg_load_time),
            count: row.count
          })) || [],
          topSlowEndpoints: slowEndpoints.results?.map((row: any) => ({
            endpoint: row.endpoint || 'Unknown',
            avgResponseTime: Math.round(row.avg_response_time),
            count: row.count
          })) || [],
          recentErrors: recentErrors.results?.map((row: any) => ({
            errorType: row.error_type || 'Unknown',
            count: row.count,
            lastOccurrence: new Date(row.last_occurrence).toISOString()
          })) || []
        } as PerformanceSummary;
      },
      CACHE_TTL.SEARCH // 10 minutes cache
    );
  });

/**
 * Get detailed metrics for specific time period
 */
export const getDetailedMetricsFn = createServerFn({ method: "GET" })
  .inputValidator((data: { 
    metricType?: string; 
    timeRange: '1h' | '6h' | '24h' | '7d' | '30d';
    limit?: number;
  }) => data)
  .handler(async ({ data }) => {
    const cacheKey = `detailed_metrics:${JSON.stringify(data)}`;
    
    return await getCachedData(
      cacheKey,
      async () => {
        const db = await getDB();
        
        // Calculate time range
        const timeRanges = {
          '1h': "datetime('now', '-1 hour')",
          '6h': "datetime('now', '-6 hours')",
          '24h': "datetime('now', '-24 hours')",
          '7d': "datetime('now', '-7 days')",
          '30d': "datetime('now', '-30 days')"
        };
        
        const timeCondition = timeRanges[data.timeRange];
        let query = `
          SELECT 
            metric_type,
            value,
            metadata,
            timestamp
          FROM performance_metrics
          WHERE timestamp >= ${timeCondition}
        `;
        
        if (data.metricType) {
          query += ` AND metric_type = ?`;
        }
        
        query += ` ORDER BY timestamp DESC`;
        
        if (data.limit) {
          query += ` LIMIT ?`;
        }
        
        const bindValues = data.metricType ? [data.metricType] : [];
        const result = await db.prepare(query)
          .bind(...bindValues)
          .bind(data.limit || 100)
          .all();
        
        return result.results?.map((row: any) => ({
          metricType: row.metric_type,
          value: row.value,
          metadata: JSON.parse(row.metadata || '{}'),
          timestamp: row.timestamp
        })) || [];
      },
      CACHE_TTL.SEARCH
    );
  });

/**
 * Performance monitoring service for automated collection
 */
class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  
  private constructor() {
    this.startFlushing();
  }
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  /**
   * Record a performance metric
   */
  record(metric: Omit<PerformanceMetric, 'id' | 'timestamp'>): void {
    this.metrics.push({
      ...metric,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    });
    
    // Flush if we have too many metrics
    if (this.metrics.length >= 50) {
      this.flushMetrics();
    }
  }
  
  /**
   * Record page load time
   */
  recordPageLoad(url: string, loadTime: number, userAgent?: string): void {
    this.record({
      metricType: 'page_load',
      value: loadTime,
      metadata: { url, userAgent }
    });
  }
  
  /**
   * Record API response time
   */
  recordApiResponse(endpoint: string, responseTime: number, userId?: string): void {
    this.record({
      metricType: 'api_response',
      value: responseTime,
      metadata: { endpoint, userId }
    });
  }
  
  /**
   * Record cache hit
   */
  recordCacheHit(cacheKey: string): void {
    this.record({
      metricType: 'cache_hit',
      value: 1,
      metadata: { cacheKey }
    });
  }
  
  /**
   * Record error
   */
  recordError(errorType: string, url?: string, userId?: string): void {
    this.record({
      metricType: 'error_rate',
      value: 1,
      metadata: { errorType, url, userId }
    });
  }
  
  /**
   * Flush metrics to database
   */
  private async flushMetrics(): Promise<void> {
    if (this.metrics.length === 0) return;
    
    try {
      const db = await getDB();
      
      for (const metric of this.metrics) {
        await db.prepare(`
          INSERT INTO performance_metrics (id, metric_type, value, metadata, timestamp)
          VALUES (?, ?, ?, ?, ?)
        `).bind(
          metric.id,
          metric.metricType,
          metric.value,
          JSON.stringify(metric.metadata),
          metric.timestamp
        ).run();
      }
      
      console.log(`[Performance] Flushed ${this.metrics.length} metrics to database`);
      this.metrics = [];
    } catch (error) {
      console.error('[Performance] Failed to flush metrics:', error);
    }
  }
  
  /**
   * Start periodic flushing
   */
  private startFlushing(): void {
    this.flushInterval = setInterval(() => {
      this.flushMetrics();
    }, 60000); // Flush every minute
  }
  
  /**
   * Cleanup
   */
  cleanup(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flushMetrics();
  }
}

// Global performance monitor instance
export const performanceMonitor = PerformanceMonitor.getInstance();
