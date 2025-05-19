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

	fastify.put('/', ChatCtl.ChatAll)
}

module.exports = ChatRoutes