const ChatCtl = require('../controllers/conrollers.chat')

async function ChatRoutes(fastify)
{
	fastify.get('/socket', {
		onRequest: [fastify.auth],
		websocket: true

	}, ChatCtl.ChatSocket)

	fastify.get('/:id', {
		onRequest: [fastify.auth]

	}, ChatCtl.ChatHistory)

	fastify.get('/', {
		onRequest: [fastify.auth]

	}, ChatCtl.ChatProfiles)


	fastify.put('/', ChatCtl.ChatAll) // dev only


}

module.exports = ChatRoutes