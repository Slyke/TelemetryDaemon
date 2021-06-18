const http = require('http');
let i = 0;
let buf = '';
http.createServer((req, res) => {
  req.on('data', (data) => {
    buf += data;
    console.log(i, data.toString());
    i++;
  });

  req.on('end', (d) => {
    let parsed = false;
    try {
      const obj = JSON.parse(buf);
      parsed = typeof obj === 'object';
    } catch {} // Do nothing
    i = 0;
    buf = '';
    const output = `{"received":true,"count":${i}},"parsed":${parsed}}`;
    res.write(output);
    res.end();
    console.log(output);
    console.log('');
  });
}).listen(1880, '0.0.0.0');
