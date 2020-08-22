import { useState, useEffect } from 'react';
import io from 'socket.io-client';

import config from '../config';

const useSocket = (roomCode: string, username: string, password: string): [boolean, boolean, string | null, SocketIOClient.Socket | null] => {
	const [connected, setConnected] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [socket, setSocket] = useState<SocketIOClient.Socket | null>(null);

	useEffect(() => {
		if (!username) {
			setConnected(false);
			setLoading(false);
			setSocket(null);
			setError(null);
			return;
		}

		setLoading(true);
		const newSocket = io(config.apiBaseUrl, { query: { roomCode: roomCode.toUpperCase(), username, password } });
		setSocket(newSocket);

		newSocket.on('connect', () => {
			setConnected(true);
			setLoading(false);
			setError(null);
		});

		newSocket.on('reconnect_attempt', () => {
			setConnected(false);
			setLoading(true);
			setError(null);
		});

		newSocket.on('disconnect', () => {
			setConnected(false);
			setLoading(false);
		});

		newSocket.on('error', (data: string) => {
			setLoading(false);
			setError(data);
		});

		return () => {
			newSocket.off('connect');
			newSocket.off('reconnect_attempt');
			newSocket.off('disconnect');
			newSocket.off('error');
			newSocket.close();
		};
	}, [roomCode, username, password]);

	return [connected, loading, error, socket];
};

export default useSocket;
