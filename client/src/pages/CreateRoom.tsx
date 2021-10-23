import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';

import config from '../config';
import { Header, Form, Input, Select, ButtonGroup, Button, RoomBackgroundFill } from '../components';
import { useRandomName } from '../hooks';

type FormData = {
	username: string;
	roomName: string;
	password: string;
};

const CreateRoom = () => {
	const namePlaceholder = useRandomName();
	const history = useHistory();
	const [roomNameChanged, setRoomNameChanged] = useState(false);
	const { register, formState, handleSubmit, setValue, trigger } = useForm<FormData>({
		mode: 'all',
		defaultValues: {
			username: '',
			roomName: '',
			password: ''
		}
	});

	const handleUsernameChanged = (evt: React.ChangeEvent<HTMLInputElement>) => {
		const username = evt.target.value.trim();
		if (!roomNameChanged && username) {
			setValue('roomName', `${username}'s Room`);
			trigger('roomName');
		} else if (!roomNameChanged && !username) {
			setValue('roomName', '');
			trigger('roomName');
		}
	}

	const handleRoomNameChanged = (evt: React.ChangeEvent<HTMLInputElement>) => {
		const roomName = evt.target.value.trim();
		if (!roomNameChanged && roomName) {
			setRoomNameChanged(true);
		} else if (roomNameChanged && !roomName) {
			setRoomNameChanged(false);
		}
	}

	const createRoom = (data: FormData) => {
		axios.post(`${config.apiBaseUrl}/rooms/new`, data)
			.then(res => {
				const roomCode = res.data.room.roomCode;
				window.sessionStorage.setItem(`BUZZERAPP:ROOM:${roomCode}:OTP`, data.password);
				history.push(`/room/${roomCode.toLowerCase()}?u=${encodeURIComponent(data.username)}`);
			})
			.catch(err => {
				console.error(err);
			});
	};

	return (
		<main className="new-room">
			<div className="stacking-container">
				<Header />
				<h1>Create a Room</h1>
				<Form onSubmit={handleSubmit(createRoom)}>
					<Select
						ref={register({ required: true })}
						options={[
							{ value: 'classic', text: 'Classic Buzzer' },
							{ value: 'buzzwire', text: 'Buzzwire Game' }
						]}
						name="gameType"
						placeholder="Classic Buzzer"
						label="Game Type" />
					<Input
						ref={register({ required: true })}
						name="username"
						placeholder={namePlaceholder}
						label="Your Name"
						onChange={handleUsernameChanged}
						maxLength={32} />
					<Input
						ref={register({ required: true })}
						name="roomName"
						placeholder="My Awesome Room"
						label="Room Name"
						onChange={handleRoomNameChanged}
						maxLength={128} />
					<Input
						ref={register}
						type="password"
						name="password"
						placeholder="No Password"
						label="Password"
						maxLength={256} />
					<ButtonGroup align="right">
						<Button disabled={!formState.isValid} type="submit">Create Room!</Button>
					</ButtonGroup>
				</Form>
			</div>
			<RoomBackgroundFill inverted />
		</main>
	);
}

export default CreateRoom;
