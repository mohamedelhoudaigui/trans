const { Login, Refresh, Logout } = require('../controllers/controllers.auth')

async function auth_routes(fastify)
{
    fastify.post('/login', Login)
    fastify.post('/refresh', Refresh)
    fastify.post('/logout', Logout)
}

module.exports = {
    auth_routes,
}
