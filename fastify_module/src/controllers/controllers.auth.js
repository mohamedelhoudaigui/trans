const RefreshTokenRepo = require('../models/models.refresh_tokens')
const UserRepo = require('../models/models.users')
const { gen_jwt_token } = require('../utils/utils.security')
require('dotenv').config()

const AuthCtl = {

    async Login (request, reply)
    {
        const { email, password } = request.body
        const res = UserRepo.user_login(email, password)

        if (!res.success)
        {
            reply.status(res.code).send(res)
            return ;
        }

        const access_token = gen_jwt_token(this, { email }, process.env.ACCESS_TOKEN_EXPIRE)
        const refresh_token = gen_jwt_token(this, { email }, process.env.REFRESH_TOKEN_EXPIRE)
        RefreshTokenRepo.refresh_tokens_create(refresh_token)

        reply.status(res.code).send({ access_token, refresh_token })
    },

    async Refresh(request, reply)
    {
        const { refresh_token } = request.body
        const decoded_token = this.jwt.verify(refresh_token)
        const res = RefreshTokenRepo.refresh_tokens_check(refresh_token)

        if (!res.success)
        {
            reply.status(res.code).send(res)
            return ;
        }

        const new_access_token = gen_jwt_token(this, decoded_token.email, process.env.ACCESS_TOKEN_EXPIRE)
        reply.status(res.code).send({ new_access_token })
    },

    async Logout(request, reply)
    {
        const { refresh_token } = request.body;
        const res = refresh_tokens_delete(refresh_token);
        reply.status(res.code).send(res)
    }

}

module.exports = AuthCtl