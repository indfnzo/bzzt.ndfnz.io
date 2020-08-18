import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import querystring from 'querystring';
import { useHistory } from 'react-router-dom';

import { Header, Form, Input, ButtonGroup, Button, Loader, GlobalError } from '../components';
import { useSocket, useRandomName } from '../hooks';
import RoomControls from './RoomControls';
import { RoomWrapper } from './RoomLanding';
import { getErrorDetails } from '../helpers';

type RoomLoginForm = {
	username: string;
	password: string;
}
type RoomLoginProps = {
	room: Room;
	username: string;
	loading: boolean;
	error: string | null;
	onSubmit: (data: RoomLoginForm) => void;
}
const RoomLogin = (props: RoomLoginProps) => {
	const namePlaceholder = useRandomName();
	const { register, handleSubmit, formState, setValue, trigger } = useForm<RoomLoginForm>({
		mode: 'all',
		defaultValues: {
			username: '',
			password: ''
		}
	});

	useEffect(() => {
		if (props.username) {
			setValue('username', props.username);
			trigger('username');
		}
	}, [props.username, setValue, trigger]);

	let usernameError: string = '';
	let passwordError: string = '';
	if (props.error === 'USERNAME_EMPTY') usernameError = 'Please specify a username.';
	if (props.error === 'USERNAME_TAKEN') usernameError = 'This name is already taken.';
	if (props.error === 'PASSWORD_EMPTY') passwordError = 'Please specify the password.';
	if (props.error === 'PASSWORD_INVALID') passwordError = 'Invalid password.';

	if (props.error && !usernameError && !passwordError) {
		const error = getErrorDetails(props.error) ?? { title: 'Woops!', subtitle: `An unexpected error has occurred: ${props.error}` };
		return (
			<RoomWrapper className="room">
				<div className="container">
					<GlobalError title={error.title} subtitle={error.subtitle} />
				</div>
			</RoomWrapper>
		);
	}

	return (
		<RoomWrapper className="room">
			<div className="container">
				<Header inverted />
				<h1>Welcome to <strong>{props.room.roomName}</strong>!</h1>
				<Form onSubmit={handleSubmit(props.onSubmit)}>
					<Input
						inverted
						autoFocus
						autoComplete="off"
						ref={register({ required: true })}
						disabled={props.loading}
						error={usernameError}
						name="username"
						placeholder={namePlaceholder}
						label="Your Name"
						maxLength={32} />
					{ props.room.hasPassword ?
						<Input
							inverted
							ref={register}
							disabled={props.loading}
							error={passwordError}
							type="password"
							name="password"
							placeholder="No Password"
							label="Password"
							maxLength={256} />
					: null }
					<ButtonGroup align="right">
						<Button inverted disabled={!formState.isValid || props.loading} type="submit">Join Room!</Button>
					</ButtonGroup>
				</Form>
			</div>
		</RoomWrapper>
	);
}

export type RoomAuthProps = {
	room: Room;
}
const RoomAuth = (props: RoomAuthProps) => {
	const history = useHistory();

	const autoJoinAttempted = React.useRef(false);

	const [joined, setJoined] = useState(false);
	const [autoJoining, setAutoJoining] = useState(true);
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');

	const [connected, loading, error, socket] = useSocket(props.room.roomCode, username || '', password || '');
	if (autoJoining && (connected || error)) setAutoJoining(false);
	if (!joined && connected) setJoined(true);

	useEffect(() => {
		if (!autoJoinAttempted.current) {
			const query = querystring.parse(history.location.search.replace('?', ''));
			let queryUsername = (query.u || '').toString().trim().replace(/\s+/g, ' ');

			// split string by char so we don't accidentally break emojis
			const chars = Array.from(queryUsername);
			queryUsername = chars.slice(0, 32).join('');

			const otpPath = `BUZZERAPP:ROOM:${props.room.roomCode}:OTP`;
			const otp = window.sessionStorage.getItem(otpPath) || '';
			window.sessionStorage.removeItem(otpPath);

			if (queryUsername) {
				history.replace(`/room/${props.room.roomCode.toLowerCase()}?u=${encodeURIComponent(queryUsername)}`);
				setUsername(queryUsername);
				setPassword(otp);
			} else {
				setAutoJoining(false);
			}

			autoJoinAttempted.current = true;
		}
	}, [history, props]);

	const joinRoom = (data: RoomLoginForm) => {
		history.replace(`/room/${props.room.roomCode.toLowerCase()}?u=${encodeURIComponent(data.username)}`);
		setUsername(data.username);
		setPassword(data.password);
	};

	if (autoJoining && autoJoinAttempted.current) return (
		<RoomWrapper className="room">
			<Loader message="Auto Join" />
		</RoomWrapper>
	);

	if (socket && joined) return (
		<RoomControls room={props.room} username={username} connected={connected} socket={socket} />
	);

	return (
		<RoomLogin room={props.room} username={username} loading={loading} error={error} onSubmit={joinRoom} />
	);
}

export default RoomAuth;
