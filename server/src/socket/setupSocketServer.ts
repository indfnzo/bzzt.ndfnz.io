import socketIO from 'socket.io';

import authenticate, { AuthenticatedSocket } from './middlewares/authenticate';
import setupChat from './middlewares/setupChat';
import setupClassicGame from './middlewares/setupClassicGame';
import setupBuzzwireGame from './middlewares/setupBuzzwireGame';

import RoomService from '../services/roomService';
const roomService = RoomService.getInstance('rooms.db');

const setupSocketServer = (io: socketIO.Namespace) => {
	roomService.register(io);

	// authentication and join room
	io.use(authenticate);

	// handle user connections
	io.on('connection', (socket: AuthenticatedSocket) => {
		const { room, user } = socket;
		if (!room || !user) return socket.disconnect();
	
		setupChat(socket);

		switch (room.gameType) {
			case 'buzzwire':
				setupBuzzwireGame(socket);
				break;
			default:
				setupClassicGame(socket);
				break;
		}
	});
}

export default setupSocketServer;
