const { GetAllUsers, GetUserById, CreateUser, UpdateUser, DeleteUser } = require('../controllers/controllers.users')

function user_routes(fastify)
{
    fastify.post('/', {
        schema: {
            body: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                    name: { type: 'string' },
                    email: { type: 'string' },
                    password: { type: 'string' }
                }
            }
        }

    }, CreateUser)

    fastify.put('/:id', {
        onRequest: [fastify.auth],
        schema: {
            body: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    email: { type: 'string' },
                    password: { type: 'string' }
                }
            }
        }

    }, UpdateUser)

    fastify.get('/',{ onRequest: [fastify.auth] }, GetAllUsers)
    fastify.get('/:id', { onRequest: [fastify.auth] }, GetUserById)
    fastify.delete('/:id', { onRequest: [fastify.auth] } , DeleteUser)
}

module.exports = {
    user_routes,
}
