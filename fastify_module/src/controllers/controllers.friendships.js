const FriendshipRepo = require('../models/models.friendships');

const FriendshipCtrl = {

	async RemoveFriend(request, reply)
	{
		const { user_id, friend_id } = request.body
		const res = await FriendshipRepo.remove_friend(user_id, friend_id)
		reply.status(res.code).send(res)
	},

	async AddFriend(request, reply)
	{
			const { user_id, friend_id } = request.body
			const res = await FriendshipRepo.addFriend(this.db, user_id, friend_id)
			reply.status(res.code).send(res)
	},

	async GetFriends(request, reply) {
		const user_id = request.params.id
		const res = await get_friends(this.db, user_id)
		reply.status(res.code).send(res)
	},

}

module.exports = FriendshipCtrl
