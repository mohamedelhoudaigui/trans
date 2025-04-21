const AuthCtl = require('../controllers/controllers.auth')

async function AuthRoutes(fastify)
{
    fastify.post('/login', AuthCtl.Login)
    fastify.post('/refresh', {onRequest: [fastify.auth] }, AuthCtl.Refresh)
    fastify.post('/logout', {onRequest: [fastify.auth] }, AuthCtl.Logout)
}

module.exports = AuthRoutes