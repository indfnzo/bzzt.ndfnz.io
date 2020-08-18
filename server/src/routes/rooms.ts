import Router from '@koa/router';

import { sanitize } from '../helpers';
import RoomService from '../services/roomService';
const roomService = RoomService.getInstance('rooms.db');

const router = new Router();

router.get('/rooms/:roomCode', async (ctx, next) => {
	const roomCode = ctx.params.roomCode?.trim().substr(0, 8).toUpperCase();
	const room = await roomService.getRoom(roomCode);
	if (!room) return ctx.throw(404, 'ROOM_NOT_FOUND');

	ctx.body = {
		id: room.id,
		roomCode: room.roomCode,
		roomName: room.roomName,
		hasPassword: room.hasPassword,
		roomAdmin: room.roomAdmin,
		dateCreatedUtc: room.dateCreatedUtc
	};
});

router.post('/rooms/new', async (ctx, next) => {
	const username = sanitize(ctx.request.body.username).trim().substr(0, 32);
	const roomName = sanitize(ctx.request.body.roomName).trim().substr(0, 128);
	const password = sanitize(ctx.request.body.password).trim().substr(0, 256);

	if (!roomName) return ctx.throw(400, 'ROOM_NAME_EMPTY');

	try {
		const room = await roomService.createRoom(roomName, password, username);
		if (!room) return ctx.throw(404, 'ROOM_CREATION_ERROR');
		ctx.body = { success: true, room };
	} catch (e) {
		return ctx.throw(400, e);
	}
});

export default router;
