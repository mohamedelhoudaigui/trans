const fastify = require('fastify')({ logger: true });
const fastifyjwt = require('@fastify/jwt');
const fastifywebsocket = require('@fastify/websocket');
const promclient = require('prom-client');
require('dotenv').config();

// --- module imports ---
const initdb = require('./models/models.init');
const userroutes = require('./routes/routes.users');
const authroutes =require('./routes/routes.auth');
const friendshiproutes = require('./routes/routes.friendships');
const chatroutes = require('./routes/routes.chat');
const gameroutes = require('./routes/routes.game');

// ======================================================================================
// i. plugin registration (order is critical)
// axiom iv.b: foundations first, then skyhooks.
// ======================================================================================

fastify.register(require('./plugins/plugins.db'));
fastify.register(require('./plugins/plugins.auth'));
fastify.register(fastifyjwt, {
  secret: process.env.jwt_key || 'a-very-secure-fallback-secret-for-dev',
});
fastify.register(fastifywebsocket);

// --- cors plugin (must be registered before routes) ---
// axiom: the bouncer must be at the door before the guests arrive.
fastify.register(require('@fastify/cors'), {
  origin: true, // reflects the request origin. simple and effective for dev.
  credentials: true,
  methods: ['get', 'post', 'put', 'delete', 'options']
});

// ======================================================================================
// ii. metrics & monitoring (axiom iv.d: if it moves, metric it)
// ======================================================================================

const collectdefaultmetrics = promclient.collectdefaultmetrics;
collectdefaultmetrics();
const httprequestduration = new promclient.histogram({
  name: 'http_request_duration_seconds',
  help: 'duration of http requests in seconds',
  labelnames: ['method', 'route', 'status_code'],
});
fastify.addhook('onresponse', (request, reply, done) => {
  if (request.routeoptions && request.routeoptions.url !== '/metrics') {
      httprequestduration
          .labels(request.method, request.routeoptions.url, reply.statuscode)
          .observe((reply.elapsedtime) / 1000);
  }
  done();
});
fastify.get('/metrics', async (request, reply) => {
  reply.header('content-type', promclient.register.contenttype);
  return promclient.register.metrics();
});

// ======================================================================================
// iii. database & route registration
// ======================================================================================

initdb(fastify);

// corrected: register all api routes with proper path prefixes.
fastify.register(userroutes, { prefix: '/api/users' });
fastify.register(authroutes, { prefix: '/api/auth' });
fastify.register(friendshiproutes, { prefix: '/api/friend' });
fastify.register(chatroutes, { prefix: '/api/chat' });
fastify.register(gameroutes, { prefix: '/api/game' });

// health check endpoint for container health monitoring.
fastify.get('/health', async (request, reply) => {
  return { status: 'healthy' };
});

// ======================================================================================
// iv. server startup & shutdown
// ======================================================================================

async function start() {
  try {
    await fastify.listen({ host: '0.0.0.0', port: process.env.port || 3000 });
    fastify.log.info(`server listening on port ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}
const listeners = ['sigint', 'sigterm'];
listeners.foreach((signal) => {
  process.on(signal, async () => {
    fastify.log.info('shutdown signal received. closing server...');
    await fastify.close();
    process.exit(0);
  });
});

start();
