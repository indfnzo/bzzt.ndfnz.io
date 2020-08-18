declare type Room = {
	id: number;
	roomCode: string;
	roomName: string;
	hasPassword: boolean;
	roomAdmin: string;
	dateCreatedUtc: string;
}

declare type User = {
	socketId: string;
	name: string;
}

declare type ChatMessage = {
	timestamp: string;
	username: string;
	message: string;
	system: boolean;
}
