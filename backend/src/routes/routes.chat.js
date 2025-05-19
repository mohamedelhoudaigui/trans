const ChatCtl = require('../controllers/conrollers.chat')

async function ChatRoutes(fastify)
{
	fastify.get('/', {
		onRequest: [fastify.auth],
		websocket: true

	}, ChatCtl.ChatSocket),

	fastify.get('/:id', {
		onRequest: [fastify.auth]

	}, ChatCtl.ChatHistory)
}

module.exports = ChatRoutes