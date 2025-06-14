const fastify = require('fastify')({ logger: true });
const fastifyJwt = require('@fastify/jwt');
const fastifyWebSocket = require('@fastify/websocket');

const promClient = require('prom-client'); // Import Prometheus client for metrics


require('dotenv').config();

const initDb = require('./models/models.init');

const UserRoutes = require('./routes/routes.users');
const AuthRoutes = require('./routes/routes.auth');
const FriendshipRoutes = require('./routes/routes.friendships');
const ChatRoutes = require('./routes/routes.chat');
const GameRoutes = require('./routes/routes.game')


// Prometheus Metrics Setup
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 }); // Collect default Node.js metrics

// Custom Metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

const wsConnections = new promClient.Gauge({
  name: 'websocket_connections_active',
  help: 'Number of active WebSocket connections',
  labelNames: ['route']
});

const dbQueryDuration = new promClient.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1]
});

// Metrics Endpoint
fastify.get('/metrics', async (request, reply) => {
  reply.header('Content-Type', promClient.register.contentType);
  return promClient.register.metrics();
});

// Middleware to Track HTTP Request Metrics
fastify.addHook('onRequest', async (request, reply) => {
  request.startTime = Date.now();
});

fastify.addHook('onResponse', async (request, reply) => {
  const duration = (Date.now() - request.startTime) / 1000;
  httpRequestDuration.labels(
    request.method,
    request.routerPath || request.url,
    reply.statusCode.toString()
  ).observe(duration);
});

// Plugins
fastify.register(require('./plugins/plugins.db'));
fastify.register(require('./plugins/plugins.auth'));
fastify.register(fastifyJwt, {
  secret: process.env.JWT_KEY
});

fastify.register(fastifyWebSocket);

// WebSocket Connection Tracking
fastify.register(async function (fastify) {
  fastify.get('/api/chat/ws', { websocket: true }, (connection, req) => {
    wsConnections.inc({ route: '/api/chat/ws' });
    connection.socket.on('close', () => {
      wsConnections.dec({ route: '/api/chat/ws' });
    });
  });
});

// Database Metrics (Assuming plugins.db exposes a query function)
fastify.decorate('trackDbQuery', async function (operation, queryFn) {
  const end = dbQueryDuration.startTimer({ operation });
  try {
    const result = await queryFn();
    end();
    return result;
  } catch (err) {
    end();
    throw err;
  }
});

initDb(fastify);

// Routes
fastify.register(UserRoutes, { prefix: '/api/users' });
fastify.register(AuthRoutes, { prefix: '/api/auth' });
fastify.register(FriendshipRoutes, { prefix: '/api/friend' });
fastify.register(ChatRoutes, { prefix: '/api/chat' });
fastify.register(GameRoutes, { prefix: '/api/game' })

// CORS (remove in production)
fastify.register(require('@fastify/cors'), {
  origin: true,
  credentials: true
});

// Health Check Endpoint
fastify.get('/health', async (request, reply) => {
  return { status: 'healthy' };
});

// Server Shutdown Handler
const listeners = ['SIGINT', 'SIGTERM'];
listeners.forEach((signal) => {
  process.on(signal, async () => {
    fastify.log.info('Shutting down server...');
    await fastify.close();
    process.exit(0);
  });
});

// create mock clients for testing

async function start() {
  try {
    await fastify.listen({ host: '0.0.0.0', port: process.env.PORT || 3000 });
    fastify.log.info(`Server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
