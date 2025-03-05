const { GetAllUsers, GetUserById, CreateUser, UpdateUser, DeleteUser } = require('../controllers/controllers.users')
const { create_user_schema, update_user_schema } = require('../models/models.users')

function user_routes(fastify)
{
    fastify.get('/', GetAllUsers)
    fastify.get('/:id', GetUserById)
    fastify.post('/', create_user_schema(), CreateUser)
    fastify.put('/:id', update_user_schema(), UpdateUser)
    fastify.delete('/:id', DeleteUser)
}

module.exports = {
    user_routes,
}
