const fastify = require('fastify')({ logger: true })
const fastifyJwt = require('@fastify/jwt')
const fastifyWebSocket = require('@fastify/websocket')
require('dotenv').config()

const initDb = require('./models/models.init')

const UserRoutes = require('./routes/routes.users')
const AuthRoutes = require('./routes/routes.auth')
const FriendshipRoutes = require('./routes/routes.friendships')
const ChatRoutes = require('./routes/routes.chat')

// // Plugins:
fastify.register(require('./plugins/plugins.db'))
fastify.register(require('./plugins/plugins.auth'))
fastify.register(fastifyJwt, {
    secret: process.env.JWT_KEY
})
fastify.register(fastifyWebSocket);

initDb(fastify)

// // Routes:
fastify.register(UserRoutes, { prefix: '/api/users' })
fastify.register(AuthRoutes, { prefix: '/api/auth' })
fastify.register(FriendshipRoutes, { prefix: '/api/friend' })
fastify.register(ChatRoutes, { prefix: '/api/chat' })


// // Server shutdown handler:
const listeners = ['SIGINT', 'SIGTERM']
listeners.forEach((signal) => {
    process.on(signal, async () => {
        fastify.log.info('shuting down server...')
        await fastify.close()
        process.exit(0)
    })
})

async function start()
{
    try
    {
        await fastify.listen({ host: '0.0.0.0', port: process.env.PORT || 3000 });
        fastify.log.info(`Server listening ${fastify.server.address().port}`);
    }
    catch(err)
    {
        fastify.log.error(err);
        process.exit(1);
    }
}

start()
