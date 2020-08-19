import moment from 'moment';

import { sanitize } from '../../helpers';
import { AuthenticatedSocket } from './authenticate';

const setupChat = (socket: AuthenticatedSocket) => {
	const { room, user } = socket;
	if (!room || !user) return socket.disconnect();

	// immediately notify everyone that the participants list have changed
	room.notifyParticipantsChanged();
	socket.nsp.to(room.roomCode).emit('room:chat:message', {
		message: `${user.name} joined.`,
		timestamp: moment.utc().toISOString(),
		system: true
	});

	socket.on('disconnect', () => {
		socket.nsp.to(room.roomCode).emit('room:chat:message', {
			message: `${user.name} left.`,
			timestamp: moment.utc().toISOString(),
			system: true
		});
	});

	socket.on('room:chat:message', message => {
		socket.nsp.to(room.roomCode).emit('room:chat:message', {
			username: user.name,
			message: sanitize(message).substr(0, 256),
			timestamp: moment.utc().toISOString(),
			system: false
		});
	});
}

export default setupChat;
