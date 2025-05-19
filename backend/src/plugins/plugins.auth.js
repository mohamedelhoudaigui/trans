const fp = require('fastify-plugin');

async function authPlugin(fastify, options) {

    fastify.decorate("auth", async function(request, reply) {
        try {
            await request.jwtVerify()
        } catch (err) {
            reply.status(401).send(err.message)
        }
    })
}

module.exports = fp(authPlugin)
