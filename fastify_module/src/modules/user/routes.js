const { user_create, user_delete, user_fetch, user_update, user_all } = require('./serve');
const { send_response, is_exist } = require('../../utils/req_res.js')



function user_routes(app)
{
    app.get('/api/user_all', async function handler (request, reply) {
        try {
            res = user_all(app.db)
            return send_response(reply, 200, res)
        } catch (err) {
            return send_response(reply, 500, "error fetching all users")
        }
    })

    app.get('/api/user_fetch', async function handler (request, reply) {
        id = request.query.id

        try {
            res = user_fetch(app.db, id)
            return send_response(reply, 200, res)

        } catch(err) {
            return send_response(reply, 500, "error fetching the user")
        }
    })

    app.get('/api/user_create', async function handler (request, reply) {
        name = request.query.name
        email = request.query.email
        password = request.query.password

        try {
            res = user_create(app.db, name, email, password)
            return send_response(reply, 200, res)
        } catch (err) {
            return send_response(reply, 500, "error creating user")
        }
    })


    app.get('/api/user_update', async function handler (request, reply) {
        id = request.query.id
        name = request.query.name
        email = request.query.email
        password = request.query.password

        try {
            res = user_update(app.db, id, name, email, password)
            return send_response(reply, 200, res)
        } catch (err) {
            console.log(err)
            return send_response(reply, 500, "error updating the user")
        }
    })

    app.get('/api/user_delete', async function handler (request, reply) {
        id = request.query.id

        try {
            res = user_delete(app.db, id)
            return send_response(reply, 200, res)
        } catch (err) {
            return send_response(reply, 500, "error deleting user")
        }
    })
}

module.exports = user_routes
