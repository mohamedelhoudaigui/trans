const { check_and_sanitize } = require('../utils/utils.security')
const UserRepo = require('../models/models.users');

const UserCtrl = {

    async GetAllUsers (request, reply)
    {
        const res = await UserRepo.user_all()
        reply.status(res.code).send(res)
    },

    async GetUserById (request, reply)
    {
        const id = request.params.id
        const res = await UserRepo.user_fetch(this.id)
        reply.status(res.code).send(res)
    },

    async CreateUser (request, reply)
    {
        const { name, email, password, avatar } = request.body;
        // sanitize data :
        const errors = check_and_sanitize({ name, email, password })
        if (errors.length > 0)
        {
            return reply.status(400).send(
                {
                    success: false,
                    code: 400,
                    error: errors
                }
            );
        }

        const res = await UserRepo.user_create({name, email, password, avatar})
        reply.status(res.code).send(res)
    },

    async UpdateUser (request, reply)
    {
        const id = request.params.id
        const { name, email, password, avatar } = request.body;
        // sanitize data :
        const errors = check_and_sanitize({ name, email, password })
        if (errors.length > 0)
        {
            return reply.status(400).send(
                {
                    success: false,
                    code: 400,
                    error: errors
                }
            );
        }

        const res = await UserRepo.user_update(id, { name, email, password, avatar })
        reply.status(res.code).send(res)
    },

    async DeleteUser (request, reply)
    {
        const id = request.params.id
        const res = await UserRepo.user_delete(id)
        reply.status(res.code).send(res)
    }
}

module.exports = UserCtrl