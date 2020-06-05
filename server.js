const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const messageData = require('./message');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./user');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));

//run when client connects

io.on('connection', (socket) => {
	socket.on('joinRoom', ({ username, room }) => {
		const user = userJoin(socket.id, username, room);
		socket.join(user.room);

		socket.emit('message', messageData('admin', 'welcome to chat room'));

		socket.broadcast
			.to(user.room)
			.emit(
				'message',
				messageData('admin', `${user.username} has joined the chat`)
			);
		io.to(user.room).emit('roomUsers', {
			room: user.room,
			users: getRoomUsers(user.room),
		});
	});

	socket.on('chatMessage', (msg) => {
		const user = getCurrentUser(socket.id);

		io.to(user.room).emit('message', messageData(user.username, msg));
	});

	socket.on('disconnect', () => {
		const user = userLeave(socket.id);
		if (user) {
			io.to(user.room).emit(
				'message',
				messageData('admin', `${user.username} has left the chat`)
			);
		}
	});
});

const port = process.env.PORT || 5500;
server.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
