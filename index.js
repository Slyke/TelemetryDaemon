const https = require('https');
const http = require('http');
const { Readable } = require('stream');
const si = require('systeminformation');

const BODY_BUF_SIZE = 1024;

let sendPort = process.env.PORT ?? '1880';
let hostname = process.env.HOSTNAME;
let route = process.env.ROUTE ?? '';
let useHttp = process.env.HTTP === 'true' ? true : false;
let method = process.env.METHOD ?? 'POST';
let filterList = process.env.FILTER;
let outputResult = process.env.OUTPUTRESULT;
let outputResponse = process.env.OUTPUTRESPONSE;

let username = process.env.USERNAME;
let password = process.env.PASSWORD;

const printHelp = () => {
  console.log('Telemetry Daemon');
  console.log('  Sends useful stats of this host to a endpoint of your choosing.');
  console.log('');
  console.log('  CLI params take priority over environment variables');
  console.log('  {} = Default value');
  console.log('  [] = Required value');
  console.log('');
  console.log('Usage [Environment Variables]:');
  console.log('  * PORT                = {"1880"}    - Port of remote host');
  console.log('  * [HOSTNAME]                        - Hostname of remote host');
  console.log('  * ROUTE               = {""}        - Path on remote host');
  console.log('  * HTTP                = {"false"}   - Use HTTP instead of HTTPS');
  console.log('  * METHOD              = {"POST"}    - HTTP request method');
  console.log('  * USERNAME            = {empty}     - Basic auth username');
  console.log('  * PASSWORD            = {empty}     - Basic auth password');
  console.log('  * FILTER              = {empty}     - If set, only return these objects');
  console.log('  * OUTPUTRESULT        = {false}     - If true, prints what is sent to server');
  console.log('  * OUTPUTRESPONSE      = {false}     - If true, prints the server\'s reply');
  console.log('');
  console.log('Usage [CLI Params]:');
  console.log('  * --port              = {"1880"}    - Port of remote host');
  console.log('  * [--hostname]                      - Hostname of remote host');
  console.log('  * --route             = {""}        - Path on remote host');
  console.log('  * --http              = {"false"}   - Use HTTP instead of HTTPS');
  console.log('  * --method            = {"POST"}    - HTTP request method');
  console.log('  * --username          = {empty}     - Basic auth username');
  console.log('  * --password          = {empty}     - Basic auth password');
  console.log('  * --filter            = {empty}     - If set, only return these objects');
  console.log('  * --output-result     = {false}     - If true, prints what is sent to server');
  console.log('  * --output-response   = {false}     - If true, prints the server\'s reply');
  console.log('  * -h|--help                         - Show this menu');
  console.log('');
  console.log('Example:');
  console.log('  npm start --hostname "yourserver.com" --route "/telemetry"');
  console.log('');
};

const processCliArgs = (args) => {
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '-h':
      case '--help': {
        printHelp();
        process.exit(0);
        break;
      }

      case '-p':
      case '--port': {
        try {
          if (Number.isFinite(Number.parseInt(args[i + 1]))) {
            sendPort = args[i + 1];
            i++;
            continue;
          }
          console.error(`port '${args[i + 1]}' is not a number.`);
        } catch (err) {
          console.error(`port '${args[i + 1]}'`);
          console.error('processCliArgs: Error on parseInt:');
          console.error(err);
          process.exit(1);
        }
        break;
      }

      case '-f':
      case '--filter': {
        try {
          filterList = args[i + 1];
          i++;
          continue;
        } catch (err) {
          console.error(`filter '${args[i + 1]}'`);
          console.error('processCliArgs: Error on setting filter:');
          console.error(err);
          process.exit(1);
        }
        break;
      }

      case '-host':
      case '--host':
      case '--hostname': {
        try {
          hostname = args[i + 1];
          i++;
          continue;
        } catch (err) {
          console.error(`hostname '${args[i + 1]}'`);
          console.error('processCliArgs: Error on setting hostname:');
          console.error(err);
          process.exit(1);
        }
        break;
      }

      case '-p':
      case '-r':
      case '--path':
      case '--route': {
        try {
          route = args[i + 1];
          i++;
          continue;
        } catch (err) {
          console.error(`route '${args[i + 1]}'`);
          console.error('processCliArgs: Error on setting route:');
          console.error(err);
          process.exit(1);
        }
        break;
      }

      case '-http':
      case '--http': {
        try {
          useHttp = args[i + 1] === 'true' ? true : false;
          continue;
        } catch (err) {
          console.error(`http '${args[i + 1]}'`);
          console.error('processCliArgs: Error on setting http:');
          console.error(err);
          process.exit(1);
        }
        break;
      }

      case '-osr':
      case '--output-response': {
        try {
          outputResponse = args[i + 1] === 'true' ? true : false;
          continue;
        } catch (err) {
          console.error(`outputResponse '${args[i + 1]}'`);
          console.error('processCliArgs: Error on setting outputResponse:');
          console.error(err);
          process.exit(1);
        }
        break;
      }

      case '-or':
      case '--output-result': {
        try {
          outputResult = args[i + 1] === 'true' ? true : false;
          continue;
        } catch (err) {
          console.error(`outputResult '${args[i + 1]}'`);
          console.error('processCliArgs: Error on setting outputResult:');
          console.error(err);
          process.exit(1);
        }
        break;
      }

      case '-m':
      case '--method': {
        try {
          method = args[i + 1];
          i++;
          continue;
        } catch (err) {
          console.error(`method '${args[i + 1]}'`);
          console.error('processCliArgs: Error on setting method:');
          console.error(err);
          process.exit(1);
        }
        break;
      }

      case '-u':
      case '--username': {
        try {
          username = args[i + 1];
          i++;
          continue;
        } catch (err) {
          console.error(`username '${args[i + 1]}'`);
          console.error('processCliArgs: Error on setting basic auth username:');
          console.error(err);
          process.exit(1);
        }
        break;
      }

      case '-pw':
      case '-pass':
      case '--pass':
      case '--password': {
        try {
          password = args[i + 1];
          i++;
          continue;
        } catch (err) {
          console.error(`password length: ${args[i + 1]?.length}`);
          console.error('processCliArgs: Error on setting password:');
          console.error(err);
          process.exit(1);
        }
        break;
      }

    }
  }
};

const checkCliParams = () => {
  const errorList = [];
  if (!hostname) {
    errorList.push(`[--hostname]: Hostname not set.`);
  }

  if (!route && route !== "") {
    errorList.push(`[-r]: Route/URL not set.`);
  }

  if (!method) {
    errorList.push(`[-m]: method not set.`);
  }

  if (!Number.isFinite(Number.parseInt(sendPort)) || sendPort < 1) {
    errorList.push(`[-p]: Port is not set, or is not a positive integer`);
  }

  if (errorList.length > 0) {
    printHelp();
    console.log('')
    console.error('Error:')
    throw new Error(errorList.join("\r\n"));
  }
};

processCliArgs(process.argv);
checkCliParams();

const httpExec = useHttp ? http : https;

let auth;
if (username || password) {
  auth = Buffer.from(username + ':' + password).toString('base64');
}

let sendData = {};
let sendErrors = {};
const promiseArr = [];

promiseArr.push(si.getAllData("", "").then((data) => {
  sendData = data;
  let listOfDetails = [
    'version',
    'system',
    'bios',
    'baseboard',
    'chassis',
    'os',
    'uuid',
    'versions',
    'cpu',
    'graphics',
    'net',
    'memLayout',
    'time',
    'node',
    'v8',
    'cpuCurrentSpeed',
    'battery',
    'services',
    'wifiNetworks',
    'bluetoothDevices',
    'currentLoad',
    'disksIO',
    'fsSize',
    // 'networkConnections', // Large
    'fsStats',
    'networkStats',
    'mem',
    // 'users', // Not necessary
    // 'processes', // Large
    'temp',
    'inetLatency'
  ];

  if (typeof filterList === 'string' && filterList !== '') {
    listOfDetails = filterList.split(',').map((filterName) => {
      return filterName.trim();
    });
  }

  if (listOfDetails.length > 0) {
    Object.keys(sendData).forEach((k) => {
      if (!listOfDetails.includes(k)) {
        delete sendData[k];
      }
    });
  }
}).catch((error) => {
  sendErrors = error;
}));

promiseArr.push(si.bluetoothDevices().then((data) => {
  sendData['bluetoothDevices'] = data;
}).catch((error) => {
  sendErrors['bluetoothDevices'] = error;
}));

Promise.allSettled(promiseArr).then(() => {
  if (outputResult) {
    console.log(JSON.stringify(sendData, null, 2));
  }
  const body = JSON.stringify(sendData) + '    '; // Spaces are for protobuffs
  var re = new RegExp('.{1,' + BODY_BUF_SIZE + '}', 'g');
  const packetChunks = body.match(re);

  console.log(`Sending ${body.length} bytes (${packetChunks.length} chunks) to (Basic Auth: ${auth ? 'true' : 'false'}):`);
  console.log(`  [${method}] ${useHttp ? 'http' : 'https'}://${hostname}:${sendPort}${route.startsWith("/") ? route : '/' + route}`);

  const options = {
  hostname,
  port: sendPort,
  path: route,
  method,
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': body.length
    }
  };

  if (auth) {
    options.headers['Authorization'] = `Basic ${auth}`;
  }
  
  const req = httpExec.request(options, (res) => {
    console.log(`Response statusCode: ${res.statusCode}`);
    if (outputResponse) {
      let dBuf = '';
      res.on('data', (data) => {
        dBuf += data;
      });

      res.on('end', (data) => {
        console.log(dBuf);
      });
    }
  });

  const stream = Readable.from(packetChunks);

  stream.on('data', (data) => {
    if (req.write(data) === false) {
      stream.pause();
    }
  });

  req.on('error', (error) => {
    console.error(error);
  });

  req.on('drain', (error) => {
    stream.resume();
  });

  stream.on('end', (data) => {
    (() => {
      req.end();
    })();
  });
});
