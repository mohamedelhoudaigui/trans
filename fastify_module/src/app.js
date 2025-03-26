const fastify = require('fastify')({ logger: true })
require('dotenv').config()

const UserRoutes = require('./routes/routes.users')
const { auth_routes } = require('./routes/routes.auth')
const { friendship_routes } = require('./routes/routes.friendships')
const { shutdown_handler } = require('./utils/utils.server')

// Plugins:
fastify.register(require('./plugins/plugins.db'));
fastify.register(require('./plugins/plugins.auth'));
fastify.register(require('@fastify/jwt'), { secret: process.env.JWT_KEY });

// Routes:
fastify.register(UserRoutes, { prefix: '/api/users' })
fastify.register(auth_routes, { prefix: '/api/auth' })
fastify.register(friendship_routes, { prefix: '/api/friend' })

// Utility:
shutdown_handler(fastify)

async function start() {

    try {
        await fastify.listen({ port: process.env.PORT || 3000 });
        fastify.log.info(`Server listening ${fastify.server.address().port}`);
    }
    catch(err)
    {
        fastify.log.error(err);
        process.exit(1);
    }
}

start()
