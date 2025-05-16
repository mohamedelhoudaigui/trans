const ChatCtl = {

	async get(socket, req)
	{
		socket.on('message', message => {
			console.log('Received message:', message.toString());
			socket.send('hi from server')
		})

		socket.on('close', () => {
			console.log('Client disconnected');
		})
	}
}

module.exports = ChatCtl