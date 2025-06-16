// backend/src/app.js
const fastify = require('fastify')({ logger: true });
const fastifyJwt = require('@fastify/jwt');
const fastifyWebSocket = require('@fastify/websocket');
const promClient = require('prom-client');
require('dotenv').config();

// --- Module Imports ---
const initDb = require('./models/models.init');
const UserRoutes = require('./routes/routes.users');
const AuthRoutes =require('./routes/routes.auth');
const FriendshipRoutes = require('./routes/routes.friendships');
const ChatRoutes = require('./routes/routes.chat');
const GameRoutes = require('./routes/routes.game');

// ======================================================================================
// I. PLUGIN REGISTRATION 
// ======================================================================================

// --- CORE FUNCTIONALITY PLUGINS ---
// These add fundamental capabilities like database access and authentication.
fastify.register(require('./plugins/plugins.db'));
fastify.register(require('./plugins/plugins.auth'));
fastify.register(fastifyJwt, {
  secret: process.env.JWT_KEY || 'a-secure-secret-key-that-is-long-and-random', // Fallback for safety
});
fastify.register(fastifyWebSocket);


// --- CORS PLUGIN  ---
fastify.register(require('@fastify/cors'), {
  origin: (origin, cb) => {
    // For development, we can be permissive. A production environment
    // would have a strict whitelist of allowed origins from an env variable.
    // 'true' reflects the request origin, which is simple and effective for this stage.
    cb(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] // Explicitly allow all needed methods
});


// ======================================================================================
// II. METRICS & MONITORING : If It Moves, Metric It.
// ======================================================================================

const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics();

// Custom metric for tracking the duration of HTTP requests.
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 10] // Buckets in seconds
});

// Custom metric for tracking active WebSocket connections.
const wsConnections = new promClient.Gauge({
    name: 'websocket_connections_active',
    help: 'Number of active WebSocket connections',
});

// Hook to track HTTP request metrics.
// This calculates the elapsed time for each request and records it in our histogram.
fastify.addHook('onResponse', (request, reply, done) => {
    // We don't want to record metrics for the metrics endpoint itself.
  if (request.routeOptions && request.routeOptions.url !== '/metrics') {
      httpRequestDuration
          .labels(request.method, request.routeOptions.url, reply.statusCode)
          .observe((reply.elapsedTime) / 1000);
  }
  done();
});

// Expose the /metrics endpoint for Prometheus to scrape.
fastify.get('/metrics', async (request, reply) => {
  reply.header('Content-Type', promClient.register.contentType);
  return promClient.register.metrics();
});

// Decorator to track WebSocket connections.
// This is a placeholder; actual tracking will happen in route definitions.
fastify.decorate('wsConnections', wsConnections);

// ======================================================================================
// III. DATABASE & ROUTE REGISTRATION
// ======================================================================================

// Initialize the database schemas.
initDb(fastify);

// Register all API routes. These are now correctly protected by the CORS plugin.
fastify.register(UserRoutes, { prefix: '/api/users' });
fastify.register(AuthRoutes, { prefix: '/api/auth' });
fastify.register(FriendshipRoutes, { prefix: '/api/friend' });
fastify.register(ChatRoutes, { prefix: '/api/chat' });
fastify.register(GameRoutes, { prefix: '/api/game' });

// Health Check Endpoint for container health monitoring.
fastify.get('/health', async (request, reply) => {
  return { status: 'healthy' };
});


// ======================================================================================
// IV. SERVER STARTUP & SHUTDOWN
// ======================================================================================

/**
 * Starts the Fastify server.
 */
async function start() {
  try {
    await fastify.listen({ host: '0.0.0.0', port: process.env.PORT || 3000 });
    fastify.log.info(`Server listening on port ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

/**
 * Handles graceful shutdown on receiving SIGINT or SIGTERM signals.
 * This ensures the server closes connections cleanly before exiting.
 */
const listeners = ['SIGINT', 'SIGTERM'];
listeners.forEach((signal) => {
  process.on(signal, async () => {
    fastify.log.info('Shutdown signal received. Closing server...');
    await fastify.close();
    process.exit(0);
  });
});

// Ignite the server.
start();
