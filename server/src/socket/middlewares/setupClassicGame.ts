import { AuthenticatedSocket } from './authenticate';

export class ClassicGameInstance {
	state: {
		round: number;
		buzzersOnline: boolean;
		lockedBuzzers: string[];
		winner: string | null;
		scores: { [user: string]: number }
	};

	constructor() {
		this.state = {
			round: 1,
			buzzersOnline: false,
			lockedBuzzers: [],
			winner: null,
			scores: {}
		};
	}

	reset = () => {
		this.state.buzzersOnline = false;
		this.state.winner = null;
	}

	nextRound = () => {
		if (this.state.winner) this.incrementScore(this.state.winner);
		this.state.round++;
		this.reset();
	}

	buzz = (username: string) => {
		if (this.state.lockedBuzzers.indexOf(username.toLocaleLowerCase()) >= 0) return;

		if (this.state.winner == null) {
			this.state.winner = username;
			return true;
		}

		return false;
	}

	decrementScore = (username: string) => {
		const key = username.toLocaleLowerCase();
		if (key in this.state.scores && this.state.scores[key] > 0) this.state.scores[key]--;
		else this.state.scores[key] = 0;
	}

	incrementScore = (username: string) => {
		const key = username.toLocaleLowerCase();
		if (key in this.state.scores) this.state.scores[key]++;
		else this.state.scores[key] = 1;
	}

	toggleBuzzerLock = (username: string) => {
		const key = username.toLocaleLowerCase();
		const index = this.state.lockedBuzzers.indexOf(key);
		if (index >= 0) this.state.lockedBuzzers.splice(index, 1);
		else this.state.lockedBuzzers.push(key);
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

		socket.on('game:classic:admin:buzzers:toggleLock', (username: string) => {
			game.toggleBuzzerLock(username);
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

		socket.on('game:classic:admin:scores:decrement', (username: string) => {
			game.decrementScore(username);
			emitState();
		});

		socket.on('game:classic:admin:scores:increment', (username: string) => {
			game.incrementScore(username);
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
