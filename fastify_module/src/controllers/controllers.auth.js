const { send_response, check_user } = require('../utils/utils.req_res')

async function Login(request, reply) {
    try {
        const { email, password } = request.body
        if (check_user(this.db, email, password))
        {
            const token = this.jwt.sign({ email, password })
            send_response(reply, 200, token)
        } else {
            send_response(reply, 401, "invalid user credentials")
        }

    } catch (err) {
        send_response(reply, 500, err)
    }
}

module.exports = {
    Login,
}
