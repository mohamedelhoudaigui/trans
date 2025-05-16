const FriendshipModel = require('../models/models.friendships');

const FriendshipCtrl = {

	async RemoveFriend(request, reply)
	{
		const { user_id, friend_id } = request.body
		const res = await FriendshipModel.remove_friend(this.db, user_id, friend_id)
		reply.status(res.code).send(res)
	},

	async AddFriend(request, reply)
	{
		const { user_id, friend_id } = request.body
		const res = await FriendshipModel.add_friend(this.db, user_id, friend_id)
		reply.status(res.code).send(res)
	},

	async CheckFriendship(request, reply)
	{
		const user_id = request.params.id
		const { friend_id } = request.body
		const res = await FriendshipModel.check_friendship(this.db, user_id, friend_id)
		reply.status(res.code).send(res)
	},

	async GetFriends(request, reply) {
		const user_id = request.params.id
		const res = await FriendshipModel.get_friends(this.db, user_id)
		reply.status(res.code).send(res)
	},

}

module.exports = FriendshipCtrl