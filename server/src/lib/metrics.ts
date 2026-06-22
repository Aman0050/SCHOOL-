import client from 'prom-client';

// Create a Registry
const register = new client.Registry();

// Add default metrics (CPU, Memory, Event Loop Lag)
client.collectDefaultMetrics({ register, prefix: 'eduxeno_' });

// Custom Metrics

// 1. API Request Duration Histogram
export const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'eduxeno_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});
register.registerMetric(httpRequestDurationMicroseconds);

// 2. Active WebSockets Counter
export const activeWebSockets = new client.Gauge({
  name: 'eduxeno_active_websockets',
  help: 'Number of currently active WebSocket connections'
});
register.registerMetric(activeWebSockets);

// 3. Database Query Duration
export const dbQueryDuration = new client.Histogram({
  name: 'eduxeno_db_query_duration_seconds',
  help: 'Duration of Database queries in seconds',
  labelNames: ['model', 'operation'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2]
});
register.registerMetric(dbQueryDuration);

export { register };
