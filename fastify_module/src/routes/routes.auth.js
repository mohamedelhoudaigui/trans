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

    fastify.post('/refresh', {
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

    fastify.delete('/logout', {
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

    }, AuthCtl.Logout)
}

module.exports = AuthRoutes