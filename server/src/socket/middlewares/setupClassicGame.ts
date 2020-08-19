import { AuthenticatedSocket } from './authenticate';

export class ClassicGameInstance {
	state: {
		round: number;
		buzzersOnline: boolean;
		winner: string | null;
		scores: { [user: string]: number }
	};

	constructor() {
		this.state = {
			round: 1,
			buzzersOnline: false,
			winner: null,
			scores: {}
		};
	}

	reset = () => {
		this.state.buzzersOnline = false;
		this.state.winner = null;
	}

	nextRound = () => {
		this.state.round++;
		this.reset();
	}

	buzz = (username: string) => {
		if (this.state.winner == null) {
			this.state.winner = username;
			this.incrementScore(username);
			return true;
		}

		return false;
	}

	incrementScore = (username: string) => {
		const key = username.toLocaleLowerCase();
		if (key in this.state.scores) this.state.scores[key]++;
		else this.state.scores[key] = 0;
	}
}

const setupClassicGame = (socket: AuthenticatedSocket) => {
	const { room, user } = socket;
	if (!room || !user) return socket.disconnect();
	const game = room.classic;

	const emitState = (user?: User) => {
		socket.nsp
			.to(user ? user.socketId : room.roomCode)
			.emit('game:classic:update', game.state);
	}

	// immediately send the most recent game state to the newly-connected user
	emitState(user);

	if (room.isAdmin(user)) {
		socket.on('game:classic:admin:buzzers:on', () => {
			game.state.buzzersOnline = true;
			emitState();
		});

		socket.on('game:classic:admin:buzzers:off', () => {
			game.state.buzzersOnline = false;
			emitState();
		});

		socket.on('game:classic:admin:reset', () => {
			game.reset();
			emitState();
		});

		socket.on('game:classic:admin:nextRound', () => {
			game.nextRound();
			emitState();
		});
	}

	socket.on('game:classic:player:buzz:test', () => {
		socket.nsp.to(room.roomCode).emit('game:classic:player:buzz:test', user.name);
	});

	socket.on('game:classic:player:buzz', () => {
		if (!game.state.buzzersOnline) return;
		if (game.buzz(user.name)) {
			socket.nsp.to(room.roomCode).emit('game:classic:player:buzz:accepted', user.name);
			emitState();
		} else {
			socket.nsp.to(room.roomCode).emit('game:classic:player:buzz:rejected', user.name);
		}
	});
}

export default setupClassicGame;
