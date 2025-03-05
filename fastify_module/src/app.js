const fastify = require('fastify')({ logger: true })
require('dotenv').config()

const { user_routes } = require('./routes/routes.users')
const { auth_routes } = require('./routes/routes.auth')
const { setup_user_table } = require('./models/models.users');
const { auth } = require('./middlewares/middlewares.auth')
const { shutdown_handler } = require('./utils/utils.server')

// Plugins:
fastify.register(require('./plugins/plugins.db'));
fastify.register(require('@fastify/jwt'), { secret: process.env.JWT_KEY });

// Routes:
fastify.register(user_routes, { prefix: '/api/users' })
fastify.register(auth_routes, { prefix: '/api/auth' })

// Hooks:
// fastify.addHook('preHandler', auth)

// Utilitys:
setup_user_table(fastify)
shutdown_handler(fastify)

// server_start:
const start = async () => {
    try
    {
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
