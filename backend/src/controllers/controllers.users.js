const { check_and_sanitize } = require('../utils/utils.security')
const UserModel = require('../models/models.users');

const UserCtrl = {

    async GetAllUsers (request, reply)
    {
        const res = await UserModel.user_all(this.db)
        reply.status(res.code).send(res)
    },

    async GetUserById (request, reply)
    {
        const id = request.params.id
        const res = await UserModel.user_fetch(this.db, id)
        reply.status(res.code).send(res)
    },
    
    async GetMyProfile(request, reply) {
    // The `fastify.auth` plugin has already run because we will protect this route.
    // This means `request.user` is now available and contains the decoded JWT payload.
        const userId = request.user.payload.id;

    // The 'this' object here refers to the fastify instance, which has the db connection.
        const res = await UserModel.user_fetch(this.db, userId);

    // The user_fetch function returns the user without the password,
    // so it's already safe to send back to the client.
        reply.status(res.code).send(res);
    },

    async CreateUser (request, reply)
    {
        const { name, email, password, avatar } = request.body;
        errors = check_and_sanitize({ name, email, password, avatar })
        if (errors.length !== 0)
        {
            return {
                success: false,
                code: 400,
                result: errors.pop()
            }
        }
        const res = await UserModel.user_create(this.db, name, email, password, avatar)
        reply.status(res.code).send(res)
    },

    async UpdateUser (request, reply)
    {
        const id = request.params.id
        const { name, email, password, avatar } = request.body;
        errors = check_and_sanitize({ name, email, password, avatar })
        if (errors.length !== 0)
        {
            return {
                success: false,
                code: 400,
                result: errors.pop()
            }
        }
        const res = await UserModel.user_update(this.db, id, name, email, password, avatar)
        reply.status(res.code).send(res)
    },

    async DeleteUser (request, reply)
    {
        const id = request.params.id
        const res = await UserModel.user_delete(this.db, id)
        reply.status(res.code).send(res)
    }
}

module.exports = UserCtrl
