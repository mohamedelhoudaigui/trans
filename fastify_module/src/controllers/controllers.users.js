const UserRepository = require('../models/models.users');
const { send_response, does_exist } = require('../utils/utils.req_res')
const { hash_password } = require('../utils/utils.security')

async function GetAllUsers (request, reply) {

    const res = await UserRepository.user_all()
    return send_response(reply, res.code, res)
}

async function GetUserById (request, reply) {

    const id = request.params.id
    const res = await UserRepository.user_fetch(this.id)
    return send_response(reply, res.code, res)
}

async function CreateUser (request, reply) {

    const { name, email, password } = request.body;
    const res = await user_create({ name, email, hashed_password })
    return send_response(reply, res.code, res)
}

async function UpdateUser (request, reply) {

    const id = request.params.id
    const { name, email, password } = request.body;
    const res = await user_update(id, { name, email, password })
    return send_response(reply, res.code, res)
}

async function DeleteUser (request, reply) {

    const id = request.params.id
    const res = await user_delete(id)
    return send_response(reply, res.code, res)
}

module.exports = {
    GetAllUsers,
    GetUserById,
    CreateUser,
    UpdateUser,
    DeleteUser,
}
