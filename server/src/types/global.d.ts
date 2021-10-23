declare type GameType = 'classic' | 'buzzwire';

declare type Room = {
	id: number;
	gameType: GameType;
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
