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