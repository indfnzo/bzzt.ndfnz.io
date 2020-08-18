import { useState, useEffect } from 'react';
import axios from 'axios';

import config from '../config';
import { getErrorDetails } from '../helpers';

const useRoom = (roomCode: string): [Room | null, boolean, { title: string, subtitle: string } | null] => {
	const [room, setRoom] = useState<Room | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<{ title: string, subtitle: string } | null>(null);
	
	useEffect(() => {
		if (!roomCode) {
			setLoading(false);
			setError(null);
			setRoom(null);
			return;
		}

		axios.get(`${config.apiBaseUrl}/rooms/${roomCode}`)
			.then(res => {
				setLoading(false);
				setError(null);
				setRoom(res.data);
			})
			.catch(err => {
				const errorMessage = err.response?.data || err.message || err.toString();
				setLoading(false);
				setError(getErrorDetails(errorMessage));
				setRoom(null);
			});
	}, [roomCode]);

	return [room, loading, error];
};

export default useRoom;
