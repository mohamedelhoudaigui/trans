
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
                message: "Friend removed successfully",
                result: res
            })
		}
		return send_response(reply, 409, {
			success: false,
			message: "Users are not friends",
            result: {}
		})
	}
	catch (err)
	{
		return send_response(reply, 500, {
            success: false,
            message: err.message,
            result: {}
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
                message: "Friend added successfully",
                result: res
            })
		}
		return send_response(reply, 409, {
			success: false,
			message: "Users are already friends",
            result: {}
		})
	}
	catch (err)
	{
		return send_response(reply, 500, {
            success: false,
            message: "Internal server error",
            result: err.message
        })
	}
}

async function GetFriends(request, reply) {
	try {
		const user_id = request.params.id
		const res = await get_friends(this.db, user_id)
		return send_response(reply, 200, {
			success: true,
			message: "Friends getted successfully",
            result: res
		})
	}
	catch (err)
	{
		return send_response(reply, 500, {
            success: false,
            message: err.message,
            result: {}
        })
	}
}

module.exports = {
	AddFriend,
	RemoveFriend,
	GetFriends
}
