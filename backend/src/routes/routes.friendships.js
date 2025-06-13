const FriendshipCtrl = require('../controllers/controllers.friendships')

function FriendshipRoutes(fastify)
{
	fastify.get('/:id', {
        onRequest: [fastify.auth]
    }, FriendshipCtrl.GetFriends)

    fastify.post('/', {
        onRequest: [fastify.auth]
        schema: {
            body: {
                type: 'object',
                required: ['user_id', 'friend_id'],
                properties: {
                    user_id: { type: 'integer' },
                    friend_id: { type: 'integer' },
                }
            }
        }
    }, FriendshipCtrl.AddFriend)

    fastify.post('/:id', {
        onRequest: [fastify.auth]
        schema: {
            body: {
                type: 'object',
                required: ['friend_id'],
                properties: {
                    friend_id: { type: 'integer' },
                }
            }
        }
    }, FriendshipCtrl.CheckFriendship)

    fastify.delete('/', {
        onRequest: [fastify.auth]
        schema: {
            body: {
                type: 'object',
                required: ['user_id', 'friend_id'],
                properties: {
                    user_id: { type: 'integer' },
                    friend_id: { type: 'integer' },
                }
            }
        }
    }, FriendshipCtrl.RemoveFriend)
}

module.exports = FriendshipRoutes
