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
        const { name, email, password } = request.body;
        const res = await UserRepo.user_create({ name, email, password })
        reply.status(res.code).send(res)
    },

    async UpdateUser (request, reply)
    {
        const id = request.params.id
        const { name, email, password } = request.body;
        const res = await UserRepo.user_update(id, { name, email, password })
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