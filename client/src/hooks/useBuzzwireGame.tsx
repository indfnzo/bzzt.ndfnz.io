import { useState, useEffect, useMemo } from 'react';
import { throttle } from 'lodash';

import useSounds from './useSounds';

export type PlayerState = {
	name: string;
	coords: [number, number];
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
	players: { [user: string]: PlayerState }
	winningPlayers: { name: string, time: number }[];
}

export type BuzzwireGameController = {
	state: BuzzwireGameState;
	setCoordinates: (x?: number, y?: number) => void;
	reset: () => void;
	appendPoint: (x: number, y: number) => void;
	setIsDrawing: (isDrawing: boolean) => void;
	startGame: () => void;
	stopGame: () => void;
}

const useBuzzwireGame = (room: Room, socket: SocketIOClient.Socket, currentUser: string): BuzzwireGameController => {
	const [state, setState] = useState<BuzzwireGameState>({
		path: [],
		isDrawing: false,
		isPlaying: false,
		isOnCountdown: false,
		players: {},
		winningPlayers: []
	});

	const sounds = useSounds();
	const isAdmin = room.roomAdmin.toLocaleLowerCase() === currentUser.toLocaleLowerCase();

	useEffect(() => {
		socket.on('game:buzzwire:update', (newState: BuzzwireGameState) => {
			setState(prevState => ({ ...newState, path: prevState.path }));
		});

		socket.on('game:buzzwire:path:update', (path: [number, number][]) => {
			setState(prevState => ({ ...prevState, path }));
		});

		const onPlayerWon = (user: string) => {
			if (user.toLocaleLowerCase() === currentUser.toLocaleLowerCase()) sounds.successArpeggio();
			else sounds.retroAccomplished(0.5);
		}
		socket.on('game:buzzwire:game:playerwon', onPlayerWon);

		const onPlayerHit = (user: string) => {
			if (user.toLocaleLowerCase() === currentUser.toLocaleLowerCase()) sounds.buzzerError(0.25);
			else sounds.mouthPop(0.5);
		}
		socket.on('game:buzzwire:game:playerhit', onPlayerHit);

		const onGameCountdown = () => {
			setTimeout(() => sounds.countdownReady(0.25), 0);
			setTimeout(() => sounds.countdownReady(0.25), 1000);
			setTimeout(() => sounds.countdownReady(0.25), 2000);
		}
		socket.on('game:buzzwire:game:countdown', onGameCountdown);

		const onGameStart = () => {
			sounds.countdownGo(0.25);
			sounds.loops.music.start(0.125);
		}
		socket.on('game:buzzwire:game:started', onGameStart);

		const onGameStop = () => {
			sounds.pauseStart(0.5);
			setTimeout(sounds.loops.music.stop, 100);
		}
		socket.on('game:buzzwire:game:stopped', onGameStop);

		return () => {
			socket.off('game:buzzwire:update');
			socket.off('game:buzzwire:path:update');
			socket.off('game:buzzwire:game:playerwon', onPlayerWon);
			socket.off('game:buzzwire:game:playerhit', onPlayerHit);
			socket.off('game:buzzwire:game:countdown', onGameCountdown);
			socket.off('game:buzzwire:game:started', onGameStart);
			socket.off('game:buzzwire:game:stopped', onGameStop);
		}
	}, [socket, sounds, currentUser, isAdmin]);

	const setCoordinates = (x?: number, y?: number) => {
		const coords = x == null || y == null ? null : { x, y };
		socket.emit('game:buzzwire:player:setcoords', coords);
	};

	const throttledSetCoordinates = useMemo(() => {
		return throttle(setCoordinates, 1000 / 30);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const reset = () => {
		socket.emit('game:buzzwire:admin:reset');
	}

	const appendPoint = (x: number, y: number) => {
		socket.emit('game:buzzwire:admin:path:addpoint', { x, y });
	}

	const setIsDrawing = (isDrawing: boolean) => {
		socket.emit('game:buzzwire:admin:path:isdrawing', isDrawing);
	}

	const startGame = () => {
		socket.emit('game:buzzwire:admin:game:start');
	}

	const stopGame = () => {
		socket.emit('game:buzzwire:admin:game:stop');
	}

	return {
		state,
		setCoordinates: throttledSetCoordinates,
		reset,
		appendPoint,
		setIsDrawing,
		startGame,
		stopGame
	};
};

export default useBuzzwireGame;
