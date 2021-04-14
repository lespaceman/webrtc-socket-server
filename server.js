const express = require('express');
const fs = require('fs');
const https = require('https');
const app = express();
const socket = require('socket.io');

const users = {};

const privateKey = fs.readFileSync('./socket-server.revlity.com/privkey.pem', 'utf8');
const certificate = fs.readFileSync('./socket-server.revlity.com/cert.pem', 'utf8');
const ca = fs.readFileSync('./socket-server.revlity.com/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

const httpsServer = https.createServer(credentials, app);
const io = socket(httpsServer);

io.on('connection', (socket) => {
	if (!users[socket.id]) {
		users[socket.id] = socket.id;
	}
	socket.emit('yourID', socket.id);
	io.sockets.emit('allUsers', users);
	socket.on('disconnect', () => {
		delete users[socket.id];
	});

	socket.on('callUser', (data) => {
		io.to(data.userToCall).emit('hey', { signal: data.signalData, from: data.from });
	});

	socket.on('acceptCall', (data) => {
		io.to(data.to).emit('callAccepted', data.signal);
	});
});

httpsServer.listen(8000, () => console.log('server is running on port 8000'));
