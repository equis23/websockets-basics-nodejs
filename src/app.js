const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, '/public')));

app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/chat.html'));
});

app.get('/count', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/count.html'));
});

app.get('/stats', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/stats.html'));
});

app.get('/follow-rectangle', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/rectangle.html'));
});

const chat = io.of('chat');

chat.on('connection', (socket) => {
  socket.connectedRoom = '';

  chat.emit('server:user-connected', socket.id);

  socket.on('client:join-room', (room) => {
    socket.leave(socket.connectedRoom);
    socket.connectedRoom = room;
    socket.join(room);
  });

  socket.on('disconnect', () => {
    chat.emit('server:user-disconnected', socket.id);
  });

  socket.on('client:chat-message', (message) => {
    console.log(socket.connectedRoom);
    chat.to(socket.connectedRoom).emit('server:chat-message', message);
  });
});

let counter = 0;
const count = io.of('count');

count.on('connection', (socket) => {
  
  socket.emit('server:actualizar', counter);

  socket.on('client:minus', () => {
    counter--;
    count.emit('server:actualizar', counter);
  });

  socket.on('client:plus', () => {
    counter++;
    count.emit('server:actualizar', counter);
  });
});

let visitas = 0;
let conectados = 0;
const stats = io.of('stats');

stats.on('connection', (socket) => {

  visitas++;
  stats.emit('server:actualizar-visitas', visitas);

  conectados++;
  stats.emit('server:actualizar-conectados', conectados)

  socket.on('disconnect', () => {
    conectados--;
    stats.emit('server:actualizar-conectados', conectados)
  });
});

server.listen(8080, (err) => {
  if (err) return console.log(err);
  return console.log('server up and running at http://localhost:8080');
});