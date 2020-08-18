import Koa from 'koa';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';
import http from 'http';
import socketIO from 'socket.io';

import setupSocketServer from './socket/setupSocketServer';
import roomRoutes from './routes/rooms';

const app = new Koa();
const server = http.createServer(app.callback());

const io = socketIO(server, { serveClient: false });
setupSocketServer(io);

app.use(cors());
app.use(bodyParser());
app.use(roomRoutes.routes());

server.listen(9000, '0.0.0.0');
