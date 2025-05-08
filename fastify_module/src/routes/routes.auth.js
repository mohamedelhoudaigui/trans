const AuthCtl = require('../controllers/controllers.auth')

async function AuthRoutes(fastify)
{
    fastify.post('/login', {
        schema: {
            body: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string' },
                    password: { type: 'string' }
                }
            }
        }

    },AuthCtl.Login)

    fastify.post('/refresh/:id', {
        // onRequest: [fastify.auth]
        schema: {
            body: {
                type: 'object',
                required: ['refresh_token'],
                properties: {
                    refresh_token: { type: 'string' }
                }
            }
        }

    }, AuthCtl.Refresh)

    fastify.get('/logout/:id', {
        // onRequest: [fastify.auth]

    }, AuthCtl.Logout)
}

module.exports = AuthRoutes