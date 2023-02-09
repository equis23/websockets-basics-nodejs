const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);

app.use(express.static('/public'));

server.listen(8080, (err) => {
  if (err) return console.log(err);
  return console.log('server up and running at http://localhost:8080');
});