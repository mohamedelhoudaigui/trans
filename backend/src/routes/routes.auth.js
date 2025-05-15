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

    // create 2fa secret for the session user
    fastify.get('/2fa_create', { onRequest: [fastify.auth] }, AuthCtl.TwofaCreate)

    // get 2fa secret for the session user
    fastify.get('/2fa_get', { onRequest: [fastify.auth] }, AuthCtl.TwofaGet)

    // delete 2fa secret for the session user
    fastify.delete('/2fa_delete', { onRequest: [fastify.auth] }, AuthCtl.TwofaDelete)

}

module.exports = AuthRoutes