import fs from 'fs';
import debug from 'debug';


const logerror = debug('tetris:error'),
  logInfo = debug('tetris:info');

const initApp = (app, params, cb) => {
  const { host, port } = params;
  const handler = (req, res) => {
    const file = req.url === '/bundle.js' ? '/../../build/bundle.js' : '/../../index.html';
    fs.readFile(__dirname + file, (err, data) => {
      if (err) {
        logerror(err);
        res.writeHead(500);
        return res.end('Error loading index.html')
      }
      res.writeHead(200);
      res.end(data)
    })
  };

  app.on('request', handler);

  app.listen({ host, port }, () => {
    logInfo(`tetris listen on ${params.url}`);
    cb()
  })
};

const initEngine = io => {
  io.on('connection', (socket) => {
    logInfo("Socket connected: " + socket.id);
    socket.join('room 123', () => {
      const clients = io.in('room 123').clients((err, clients) => {
        console.log(clients);
      });
    });
    console.log(io.sockets.adapter.rooms);

    socket.on('getRoom', (room) => {
      console.log(room.room);
    });
    socket.on('action', (action) => {
      if (action.type === 'server/ping') {
        socket.emit('action', { type: 'pong' })
      }
    });
    socket.on('getPiece', (action) => {
      console.log(action);
      io.emit('getPiece2', {
        pos: { x: 0, y: 0},
        prevPos: false,
        tetromino: [
          [0, 1, 0, 0],
          [0, 1, 0, 0],
          [0, 1, 0, 0],
          [0, 1, 0, 0],
        ]
      })
    });
  });
};

export function create(params) {
  const promise = new Promise( (resolve, reject) => {
    const app = require('http').createServer();
    initApp(app, params, () => {
      const io = require('socket.io')(app);
      const stop = (cb) => {
        io.close();
        app.close(() => {
          app.unref()
        });
        logInfo('Engine stopped.');
        cb()
      };

      initEngine(io);
      resolve({ stop });
    })
  });
  return promise
}