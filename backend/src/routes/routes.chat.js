const ChatCtl = require('../controllers/conrollers.chat')

async function ChatRoutes(fastify)
{
	fastify.get('/', {
		onRequest: [fastify.auth],
		websocket: true

	}, ChatCtl.chat_socket)
}

module.exports = ChatRoutes