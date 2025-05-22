const ChatModel = require('../models/models.chat')
const UserModel = require('../models/models.users')

// store active connections
const activeConnections = new Map() // key: user ID, value: socket

const ChatCtl = {

	async ChatSocket(socket, request)
	{
		const authHeader = request.headers.authorization
        const token = authHeader.split(' ')[1]
        const decoded = await request.jwtVerify(token)
        const payload = decoded.payload
		const userId = payload.id

		if (activeConnections.has(userId)) 
		{
			socket.close(4001, 'user already connected')
			return {
				success: false,
				code: 400,
				result: "user already connected"
			}
		}

		activeConnections.set(userId, socket)
		console.log(`user ${userId} connected, total users: ${activeConnections.size}`)

		// send unread messages
		const unread = await ChatModel.chat_get_unread(this.db, userId)
		if (unread.success === true && unread.result.length > 0)
		{
			unread.result.forEach(msg => {
				socket.send(JSON.stringify({
					from: msg.sender_id,
					content: msg.message,
					timestamp: msg.created_at
				}))
			})

			await ChatModel.chat_mark_delivered_bulk(this.db, userId)
		}

		socket.on('message', async (rawMessage) => {

			try
			{
				const message = JSON.parse(rawMessage.toString())

				if (!message.to || !message.content)
				{
					return {
						success: false,
						code: 400,
						result: "invalid message format"
					}
				}

				const res_socket = activeConnections.get(message.to)
				if (res_socket && res_socket.readyState === res_socket.OPEN)
				{
					// sender info and timestamp
					const json_message = {
						from: userId,
						content: message.content,
						timestamp: new Date().toISOString()
					}

					// send to recipient
					res_socket.send(JSON.stringify(json_message))

					// sinse the two users are connected we mark the message as delivered too
					const create_res = await ChatModel.chat_create(this.db, {
						sender_id: userId,
						recipient_id: message.to,
						message: message.content,
						is_delivered: 1,
						delivered_at: new Date().toISOString()
					})


					// send confirmation back to sender (optional)
					socket.send(JSON.stringify({
						status: 'delivered',
						to: message.to,
						timestamp: json_message.timestamp
					}))
				}
				else
				{
					// other user is offline, mark message as undelivered
					await ChatModel.chat_create(this.db, {
                        sender_id: userId,
                        recipient_id: message.to,
                        message: message.content,
						is_delivered: 0
                    })

					// optional too
					socket.send(JSON.stringify({
						status: 'chat stored',
						message: 'this message is stored as non delivered'
					}))
				}
			}
			catch (err)
			{
				console.error('error processing message:', err)
				socket.send(JSON.stringify({
					status: 'error',
					message: 'Invalid message format'
				}))
			}
		})

		// close handler
		socket.on('close', () => {
			activeConnections.delete(userId)
			console.log(`user ${userId} disconnected, total users: ${activeConnections.size}`)
		})
	},

	async ChatAll(request, reply)
	{
		const res = await ChatModel.chat_get_all(this.db)
		reply.code(res.code).send(res)
	},

	async ChatHistory(request, reply)
	{
		const authHeader = request.headers.authorization
        const token = authHeader.split(' ')[1]
        const decoded = await request.jwtVerify(token)
        const payload = decoded.payload
		const senderId = payload.id
		const recId = request.params.id

		const rec_check = await UserModel.user_fetch(this.db, recId)

		if (!rec_check.success)
		{
			return reply.send(404).send({
				success: false,
				code: 404,
				result: "cant find recipient with that id"
			})
		}

		const res = await ChatModel.chat_get_by_id(this.db, senderId, recId)
		reply.code(res.code).send(res)
	}
}

module.exports = ChatCtl