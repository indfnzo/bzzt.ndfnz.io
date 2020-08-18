import { useState, useEffect, useCallback } from 'react';

import useClassicGame, { ClassicGameController } from './useClassicGame';

export type GameMode = 'classic' | 'race' | 'quiz';

export type GameController = {
	room: Room;
	socket: SocketIOClient.Socket;
	currentUser: string;

	participants: User[];
	chats: ChatMessage[];
	sendChat: (message: string) => void;

	mode: GameMode;
	setMode: (mode: GameMode) => void;
	classic: ClassicGameController;
	// race: RaceGameController;
	// quiz: QuizGameController;
}

const useGameController = (room: Room, socket: SocketIOClient.Socket, currentUser: string): GameController => {
	/* -- room players controller -- */
	const [participants, setParticipants] = useState<User[]>([]);
	useEffect(() => {
		socket.on('room:participants:changed', (data: User[]) => {
			setParticipants(data);
		});

		return () => {
			socket.off('room:participants:changed');
		}
	}, [room, socket]);

	/* -- chat controller -- */
	const [chats, setChats] = useState<ChatMessage[]>([]);
	const sendChat = useCallback((message: string) => {
		if (!message) return;
		socket.emit('room:chat:message', message);
	}, [socket]);
	useEffect(() => {
		socket.on('room:chat:message', (chat: ChatMessage) => {
			setChats([...chats, chat]);
		});

		return () => {
			socket.off('room:chat:message');
		}
	}, [room, socket, chats]);

	/* -- game state controller -- */
	const [mode, setMode] = useState<GameMode>('classic');
	let classic: ClassicGameController = useClassicGame(room, socket, currentUser);

	const setGameMode = (gameMode: GameMode) => {
		setMode(gameMode);
		if (gameMode === 'classic') classic.reset();
	}

	return {
		room,
		socket,
		currentUser,

		participants,
		chats,
		sendChat,

		mode,
		setMode: setGameMode,
		classic,
		// race,
		// quiz
	};
};

export default useGameController;
