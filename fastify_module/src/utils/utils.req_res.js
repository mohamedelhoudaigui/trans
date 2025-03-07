const { verify_password } = require('../utils/utils.security')

function send_response(reply, code, data) {
    reply.status(code).send(data);
}

module.exports = {
    send_response,
}

