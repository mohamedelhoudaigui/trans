const ChatCtl = require('../controllers/conrollers.chat')

async function ChatRoutes(fastify)
{
	fastify.get('/', { websocket: true }, ChatCtl.get)
}

module.exports = ChatRoutes