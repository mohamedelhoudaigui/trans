const { user_create, user_delete, user_fetch, user_update, user_all } = require('../models/models.users');
const { send_response, is_exist } = require('../utils/utils.req_res')

async function GetAllUsers (request, reply) {
    try {
        const res = user_all(this.db)
        return send_response(reply, 200, res)

    } catch (err) {
        return send_response(reply, 500, err)
    }
}

async function GetUserById (request, reply) {

    try {
        const id = request.params.id
        const res = user_fetch(this.db, id)
        return send_response(reply, 200, res)

    } catch(err) {
        return send_response(reply, 500, err)
    }
}

async function CreateUser (request, reply) {

    try {
        const { name, email, password } = request.body;
        const res = user_create(this.db, name, email, password)
        return send_response(reply, 200, res)

    } catch (err) {
        return send_response(reply, 500, err)
    }
}

async function UpdateUser (request, reply) {

    try {
        const id = request.params.id
        const { name, email, password } = request.body;
        const res = user_update(this.db, id, name, email, password)
        return send_response(reply, 200, res)

    } catch (err) {
        return send_response(reply, 500, err)
    }
}

async function DeleteUser (request, reply) {

    try {
        const id = request.params.id
        const res = user_delete(this.db, id)
        return send_response(reply, 200, res)

    } catch (err) {
        return send_response(reply, 500, err)
    }
}

module.exports = {
    GetAllUsers,
    GetUserById,
    CreateUser,
    UpdateUser,
    DeleteUser,
}
