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
// I. PLUGIN REGISTRATION (Order is Critical)
// Axiom IV.B: Foundations First, Then Skyhooks.
// ======================================================================================

fastify.register(require('./plugins/plugins.db'));
fastify.register(require('./plugins/plugins.auth'));
fastify.register(fastifyJwt, {
  secret: process.env.JWT_KEY || 'a-very-secure-fallback-secret-for-dev',
});
fastify.register(fastifyWebSocket);

// --- CORS PLUGIN (MUST BE REGISTERED BEFORE ROUTES) ---
// Axiom: The bouncer must be at the door before the guests arrive.
fastify.register(require('@fastify/cors'), {
  origin: true, // Reflects the request origin. Simple and effective for dev.
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
});

// ======================================================================================
// II. METRICS & MONITORING (Axiom IV.D: If It Moves, Metric It)
// ======================================================================================

const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics();
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
});
fastify.addHook('onResponse', (request, reply, done) => {
  if (request.routeOptions && request.routeOptions.url !== '/metrics') {
      httpRequestDuration
          .labels(request.method, request.routeOptions.url, reply.statusCode)
          .observe((reply.elapsedTime) / 1000);
  }
  done();
});
fastify.get('/metrics', async (request, reply) => {
  reply.header('Content-Type', promClient.register.contentType);
  return promClient.register.metrics();
});

// ======================================================================================
// III. DATABASE & ROUTE REGISTRATION
// ======================================================================================

initDb(fastify);

// CORRECTED: Register all API routes with proper path prefixes.
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

async function start() {
  try {
    await fastify.listen({ host: '0.0.0.0', port: process.env.PORT || 3000 });
    fastify.log.info(`Server listening on port ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}
const listeners = ['SIGINT', 'SIGTERM'];
listeners.forEach((signal) => {
  process.on(signal, async () => {
    fastify.log.info('Shutdown signal received. Closing server...');
    await fastify.close();
    process.exit(0);
  });
});

start();
