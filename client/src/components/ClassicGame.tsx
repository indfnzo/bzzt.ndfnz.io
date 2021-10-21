import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { hsl } from 'polished';

import Button from './Button';
import BuzzerButton from './BuzzerButton';
import { GameController } from '../hooks/useGameController';
import { useSounds } from '../hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faExclamation, faVolumeOff } from '@fortawesome/free-solid-svg-icons';

const translateUp = keyframes`
	from { bottom: -100%; }
	to   { bottom: 0; }
`;

const CenterWrapper = styled.div`
	padding: 2rem 0 4rem;
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
`;

const Winner = styled.div`
	position: absolute;
	padding: 2rem;
	bottom: 0;
	left: 0;
	right: 0;
	animation: ${translateUp} 500ms ${props => props.theme.transitions.easeOutQuint} forwards;
	text-align: center;

	.name {
		font-weight: 900;
		font-size: 2rem;
		color: white;
		text-shadow: 0 0 15px rgba(0, 0, 0, 0.25);
	}

	.label {
		font-weight: 700;
		text-transform: uppercase;
		color: ${props => props.theme.green};
	}
`;

const UserPopupWrapper = styled.div`
	position: absolute;
	padding: 2rem;
	bottom: 0;
	left: 0;
	animation: ${translateUp} 500ms ${props => props.theme.transitions.easeOutQuint} forwards;
	transform: translateX(-50%);
	text-align: center;
	white-space: nowrap;
	z-index: 1;

	.name {
		font-size: 1rem;
		font-weight: 900;
		text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
	}

	.icon {
		position: absolute;
		top: calc(50% - 1.5rem);
		left: calc(50% - 1.5rem);
		width: 3rem;
		height: 3rem;
		color: ${hsl(0, 0, 0.5)};
		z-index: -1;

		svg {
			width: 100%;
			height: 100%;
		}
	}

	&.error {
		.icon {
			color: ${props => props.theme.red};
		}
	}

	&.test {
		.name {
			font-size: 0.8rem;
		}

		.icon {
			top: calc(50% - 1rem);
			left: calc(50% - 1rem);
			width: 2rem;
			height: 2rem;
		}
	}
`;

type UserPopupObject = {
	key: number;
	name: string;
	pos: number;
	type: 'test' | 'error';
}

const UserPopup = (props: { user: UserPopupObject }) => {
	const { user } = props;
	const left = `${(user.pos * 50) + 25}%`;

	return (
		<UserPopupWrapper className={user.type} style={{ left }}>
			<div className="name">{user.name}</div>
			<div className="icon">
				<FontAwesomeIcon icon={user.type === 'error' ? faTimes : faExclamation} />
			</div>
		</UserPopupWrapper>
	);
}

const LOSER_POPUP_DELAY = 1000;
const UserPopups = (props: { game: GameController }) => {
	const { socket } = props.game;
	const { state, options } = props.game.classic;

	const volume = options.mute ? 0.0 : options.volume;
	const sounds = useSounds();

	const [users, setUsers] = useState<UserPopupObject[]>([]);

	useEffect(() => {
		const flashUserPopup = (name: string, type: 'test' | 'error') => {
			const key = new Date().getTime();
			const pos = Math.random();
			setUsers([...users, { key, name, pos, type }]);

			setTimeout(() => {
				setUsers(newUsers => {
					const copy = [...newUsers];
					copy.splice(0, 1);
					return copy;
				});
			}, LOSER_POPUP_DELAY);
		};

		const flashTest = (name: string) => flashUserPopup(name, 'test');
		const flashError = (name: string) => {
			flashUserPopup(name, 'error');
			setTimeout(() => sounds.buzzerError(volume), 150);
		}

		socket.on('game:classic:player:buzz:test', flashTest);
		socket.on('game:classic:player:buzz:rejected', flashError);

		return () => {
			socket.off('game:classic:player:buzz:test', flashTest);
			socket.off('game:classic:player:buzz:rejected', flashError);
		}
	}, [socket, sounds, users]);

	const userPopups = users.map(user => <UserPopup key={user.key} user={user} />);

	return (
		<>
			{ state.winner ?
				<Winner>
					<div className="name">{state.winner}</div>
					<div className="label">It's your turn!</div>
				</Winner>
			: null }
			{userPopups}
		</>
	);
}

const GameHeaderWrapper = styled.div`
	margin: -2rem;
	padding: 2rem;
	background: rgba(0, 0, 0, 0.1);

	.rounds {
		font-size: 1.2rem;
		font-weight: 900;
	}
`;

const VolumeButtonsWrapper = styled.div`
	position: absolute;
	top: 0;
	right: 0;

	.ui-button {
		display: flex;
		justify-content: center;
		align-items: center;
		margin: 1.5rem;
		padding: 0.5rem;
		width: 4rem;
		text-align: center;
	}

	.volume-icon {
		margin-right: 0.33rem;
		font-size: 0;

		svg {
			font-size: 1rem;
			line-height: 1rem;
		}
	}

	.mute-icon {
		display: inline-block;
		font-size: 0;

		svg {
			font-size: 0.8rem;
			line-height: 1rem;
		}
	}

	.volume-bar {
		display: inline-block;
		margin-left: 3px;
		height: 0.6rem;
		width: 3px;
		border-radius: 3px;
		background: rgba(255, 255, 255, 0.25);

		&.active {
			background: white;
		}
	}
`;

const GameHeader = (props: { game: GameController }) => {
	const { state, options, toggleMute, setVolume } = props.game.classic;

	const cycleVolume = () => {
		if (options.mute) {
			toggleMute();
			setVolume(0.25);
		} else {
			if (options.volume === 0.25) {
				setVolume(0.5);
			} else if (options.volume === 0.5) {
				setVolume(0.75);
			} else if (options.volume === 0.75) {
				setVolume(1.0);
			} else {
				toggleMute();
			}
		}
	}

	return (
		<GameHeaderWrapper>
			<div className="rounds">Round {state.round}</div>

			<VolumeButtonsWrapper>
				<Button onClick={cycleVolume}>
					<span className="volume-icon">
						<FontAwesomeIcon icon={faVolumeOff} />
					</span>
					{ options.mute ?
						<div className="mute-icon">
							<FontAwesomeIcon icon={faTimes} />
						</div>
					:
						<>
							<div className={`volume-bar ${options.volume >= 0.25 ? 'active' : ''}`}></div>
							<div className={`volume-bar ${options.volume >= 0.5 ? 'active' : ''}`}></div>
							<div className={`volume-bar ${options.volume >= 0.75 ? 'active' : ''}`}></div>
							<div className={`volume-bar ${options.volume >= 1.0 ? 'active' : ''}`}></div>
						</>
					}
				</Button>
			</VolumeButtonsWrapper>
		</GameHeaderWrapper>
	);
}

const AdminControlsWrapper = styled.div`
	height: 100%;

	.status {
		margin: 1rem 0;
		font-weight: 700;
		opacity: 0.75;
	}
`;

export const AdminControls = (props: { game: GameController }) => {
	const { state, toggleBuzzers, reset, nextRound } = props.game.classic;

	const gameOver = !!state.winner;

	let status = '';
	if (state.winner) status = `${state.winner} buzzed!`;
	else if (state.buzzersOnline) {
		const otherPlayers = props.game.participants.length - 1;
		if (otherPlayers === 0) status = 'No other players yet! No one will be able to press buzzers :(';
		else status = 'Waiting for buzzers...';
	}
	else status = 'Buzzers offline.';

	return (
		<AdminControlsWrapper>
			<GameHeader game={props.game} />
			<CenterWrapper>
				<Button inverted={state.buzzersOnline} onClick={toggleBuzzers}>
					{state.buzzersOnline ? 'Turn Buzzers Off' : 'Turn Buzzers On'}
				</Button>
				{ status ? <div className="status">{status}</div> : null }

				{ gameOver ?
					<>
						<br/>
						<Button disabled={!gameOver} onClick={reset}>
							Reset Buzzer
						</Button>
						<div className="status">Reset all buzzers without assigning points.</div>

						<br/>
						<Button disabled={!gameOver} onClick={nextRound}>
							Next Round
						</Button>
						<div className="status">Give {state.winner} 1 point.</div>
					</>
				: null }
			</CenterWrapper>
			<UserPopups game={props.game} />
		</AdminControlsWrapper>
	);
}

export const PlayerControls = (props: { game: GameController }) => {
	const { currentUser } = props.game;
	const { state, buzzerTest, userBuzzed, options } = props.game.classic;

	const accepted = state.winner?.toLocaleLowerCase() === currentUser.toLocaleLowerCase();
	const locked = state.lockedBuzzers.indexOf(currentUser.toLocaleLowerCase()) >= 0;

	const volume = options.mute ? 0.0 : options.volume;

	return (
		<>
			<GameHeader game={props.game} />
			<CenterWrapper className="buzzer-wrapper">
				<BuzzerButton accepted={accepted} online={state.buzzersOnline} locked={locked} onTest={buzzerTest} onBuzz={userBuzzed} volume={volume} />
			</CenterWrapper>
			<UserPopups game={props.game} />
		</>
	);
}
