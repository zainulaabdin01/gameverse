/**
 * Performance Dashboard Component
 * Displays real-time performance metrics and analytics
 */

import { useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { 
  Activity, 
  Clock, 
  Database, 
  AlertTriangle, 
  TrendingUp,
  Server,
  Zap
} from "lucide-react";
import { getPerformanceSummaryFn, getDetailedMetricsFn } from "@/performance/metrics-collector";

export interface PerformanceDashboardProps {
  className?: string;
}

export function PerformanceDashboard({ className }: PerformanceDashboardProps) {
  const [summary, setSummary] = useState<any>(null);
  const [detailedMetrics, setDetailedMetrics] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d' | '30d'>('24h');
  const [selectedMetric, setSelectedMetric] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Load performance summary
  useEffect(() => {
    loadPerformanceSummary();
    const interval = setInterval(loadPerformanceSummary, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  // Load detailed metrics
  useEffect(() => {
    loadDetailedMetrics();
  }, [timeRange, selectedMetric]);

  const loadPerformanceSummary = async () => {
    try {
      const result = await getPerformanceSummaryFn();
      setSummary(result);
    } catch (error) {
      console.error('[Dashboard] Failed to load performance summary:', error);
    }
  };

  const loadDetailedMetrics = async () => {
    setIsLoading(true);
    try {
      const result = await getDetailedMetricsFn({
        metricType: selectedMetric || undefined,
        timeRange,
        limit: 100
      });
      setDetailedMetrics(result);
    } catch (error) {
      console.error('[Dashboard] Failed to load detailed metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatValue = (value: number, metricType: string) => {
    switch (metricType) {
      case 'page_load':
      case 'api_response':
        return `${value}ms`;
      case 'cache_hit':
      case 'error_rate':
        return `${value}%`;
      default:
        return value.toString();
    }
  };

  const getMetricIcon = (metricType: string) => {
    switch (metricType) {
      case 'page_load': return <Clock className="h-4 w-4" />;
      case 'api_response': return <Zap className="h-4 w-4" />;
      case 'cache_hit': return <Database className="h-4 w-4" />;
      case 'error_rate': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (value: number, metric: string) => {
    switch (metric) {
      case 'page_load':
        return value < 2000 ? 'text-green-500' : value < 5000 ? 'text-yellow-500' : 'text-red-500';
      case 'api_response':
        return value < 500 ? 'text-green-500' : value < 1000 ? 'text-yellow-500' : 'text-red-500';
      case 'cache_hit':
        return value > 80 ? 'text-green-500' : value > 60 ? 'text-yellow-500' : 'text-red-500';
      case 'error_rate':
        return value < 1 ? 'text-green-500' : value < 5 ? 'text-yellow-500' : 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  if (!summary) {
    return (
      <div className={`p-6 bg-surface border border-border rounded-lg ${className || ''}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="h-8 w-8 mx-auto mb-4 text-muted-foreground animate-pulse" />
            <p className="text-muted-foreground">Loading performance data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Page Load</p>
              <p className={`text-2xl font-bold ${getStatusColor(summary.averagePageLoad, 'page_load')}`}>
                {summary.averagePageLoad}ms
              </p>
            </div>
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg API Response</p>
              <p className={`text-2xl font-bold ${getStatusColor(summary.averageApiResponse, 'api_response')}`}>
                {summary.averageApiResponse}ms
              </p>
            </div>
            <Zap className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Cache Hit Rate</p>
              <p className={`text-2xl font-bold ${getStatusColor(summary.cacheHitRate, 'cache_hit')}`}>
                {summary.cacheHitRate}%
              </p>
            </div>
            <Database className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Error Rate</p>
              <p className={`text-2xl font-bold ${getStatusColor(summary.errorRate, 'error_rate')}`}>
                {summary.errorRate}%
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-2">
              Time Range
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="w-full p-2 border border-border rounded-md bg-surface text-foreground"
            >
              <option value="1h">Last Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-2">
              Metric Type
            </label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="w-full p-2 border border-border rounded-md bg-surface text-foreground"
            >
              <option value="">All Metrics</option>
              <option value="page_load">Page Load Time</option>
              <option value="api_response">API Response Time</option>
              <option value="cache_hit">Cache Hit Rate</option>
              <option value="error_rate">Error Rate</option>
              <option value="user_interaction">User Interactions</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={loadDetailedMetrics}
              disabled={isLoading}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Metrics Chart */}
      {detailedMetrics.length > 0 && (
        <div className="bg-surface border border-border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Detailed Metrics - {timeRange}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={detailedMetrics}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatTime}
                className="text-xs"
              />
              <YAxis className="text-xs" />
              <Tooltip 
                formatter={(value: any, name: any) => [
                  formatValue(value, name),
                  name
                ]}
                labelFormatter={(label: any) => formatTime(label)}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Slow Pages */}
      {summary.topSlowPages.length > 0 && (
        <div className="bg-surface border border-border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Slow Pages
          </h3>
          <div className="space-y-2">
            {summary.topSlowPages.map((page: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {page.url}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {page.count} loads
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${getStatusColor(page.avgLoadTime, 'page_load')}`}>
                    {page.avgLoadTime}ms
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Slow Endpoints */}
      {summary.topSlowEndpoints.length > 0 && (
        <div className="bg-surface border border-border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Server className="h-5 w-5" />
            Top Slow Endpoints
          </h3>
          <div className="space-y-2">
            {summary.topSlowEndpoints.map((endpoint: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {endpoint.endpoint}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {endpoint.count} requests
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${getStatusColor(endpoint.avgResponseTime, 'api_response')}`}>
                    {endpoint.avgResponseTime}ms
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Errors */}
      {summary.recentErrors.length > 0 && (
        <div className="bg-surface border border-border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Recent Errors
          </h3>
          <div className="space-y-2">
            {summary.recentErrors.map((error: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {error.errorType}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {error.count} occurrences
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {new Date(error.lastOccurrence).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
