const AuthCtl = require('../controllers/controllers.auth')

async function AuthRoutes(fastify)
{
    fastify.post('/login', AuthCtl.Login)
    fastify.post('/refresh', AuthCtl.Refresh)
    fastify.post('/logout', AuthCtl.Logout)
}

module.exports = AuthRoutes