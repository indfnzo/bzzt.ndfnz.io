import Table from 'cli-table';
import RoomService from '../services/roomService';

const roomService = RoomService.getInstance('rooms.db');

(async () => {
	const rooms = await roomService.getAllRooms();
	const table = new Table({
		head: ['Room Code', 'Room Name', 'PW?', 'Created', 'Users Connected']
	});

	for (const room of rooms) {
		table.push([room.roomCode, room.roomName, room.hasPassword, room.dateCreatedUtc, Object.keys(room['participants']).length]);
	}

	console.log('Room Catalog');
	console.log(table.toString());
})();
