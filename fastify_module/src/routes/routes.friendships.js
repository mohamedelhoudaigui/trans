const { AddFriend, RemoveFriend, GetFriends } = require('../controllers/controllers.friendships')

function friendship_routes(fastify)
{
	fastify.get('/:id', { onRequest: [fastify.auth] }, GetFriends)
    fastify.post('/', {onRequest: [fastify.auth] }, AddFriend)
    fastify.delete('/', {onRequest: [fastify.auth] }, RemoveFriend)
}

module.exports = {
	friendship_routes,
}