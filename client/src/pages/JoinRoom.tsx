import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';

import { Header, Form, ControlledInput, Button, ButtonGroup } from '../components';
import { useRoom } from '../hooks';

type FormData = {
	roomCode: string;
};

const JoinRoom = () => {
	const history = useHistory();
	const { handleSubmit, formState, control } = useForm<FormData>({
		mode: 'all',
		defaultValues: {
			roomCode: ''
		}
	});

	const [roomCode, setRoomCode] = useState('');
	const [room, roomLoading, roomLoadingError] = useRoom(roomCode);

	const transformRoomCode = (value: string) => {
		return value
			.replace(/[^A-Z]/gi, '')
			.substr(0, 8)
			.toUpperCase();
	}

	const fetchRoom = (data: FormData) => {
		setRoomCode(data.roomCode);
	}

	if (!room) {
		return (
			<main className="join-room">
				<div className="container">
					<Header />
					<Form onSubmit={handleSubmit(fetchRoom)}>
						<Controller
							as={ControlledInput}
							control={control}
							rules={{
								required: true,
								pattern: /^[A-Z]{5,8}$/
							}}
							name="roomCode"
							label="Room Code"
							placeholder="XOXOX"
							autoComplete="off"
							transform={transformRoomCode} />
						{roomLoadingError}
						<ButtonGroup align="right">
							<Button disabled={!formState.isValid || roomLoading} type="submit">Join Room!</Button>
						</ButtonGroup>
					</Form>
				</div>
			</main>
		);
	} else {
		history.push(`/room/${roomCode.toLowerCase()}`);
		return null;
	}
}

export default JoinRoom;
