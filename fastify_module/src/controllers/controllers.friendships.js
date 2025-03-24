const { send_response } = require('../utils/utils.req_res')
const { add_friend, remove_friend, get_friends, check_friendship } = require('../models/models.friendships')

async function RemoveFriend(request, reply)
{
	try {
		const { user_id, friend_id } = request.body

		const is_friend = await check_friendship(this.db, user_id, friend_id)

		if (is_friend)
		{
			const res = await remove_friend(this.db, user_id, friend_id)
			return send_response(reply, 200, { 
                success: true, 
                message: "Friend removed successfully"
            })
		}
		return send_response(reply, 409, { 
			success: false, 
			message: "Users are not friends" 
		})
	}
	catch (err)
	{
		return send_response(reply, 500, { 
            success: false, 
            message: "Internal server error",
            error: err.message 
        })
	}
}
async function AddFriend(request, reply)
{
	try {
		const { user_id, friend_id } = request.body

		const is_friend = await check_friendship(this.db, user_id, friend_id)

		if (!is_friend)
		{
			const res = await add_friend(this.db, user_id, friend_id)
			return send_response(reply, 200, { 
                success: true, 
                message: "Friend added successfully" 
            })
		}
		return send_response(reply, 409, { 
			success: false, 
			message: "Users are already friends" 
		})
	}
	catch (err)
	{
		return send_response(reply, 500, { 
            success: false, 
            message: "Internal server error",
            error: err.message 
        })
	}
}

async function GetFriends(request, reply) {
	try {
		const user_id = request.params.id
		const res = await get_friends(this.db, user_id)
		return send_response(reply, 200, {
			success: true,
			message: res,
		})
	}
	catch (err)
	{
		return send_response(reply, 500, { 
            success: false, 
            message: "Internal server error",
            error: err.message 
        })
	}
}

module.exports = {
	AddFriend,
	RemoveFriend,
	GetFriends
}