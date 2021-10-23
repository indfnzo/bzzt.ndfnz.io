import { AuthenticatedSocket } from './authenticate';

export class ClassicGameInstance {
	state: {
		round: number;
		buzzersOnline: boolean;
		lockedBuzzers: string[];
		winner: string | null;
		winTime: number | null;
		runnersUp: { name: string, leadTime: number }[];
		scores: { [user: string]: number }
	};

	constructor() {
		this.state = {
			round: 1,
			buzzersOnline: false,
			lockedBuzzers: [],
			winner: null,
			winTime: null,
			runnersUp: [],
			scores: {}
		};
	}

	reset = () => {
		this.state.buzzersOnline = false;
		this.state.winner = null;
		this.state.winTime = null;
		this.state.runnersUp = [];
	}

	nextRound = () => {
		if (this.state.winner) this.incrementScore(this.state.winner);
		this.state.round++;
		this.reset();
	}

	isRunnerUp = (username: string) => {
		return this.state.runnersUp.find(r => r.name.toLocaleLowerCase() === username.toLocaleLowerCase());
	}

	buzz = (username: string) => {
		const now = new Date().getTime();

		if (this.state.lockedBuzzers.indexOf(username.toLocaleLowerCase()) >= 0) return;

		if (this.state.winner == null) {
			this.state.winner = username;
			this.state.winTime = now;
			return true;
		}

		// we received a double buzz from the winner for some reason
		if (this.state.winner.toLocaleLowerCase() === username.toLocaleLowerCase()) return false;

		// buzzed user is already a runner up
		if (this.isRunnerUp(username)) return false;

		// add this user to the list of runners up
		if (this.state.winner && this.state.winTime) this.state.runnersUp.push({ name: username, leadTime: now - this.state.winTime });
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
		if (game.isRunnerUp(user.name)) return;

		const accepted = game.buzz(user.name);
		if (accepted) socket.nsp.to(room.roomCode).emit('game:classic:player:buzz:accepted', user.name);
		else socket.nsp.to(room.roomCode).emit('game:classic:player:buzz:rejected', user.name);
		emitState();
	});
}

export default setupClassicGame;
