const { user_create, user_delete, user_fetch, user_update, user_all } = require('../models/users');
const { send_response, is_exist } = require('../utils/req_res')

async function GetAllUsers (request, reply) {
    try {
        res = user_all(this.db)
        return send_response(reply, 200, res)

    } catch (err) {
        return send_response(reply, 500, err)
    }
}

async function GetUserById (request, reply) {

    try {
        id = request.params.id
        res = user_fetch(this.db, id)
        return send_response(reply, 200, res)

    } catch(err) {
        return send_response(reply, 500, err)
    }
}

async function CreateUser (request, reply) {

    try {
        { name, email, password } = request.body;
        res = user_create(this.db, name, email, password)
        return send_response(reply, 200, res)

    } catch (err) {
        return send_response(reply, 500, err)
    }
}

async function UpdateUser (request, reply) {

    try {
        id = request.params.id
        { name, email, password } = request.body;
        res = user_update(this.db, id, name, email, password)
        return send_response(reply, 200, res)

    } catch (err) {
        return send_response(reply, 500, err)
    }
}

async function DeleteUser (request, reply) {

    try {
        id = request.params.id
        res = user_delete(this.db, id)
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
