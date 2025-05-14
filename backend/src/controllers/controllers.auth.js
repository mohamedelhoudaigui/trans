const RefreshtokenModel = require('../models/models.refresh_tokens')
const UserModel = require('../models/models.users')
const bcrypt = require('bcrypt')
const { gen_jwt_token } = require('../utils/utils.security')
require('dotenv').config()

const AuthCtl = {

    async Login (request, reply)
    {
        const { email, password } = request.body
        const res = await UserModel.user_fetch_by_email(this.db, email)
        if (res.success === false)
        {
            return res
        }

        const is_valid = await bcrypt.compare(password, res.result.password)
        if (is_valid === false)
        {
            return {
                success: false,
                code: 401,
                result: "wrong password"
            }
        }

        // remove all refresh_tokens for the user
        await RefreshtokenModel.refresh_tokens_delete_by_id(this.db, res.result.id);

        const access_token = gen_jwt_token(this, res.result, process.env.ACCESS_TOKEN_EXPIRE)
        const refresh_token = gen_jwt_token(this, res.result, process.env.REFRESH_TOKEN_EXPIRE)

        const create_token = await RefreshtokenModel.refresh_tokens_create(this.db, res.result.id, refresh_token)
        if (!create_token.success)
        {
            return create_token
        }

        reply.status(res.code).send({
            success: true,
            code: 200,
            result: {
                access_token: access_token,
                refresh_token: refresh_token
            }
        })
    },

    async Refresh(request, reply)
    {
        const { refresh_token } = request.body
        const decoded_token = this.jwt.verify(refresh_token)
        const user_id = decoded_token.payload.id

        const res = await RefreshtokenModel.refresh_tokens_check_by_token(this.db, user_id, refresh_token)

        if (!res.success)
        {
            reply.status(res.code).send(res)
            return
        }

        const new_access_token = gen_jwt_token(this, decoded_token.payload, process.env.ACCESS_TOKEN_EXPIRE)

        reply.status(res.code).send({
            success: true,
            code: 200,
            result: new_access_token
        })
    },

    async Logout(request, reply)
    {
        const { refresh_token } = request.body
        const decoded_token = this.jwt.verify(refresh_token)
        const user_id = decoded_token.payload.id
        const res = await RefreshtokenModel.refresh_tokens_delete_by_id(this.db, user_id);
        reply.status(res.code).send(res)
    }
}

module.exports = AuthCtl