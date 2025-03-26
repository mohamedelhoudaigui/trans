const UserCtrl = require('../controllers/controllers.users')

function UserRoutes(fastify)
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

    }, UserCtrl.CreateUser)

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

    }, UserCtrl.UpdateUser)

    fastify.get('/', UserCtrl.GetAllUsers)
    fastify.get('/:id', { onRequest: [fastify.auth] }, UserCtrl.GetUserById)
    fastify.delete('/:id', { onRequest: [fastify.auth] } , UserCtrl.DeleteUser)
}

module.exports = UserRoutes
