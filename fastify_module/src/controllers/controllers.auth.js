const { send_response } = require('../utils/utils.req_res')
const { verify_password } = require('../utils/utils.security')

async function Login(request, reply) {
    try {
        const { email, password } = request.body
        const valid = await verify_password(this.db, email, password)
        if (valid)
        {
            const token = this.jwt.sign({ email, password })
            send_response(reply, 200, token)
        } else
        {
            send_response(reply, 401, "invalid user credentials")
        }

    } catch (err) {
        send_response(reply, 500, err)
    }
}

module.exports = {
    Login,
}
