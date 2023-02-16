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

app.get('/rectangle', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/rectangle.html'));
});

// chat
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

// count
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

// stats
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

// rectangle
const rectangle = io.of('rectangle');

const generateRandonInt = (min, max) => {
  return Math.floor((Math.random() * (max - min + 1)) + min);
}

const generateRGBColor = () => {
  const rgb = [];
  for (let i = 0; i < 3; i++) {
    rgb.push(generateRandonInt(0, 255));
  }
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

rectangle.on('connection', (socket) => {

  rectangle.emit('server:start', generateRGBColor());

});

server.listen(8080, (err) => {
  if (err) return console.log(err);
  return console.log('server up and running at http://localhost:8080');
});
