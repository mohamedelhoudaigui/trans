const fp = require('fastify-plugin');
const { send_response } = require('../utils/utils.req_res')

async function authPlugin(fastify, options) {

    fastify.decorate("auth", async function(request, reply) {
        try {
            await request.jwtVerify()
        } catch (err) {
            send_response(reply, 401, err)
        }
    })
}


module.exports = fp(authPlugin)
