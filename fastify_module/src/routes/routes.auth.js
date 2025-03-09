const { Login, Refresh } = require('../controllers/controllers.auth')

async function auth_routes(fastify)
{
    fastify.post('/login', Login)
    fastify.post('/refresh', Refresh)
}

module.exports = {
    auth_routes,
}
