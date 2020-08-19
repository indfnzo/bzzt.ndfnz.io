import path from 'path';
import Koa from 'koa';
import cors from '@koa/cors';
import send from 'koa-send';
import serve from 'koa-static';
import mount from 'koa-mount';
import bodyParser from 'koa-bodyparser';
import http from 'http';
import socketIO from 'socket.io';

import config from './appconfig';
import setupSocketServer from './socket/setupSocketServer';
import roomRoutes from './routes/rooms';

const client = new Koa();
const clientPath = path.resolve(config.client_build_path);
client.use(serve(clientPath, {}));
client.use(async (ctx, next) => {
	await next();
	if (ctx.path.startsWith('/api/')) return;
	if (ctx.status === 404) {
		await send(ctx, 'index.html', { root: clientPath });
	}
});

const api = new Koa();
api.use(cors());
api.use(bodyParser());
api.use(roomRoutes.routes());

const app = new Koa();
app.use(mount('/', client));
app.use(mount('/api', api));

const server = http.createServer(app.callback());
const io = socketIO(server, { serveClient: false });
setupSocketServer(io.of('/api'));

server.listen(9000, '0.0.0.0');
