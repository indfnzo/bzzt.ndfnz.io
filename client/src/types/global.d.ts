declare type GameType = 'classic' | 'buzzwire';

declare type Room = {
	id: number;
	gameType: GameType;
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
	admin: boolean;
	system: boolean;
}
