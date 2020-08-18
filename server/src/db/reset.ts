import RoomService from '../services/roomService';

const roomService = RoomService.getInstance('rooms.db');

(async () => {
	console.log('Resetting room database...');
	await roomService.reset();
	console.log('Migration OK.');

	console.log('Testing database access...');
	const testRoom = await roomService.createRoom('Test Room', 'password', 'Test User');
	if (!testRoom) {
		console.error('Create FAILED.');
		return;
	}
	console.log('Create OK.');

	const fetchedRoom = await roomService.getRoom(testRoom.roomCode);
	if (!fetchedRoom) {
		console.error('Create FAILED.');
		return;
	}
	console.log(fetchedRoom);
	console.log('Access OK.');

	console.log('Deleting test row...');
	await roomService.deleteRoom(fetchedRoom.roomCode);
	console.log('Done.');
})();
