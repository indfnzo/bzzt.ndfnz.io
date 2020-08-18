import { useState, useEffect } from 'react';

import useSounds from './useSounds';

export type ClassicGameState = {
	round: number;
	buzzersOnline: boolean;
	winner: string | null;
	scores: { [user: string]: number };
}

export type ClassicGameController = {
	state: ClassicGameState;
	toggleBuzzers: () => void;
	buzzerTest: () => void;
	userBuzzed: () => void;
	reset: () => void;
	nextRound: () => void;
}

const useClassicGame = (room: Room, socket: SocketIOClient.Socket, currentUser: string): ClassicGameController => {
	const [state, setState] = useState<ClassicGameState>({
		round: 1,
		buzzersOnline: false,
		winner: null,
		scores: {}
	});

	const sounds = useSounds();
	const isAdmin = room.roomAdmin.toLocaleLowerCase() === currentUser.toLocaleLowerCase();

	useEffect(() => {
		socket.on('game:classic:update', (newState: ClassicGameState) => {
			setState(newState);
		});

		socket.on('game:classic:player:buzz:accepted', (winner: string) => {
			if (isAdmin || currentUser.toLocaleLowerCase() === winner.toLocaleLowerCase()) {
				setTimeout(() => {
					sounds.schwing();
				}, 150);
			}
		});

		return () => {
			socket.off('game:classic:update');
			socket.off('game:classic:player:buzz:accepted');
		}
	}, [socket, sounds, currentUser, isAdmin]);

	const toggleBuzzers = () => {
		socket.emit(`game:classic:admin:buzzers:${state.buzzersOnline ? 'off' : 'on'}`);
	}

	const buzzerTest = () => {
		socket.emit('game:classic:player:buzz:test', currentUser);
	}

	const userBuzzed = () => {
		socket.emit('game:classic:player:buzz', currentUser);
	}

	const reset = () => {
		socket.emit('game:classic:admin:reset');
	}

	const nextRound = () => {
		socket.emit('game:classic:admin:nextRound');
	}

	return {
		state,
		toggleBuzzers,
		buzzerTest,
		userBuzzed,
		reset,
		nextRound
	};
};

export default useClassicGame;
