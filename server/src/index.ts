import path from 'path';
import Koa from 'koa';
import cors from '@koa/cors';
import serve from 'koa-static';
import bodyParser from 'koa-bodyparser';
import http from 'http';
import socketIO from 'socket.io';

import config from './appconfig';
import setupSocketServer from './socket/setupSocketServer';
import roomRoutes from './routes/rooms';

const app = new Koa();

app.use(cors());
app.use(bodyParser());
app.use(roomRoutes.routes());

const clientPath = path.resolve(config.client_build_path);
app.use(serve(clientPath, {}));

const server = http.createServer(app.callback());
const io = socketIO(server, { serveClient: false });
setupSocketServer(io);

server.listen(9000, '0.0.0.0');
