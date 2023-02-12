const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, '/public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

let socketRoom = '';

io.on('connection', (socket) => {
  io.emit('server:user-connected', socket.id);

  socket.on('client:join-room', (room) => {
    socket.join(room);
    socketRoom = room;
  });

  socket.on('disconnect', () => {
    io.emit('server:user-disconnected', socket.id);
  });

  socket.on('client:chat-message', (message) => {
    io.to(socketRoom).emit('server:chat-message', message);
  });
});

server.listen(8080, (err) => {
  if (err) return console.log(err);
  return console.log('server up and running at http://localhost:8080');
});