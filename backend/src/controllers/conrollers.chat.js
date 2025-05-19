const ChatModel = require('../models/models.chat')

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

		if (!userId)
		{
			socket.close(4000, 'User ID is required')
			return
		}

		if (activeConnections.has(userId)) 
		{
			socket.close(4001, 'User already connected')
			return
		}

		activeConnections.set(userId, socket)
		console.log(`user ${userId} connected, total users: ${activeConnections.size}`)


		socket.on('message', async (rawMessage) => {

			try
			{
				const message = JSON.parse(rawMessage.toString())

				if (!message.to || !message.content)
				{
					console.log('invalid message format:\n' + message)
					return
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

					// store msg into the db
					const create_res = await ChatModel.chat_create(this.db, {
						sender_id: userId,
						recipient_id: message.to,
						message: message.content
					})

					if (create_res.success)
					{
                    	await ChatModel.chat_mark_delivered(this.db, createResult.result.lastInsertRowid)
                    }

					// send confirmation back to sender
					socket.send(JSON.stringify({
						status: 'delivered',
						to: message.to,
						timestamp: json_message.timestamp
					}))
				}
				else
				{
					await ChatModel.chat_create(this.db, {
                        sender_id: userId,
                        recipient_id: message.to,
                        message: message.content
                    })

					// Recipient not available
					socket.send(JSON.stringify({
						status: 'error',
						message: 'Recipient not available'
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

	async ChatHistory(request, reply)
	{
		const authHeader = request.headers.authorization
        const token = authHeader.split(' ')[1]
        const decoded = await request.jwtVerify(token)
        const payload = decoded.payload
		const senderId = payload.id
		const recId = request.params.id


		const res = ChatModel.chat_get_by_id(this.db, senderId, recId)
		return res
	}
}

module.exports = ChatCtl