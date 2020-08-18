import socketIO from 'socket.io';

import authenticate, { AuthenticatedSocket } from './middlewares/authenticate';
import setupChat from './middlewares/setupChat';
import setupClassicGame from './middlewares/setupClassicGame';

import RoomService from '../services/roomService';
const roomService = RoomService.getInstance('rooms.db');

const setupSocketServer = (io: socketIO.Server) => {
	roomService.register(io);

	// authentication and join room
	io.use(authenticate);

	// handle user connections
	io.on('connection', (socket: AuthenticatedSocket) => {
		const { room, user } = socket;
		if (!room || !user) return socket.disconnect();
	
		setupChat(socket);
		setupClassicGame(socket);
	});
}

export default setupSocketServer;
