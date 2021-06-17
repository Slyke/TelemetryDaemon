const http = require('http');

http.createServer((req, res) => {
  req.on('data', (data) => {
    console.log(data.toString());
  });
  res.write('{"received":true}');
  res.end();
}).listen(1880, '0.0.0.0');
