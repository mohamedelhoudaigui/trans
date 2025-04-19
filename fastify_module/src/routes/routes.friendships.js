const FriendshipCtrl = require('../controllers/controllers.friendships')

function FriendshipRoutes(fastify)
{
	fastify.get('/:id', { onRequest: [fastify.auth] }, FriendshipCtrl.GetFriends)
    fastify.post('/', {onRequest: [fastify.auth] }, FriendshipCtrl.AddFriend)
    fastify.delete('/', {onRequest: [fastify.auth] }, FriendshipCtrl.RemoveFriend)
}

module.exports = FriendshipRoutes