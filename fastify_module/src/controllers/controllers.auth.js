const { send_response } = require('../utils/utils.req_res')
const { verify_password, gen_jwt_token } = require('../utils/utils.security')
const { refresh_tokens_create, refresh_tokens_check, refresh_tokens_delete } = require('../models/models.refresh_tokens')
require('dotenv').config()

async function Login(request, reply) {
    try {
        const { email, password } = request.body
        if (!email || !password)
            return send_response(reply, 400, "email and password are required")

        const valid = await verify_password(this.db, email, password)
        if (!valid)
            return send_response(reply, 401, "invalid user credentials")

        const access_token = gen_jwt_token(this, email, process.env.ACCESS_TOKEN_EXPIRE || '15m')
        const refresh_token = gen_jwt_token(this, email, process.env.REFRESH_TOKEN_EXPIRE || '15d')

        refresh_tokens_create(this.db, refresh_token)

        return send_response(reply, 200, { access_token, refresh_token })

    } catch (err) {
        return send_response(reply, 500, err)
    }
}

async function Refresh(request, reply) {
    try {
        const { refresh_token } = request.body
        if (!refresh_token)
            return send_response(reply, 400, "refresh token required")

        const decoded_token = this.jwt.verify(refresh_token)
        if (!refresh_tokens_check(this.db, refresh_token))
            send_response(reply, 403, 'invalid refresh token')

        const new_access_token = gen_jwt_token(this, decoded_token.email, process.env.ACCESS_TOKEN_EXPIRE)

        return send_response(reply, 200, new_access_token)

    } catch (err) {
         if (err instanceof jwt.TokenExpiredError) {
            await refresh_tokens_delete(this.db, refresh_token);
            return send_response(reply, 403, 'refresh token expired');
        }
        return send_response(reply, 500, err.message);
    }
}

async function Logout(request, reply) {
    try {
        const { refresh_token } = request.body;
        if (!refresh_token)
            return send_response(reply, 400, "refresh token required");

        await refresh_tokens_delete(this.db, refresh_token);
        return send_response(reply, 200, "Successfully logged out");

    } catch (err) {
        return send_response(reply, 500, err.message);
    }
}

modle.exports = {
    Login,
    Refresh,
    Logout
}
