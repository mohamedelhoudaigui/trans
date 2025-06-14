const ChatCtl = require('../controllers/controllers.chat')

async function ChatRoutes(fastify)
{
	fastify.get('/socket', {
		// The onRequest hook has been removed.
		// Authentication is now correctly handled inside the ChatSocket controller
		// by reading the token from the query parameter.
		websocket: true
	}, ChatCtl.ChatSocket)

	// --- These other routes are fine as they are ---
	fastify.get('/:id', {
		onRequest: [fastify.auth]
	}, ChatCtl.ChatHistory)

	fastify.get('/', {
		onRequest: [fastify.auth]
	}, ChatCtl.ChatProfiles)

	// This is your dev-only route
	fastify.put('/', ChatCtl.ChatAll)
}

module.exports = ChatRoutes
