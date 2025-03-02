const { GetAllUsers, GetUserById, CreateUser, UpdateUser, DeleteUser } = require('../controllers/users')

function user_routes(fastify, options)
{
    fastify.get('/', GetAllUsers)
    fastify.get('/:id', GetUserById)
    fastify.post('/', CreateUser)
    fastify.put('/:id', UpdateUser)
    fastify.delete('/:id', DeleteUser)
}

module.exports = user_routes
