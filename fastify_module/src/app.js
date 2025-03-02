const fastify = require('fastify')({ logger: true })
const { setup_user_table } = require('./models/users');
const user_routes = require('./routes/users')
require("dotenv").config()


fastify.register(require('./plugins/db_plugin'));
fastify.register(user_routes, { prefix: '/api/users' })

// make db tables :
setup_user_table(fastify)

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
