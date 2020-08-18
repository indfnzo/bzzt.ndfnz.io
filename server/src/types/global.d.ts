declare type Room = {
	id: number;
	roomCode: string;
	roomName: string;
	password: string;
	roomAdmin: string;
	dateCreatedUtc: string;
}

declare type User = {
	socketId: string;
	name: string;
}
