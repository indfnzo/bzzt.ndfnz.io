import { AuthenticatedSocket } from './authenticate';

// helper methods
const getDistance = (a: [number, number], b: [number, number]) => {
	if (!a || !b) return 0;

	const [ax, ay] = a;
	const [bx, by] = b;

	const xd = bx-ax, yd = by-ay;
	return Math.sqrt(xd*xd + yd*yd);
}

const isPathEqual = (x?: [number, number][], y?: [number, number][]) => {
	if (!x || !y) return false;
	if (x.length !== y.length) return false;
	if (x === y) return true;

	for (let i = 0; i < x.length; i++) {
		if (x[i][0] !== y[i][0] || x[i][1] !== y[i][1]) return false;
	}

	return true;
}

export type PlayerState = {
	name: string;
	coords: [number, number] | null;
	progress: number;
	completed: boolean;
}

export type BuzzwireGameState = {
	path: [number, number][];
	isDrawing: boolean;
	isPlaying: boolean;
	isOnCountdown: boolean;
	startTime?: number;
	playTime?: number;
	winningPlayers: { name: string, time: number }[];
	players: { [user: string]: PlayerState };
}

export class BuzzwireGameInstance {
	state: BuzzwireGameState;

	constructor() {
		this.state = {
			path: [],
			isDrawing: false,
			isPlaying: false,
			isOnCountdown: false,
			winningPlayers: [],
			players: {}
		};
	}

	setCoordinates = (username: string, admin: boolean, x: number, y: number): { event: 'USER_WON' | 'USER_HIT' | 'NO_ACTION', timestamp: number } | null => {
		let pstate = this.state.players[username.toLocaleLowerCase()];

		if (!pstate) pstate = { name: username, coords: [x, y], progress: 0, completed: false };
		else pstate.coords = [x, y];

		this.state.players[username.toLocaleLowerCase()] = pstate;

		if (this.state.isPlaying && !admin && this.state.startTime && !pstate.completed) {
			const path = this.state.path;
			const current = this.state.path[pstate.progress];
			const next = pstate.progress + 1 >= path.length ? null : path[pstate.progress + 1];
			const prev = pstate.progress > 0 ? path[pstate.progress - 1] : null;

			if (!next) {
				// user won!
				pstate.completed = true;
				const now = new Date().getTime();
				this.state.winningPlayers.push({ name: username, time: (now - this.state.startTime) });
				return { event: 'USER_WON', timestamp: now };
			}

			const distanceToCurrent = getDistance(current, [x, y]);
			const distanceToNext = next ? getDistance(next, [x, y]) : Infinity;
			const distanceToPrev = prev ? getDistance(prev, [x, y]) : Infinity;

			if (distanceToCurrent > 10) {
				if (distanceToNext <= 15) {
					pstate.progress++;

					// keep increasing the progress while the current point is active
					// (actually, find the point among all these that's closest to the x/y coords)
					let finalProgress = pstate.progress;
					let minDistance = distanceToNext;
					while (true) {
						const nextnext = pstate.progress + 1 >= path.length ? null : path[pstate.progress + 1];
						if (!nextnext) break;
						const distanceToNextNext = getDistance(nextnext, [x, y]);
						if (distanceToNextNext <= 15) {
							pstate.progress++;
							if (distanceToNextNext <= minDistance) {
								finalProgress = pstate.progress;
								minDistance = distanceToNextNext;
							}
						}
						else break;
					}
					pstate.progress = finalProgress;

				} else if (distanceToPrev <= 15) {
					pstate.progress--;
				} else {
					// user went out of bounds, move em back to the starting point!
					if (pstate.progress > 0) {
						pstate.progress = 0;
						const now = new Date().getTime();
						return { event: 'USER_HIT', timestamp: now };
					}
				}
			}
		}

		return null;
	}

	removeCoordinates = (username: string) => {
		const pstate = this.state.players[username.toLocaleLowerCase()];
		if (pstate) pstate.coords = null;
	}

	reset = () => {
		this.stopGame();
		this.state.isDrawing = false;
		this.state.path = [];
		this.state.players = {};
		this.state.winningPlayers = [];
	}

	setIsDrawing = (isDrawing: boolean) => {
		this.state.isDrawing = isDrawing;
	}

	addPoint = (x: number, y: number) => {
		this.state.path.push([x, y]);
	}

	startCountdown = () => {
		this.state.isPlaying = true;
		this.state.isOnCountdown = true;
		this.state.isDrawing = false;
		this.state.players = {};
		this.state.winningPlayers = [];
	}

	startGame = () => {
		if (this.state.path.length <= 3) return;

		this.state.isPlaying = true;
		this.state.isOnCountdown = false;
		this.state.startTime = new Date().getTime();
	}

	stopGame = () => {
		this.state.isPlaying = false;
		this.state.isOnCountdown = false;
		this.state.startTime = undefined;
	}
}

const setupBuzzwireGame = (socket: AuthenticatedSocket) => {
	const { room, user } = socket;
	if (!room || !user) return socket.disconnect();
	const game = room.buzzwire;

	const isAdmin = user.name.toLocaleLowerCase() === room.roomAdmin.toLocaleLowerCase();
	let emitTimer: NodeJS.Timeout | null = null;

	const emitUpdate = (user?: User) => {
		const state: Partial<BuzzwireGameState> = { ...game.state, path: undefined };

		if (state.startTime) state.playTime = (new Date().getTime()) - state.startTime;

		socket.nsp
			.to(user ? user.socketId : room.roomCode)
			.emit('game:buzzwire:update', state);
	}

	const emitPath = (user?: User) => {
		socket.nsp
			.to(user ? user.socketId : room.roomCode)
			.emit('game:buzzwire:path:update', game.state.path);
	}

	const emitState = (full?: boolean, user?: User) => {
		emitUpdate(user);
		if (full) emitPath(user);
	}

	// immediately send the most recent game state to the newly-connected user
	emitState(true, user);

	// if the game is in progress, force-send a start command as well
	if (game.state.isPlaying && !game.state.isOnCountdown) {
		socket.nsp.to(user.socketId).emit('game:buzzwire:game:started');
	}

	if (room.isAdmin(user)) {
		socket.on('game:buzzwire:admin:path:isdrawing', (isDrawing: boolean) => {
			game.setIsDrawing(isDrawing);
			emitState(true);
		});

		socket.on('game:buzzwire:admin:path:addpoint', (point: { x: number, y: number }) => {
			game.addPoint(point.x, point.y);
			emitState(true);
		});

		socket.on('game:buzzwire:admin:reset', () => {
			game.reset();
			emitState(true);
		});

		socket.on('game:buzzwire:admin:game:start', () => {
			game.startCountdown();
			emitState();
			socket.nsp.to(room.roomCode).emit('game:buzzwire:game:countdown');

			setTimeout(() => {
				game.startGame();
				socket.nsp.to(room.roomCode).emit('game:buzzwire:game:started');
				emitState();

				// start emitting state every second to force-update the clock
				emitTimer = setInterval(emitState, 1000);
			}, 3000);
		});

		socket.on('game:buzzwire:admin:game:stop', () => {
			game.stopGame();
			socket.nsp.to(room.roomCode).emit('game:buzzwire:game:stopped');
			emitState();

			if (emitTimer) clearInterval(emitTimer);
		});
	}

	socket.on('game:buzzwire:player:setcoords', (coords?: { x: number, y: number }) => {
		if (coords) {
			const result = game.setCoordinates(user.name, isAdmin, coords.x, coords.y);
			if (result) {
				switch (result.event) {
					case 'USER_WON':
						socket.nsp.to(room.roomCode).emit('game:buzzwire:game:playerwon', user.name);
						break;

					case 'USER_HIT':
						socket.nsp.to(room.roomCode).emit('game:buzzwire:game:playerhit', user.name);
						break;
				}
			}
		} else {
			game.removeCoordinates(user.name);
		}
		emitState();
	});
}

export default setupBuzzwireGame;
