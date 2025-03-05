const { send_response } = require('../utils/utils.req_res')
require("dotenv").config()

async function auth(request, reply) {
    const api_key = request.headers['x-header']
    const known_key = process.env.APIKEY
    if (!api_key || api_key !== known_key)
    {
        send_response(reply, 401, { error: "unauthorized" })
    }
}

module.exports = {
    auth,
}
