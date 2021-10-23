import { useState, useEffect, useCallback } from 'react';

import useClassicGame, { ClassicGameController } from './useClassicGame';
import useBuzzwireGame, { BuzzwireGameController } from './useBuzzwireGame';

export type GameController = {
	room: Room;
	socket: SocketIOClient.Socket;
	currentUser: string;

	participants: User[];
	chats: ChatMessage[];
	sendChat: (message: string) => void;

	type: GameType;

	classic: ClassicGameController;
	buzzwire: BuzzwireGameController;
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
	let classic: ClassicGameController = useClassicGame(room, socket, currentUser);
	let buzzwire: BuzzwireGameController = useBuzzwireGame(room, socket, currentUser);

	return {
		room,
		socket,
		currentUser,

		participants,
		chats,
		sendChat,

		type: room.gameType,

		classic,
		buzzwire
	};
};

export default useGameController;
