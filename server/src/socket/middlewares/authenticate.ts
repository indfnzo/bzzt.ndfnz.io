import socketIO from 'socket.io';

import { sanitize } from '../../helpers';
import RoomInstance from '../../services/roomInstance';
import RoomService from '../../services/roomService';
const roomService = RoomService.getInstance('rooms.db');

export type AuthenticatedSocket = socketIO.Socket & {
	room?: RoomInstance;
	user?: User;
};

const authenticate = async (socket: AuthenticatedSocket, next: (err?: any) => void) => {
	const roomCode = sanitize(socket.handshake.query.roomCode, 8).toUpperCase();
	const username = sanitize(socket.handshake.query.username, 32);
	const password = sanitize(socket.handshake.query.password, 256);

	if (!roomCode) return next(new Error('ROOM_CODE_EMPTY'));

	const room = await roomService.getRoom(roomCode);
	if (!room) return next(new Error('ROOM_NOT_FOUND'));

	const usernameError = room.validateUsername(username);
	if (usernameError) return next(new Error(usernameError));

	const passwordError = room.authenticate(password);
	if (passwordError) return next(new Error(passwordError));

	// From here on out, any disconnection from the socket should force the user to leave the room.
	const user = room.join(socket.id, username);
	socket.on('disconnect', reason => {
		console.log(`user '${username}' disconnected: ${reason}`);
		const user = room.getUser(socket.id);
		if (user) room.leave(socket.id);
	});

	socket.room = room;
	socket.user = user;
	socket.join(roomCode);
	return next();
}

export default authenticate;
