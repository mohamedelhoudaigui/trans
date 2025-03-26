const UserRepo = require('../models/models.users');
const { send_response, does_exist } = require('../utils/utils.req_res')
const { hash_password } = require('../utils/utils.security')

const UserCtrl = {

    async GetAllUsers (request, reply) {

        const res = await UserRepo.user_all()
        return send_response(reply, res.code, res)
    },

    async GetUserById (request, reply) {

        const id = request.params.id
        const res = await UserRepo.user_fetch(this.id)
        return send_response(reply, res.code, res)
    },

    async CreateUser (request, reply) {

        const { name, email, password } = request.body;
        const res = await UserRepo.user_create({ name, email, hashed_password })
        return send_response(reply, res.code, res)
    },

    async UpdateUser (request, reply) {

        const id = request.params.id
        const { name, email, password } = request.body;
        const res = await UserRepo.user_update(id, { name, email, password })
        return send_response(reply, res.code, res)
    },

    async DeleteUser (request, reply) {

        const id = request.params.id
        const res = await UserRepo.user_delete(id)
        return send_response(reply, res.code, res)
    }
}

module.exports = UserCtrl
