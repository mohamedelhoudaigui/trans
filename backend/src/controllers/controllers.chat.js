const ChatModel = require('../models/models.chat')
const UserModel = require('../models/models.users')

const activeConnections = new Map()

const ChatCtl = {

	async ChatSocket(socket, request) {
        const token = request.query.token;
        if (!token) {
            socket.close(4001, 'Authentication token missing');
            return;
        }

        try {
            const decoded = await request.server.jwt.verify(token);
            const payload = decoded.payload;
            const userId = payload.id;

            if (activeConnections.has(userId)) {
                socket.close(4001, 'User already connected');
                return;
            }

            activeConnections.set(userId, socket);
            console.log(`User ${userId} connected, total users: ${activeConnections.size}`);

            const unread = await ChatModel.chat_get_unread(this.db, userId);
            if (unread.success && unread.result.length > 0) {
                unread.result.forEach(msg => {
                    socket.send(JSON.stringify({
                        from: msg.sender_id,
                        to: msg.recipient_id,
                        content: msg.message,
                        timestamp: msg.created_at
                    }));
                });
                await ChatModel.chat_mark_delivered_bulk(this.db, userId);
            }

            socket.on('message', async (rawMessage) => {
                try {
                    const message = JSON.parse(rawMessage.toString());
                    if (!message.to || !message.content) return;

                    const json_message = {
                        from: userId,
                        to: message.to,
                        content: message.content,
                        timestamp: new Date().toISOString()
                    };

                    const res_socket = activeConnections.get(message.to);
                    const isDelivered = (res_socket && res_socket.readyState === res_socket.OPEN);

                    if (isDelivered) {
                        res_socket.send(JSON.stringify(json_message));
                    }
                    
                    // This ensures the sender's UI updates immediately.
                    socket.send(JSON.stringify(json_message));

                    await ChatModel.chat_create(this.db, {
                        sender_id: userId,
                        recipient_id: message.to,
                        message: message.content,
                        is_delivered: isDelivered ? 1 : 0,
                        delivered_at: isDelivered ? json_message.timestamp : null
                    });

                } catch (err) {
                    console.error('Error processing message:', err);
                }
            });

            socket.on('close', () => {
                activeConnections.delete(userId);
                console.log(`User ${userId} disconnected, total users: ${activeConnections.size}`);
            });

        } catch (err) {
            console.error('WebSocket auth error:', err.message);
            socket.close(4002, 'Invalid authentication token');
        }
	},

	async ChatAll(request, reply) {
		const res = await ChatModel.chat_get_all(this.db)
		reply.code(res.code).send(res)
	},

	async ChatHistory(request, reply) {
		const authHeader = request.headers.authorization;
        const token = authHeader.split(' ')[1];
        const decoded = await request.jwtVerify(token);
        const payload = decoded.payload;
		const senderId = payload.id;
		const recId = request.params.id;

		const rec_check = await UserModel.user_fetch(this.db, recId);
		if (!rec_check.success) {
			return reply.status(404).send({ success: false, code: 404, result: "Recipient not found" });
		}
        // model for getting chat history should get messages between BOTH users. OBVIOUSLY a bro
		const res = await ChatModel.chat_get_by_id(this.db, senderId, recId);
		reply.code(res.code).send(res);
	},

	async ChatProfiles(request, reply) {
		const authHeader = request.headers.authorization;
        const token = authHeader.split(' ')[1];
        const decoded = await request.jwtVerify(token);
        const payload = decoded.payload;
		const senderId = payload.id;
		
		const res = await ChatModel.chat_get_profiles(this.db, senderId);
		reply.code(res.code).send(res);
	}
}

module.exports = ChatCtl;
