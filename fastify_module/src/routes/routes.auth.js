const { Login } = require('../controllers/controllers.auth')

async function auth_routes(fastify)
{
    fastify.post('/login', Login)
}

module.exports = {
    auth_routes,
}
