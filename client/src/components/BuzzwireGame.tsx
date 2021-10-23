import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import classNames from 'classnames';
import { padStart } from 'lodash';

import { useSounds } from '../hooks';
import Button from './Button';
import Input from './Input';
import { GameController } from '../hooks/useGameController';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck, faCertificate } from '@fortawesome/free-solid-svg-icons';

const translateUp = keyframes`
	from { bottom: -100%; }
	to   { bottom: 0; }
`;

const pulse = keyframes`
	0% { r: 16; }
	50% { r: 24; }
	100% { r: 16; }
`;

const popIn = keyframes`
	from {
		transform: scale(0.5);
		opacity: 0;
	}

	to {
		transform: none;
		opacity: 1;
	}
`;

const shake = keyframes`
	0% {
		transform: none;
	}

	15% {
		transform: translate(-0.5rem, 0.5rem);
		background: #FF9090;
	}

	30% {
		transform: translate(0.5rem, -0.5rem);
	}

	45% {
		transform: translate(-0.25rem, 0.25rem);
	}

	60% {
		transform: translate(0.25rem, -0.25rem);
		background: white;
	}

	75% {
		transform: translate(-0.125rem, 0.125rem);
	}

	90% {
		transform: translate(0.125rem, -0.125rem);
	}

	100% {
		transform: none;
	}
`;

// helper methods
const sleep = (ms: number) => {
	return new Promise(r => setTimeout(r, ms));
}

const toHHMMSS = (ms: number, showMs = false) => {
	const d = new Date(ms);
	let s = d.toISOString().substr(11, 8);
	if (s.startsWith('00:')) s = s.substr(3);
	if (showMs) s += '.' + padStart(d.getMilliseconds().toFixed(0), 3, '0');
	return s;
}

const isSvgPathInvalid = (s: string) => {
	// see https://stackoverflow.com/a/54962138
	const reEverythingAllowed = /[MmZzLlHhVvCcSsQqTtAa0-9-,.\s]/g;
	
	const bContainsIllegalCharacter = !!s.replace(reEverythingAllowed,'').length;
	const bContainsAdjacentLetters = /[a-zA-Z][a-zA-Z]/.test(s);
	const bInvalidStart = /^[0-9-,.]/.test(s);
	const bInvalidEnd = /.*[-,.]$/.test(s.trim());
	
	return bContainsIllegalCharacter || bContainsAdjacentLetters || bInvalidStart || bInvalidEnd;
}

const getEventCoords = <T extends any>(evt: React.MouseEvent<T>) => {
	const box = (evt.target as HTMLElement)?.getBoundingClientRect();
	if (!box) return [0, 0, 0, 0];

	const lx = evt.clientX - box.left;
	const ly = evt.clientY - box.top;
	const x = 800 * (lx / box.width);
	const y = 450 * (ly / box.height);

	return [lx, ly, x, y];
}

const getDistance = (a: [number, number], b: [number, number]) => {
	if (!a || !b) return 0;

	const [ax, ay] = a;
	const [bx, by] = b;

	const xd = bx-ax, yd = by-ay;
	return Math.sqrt(xd*xd + yd*yd);
}

const GameCanvasWrapper = styled.div`
	position: relative;
	width: 100%;
	padding-top: 56.25%;
	font-size: 0;
	background: white;
	border-radius: 10px;
	cursor: none;
	user-select: none;
	overflow: hidden;

	&.shake {
		animation: ${shake} 500ms cubic-bezier(.63,.14,.16,.88) forwards;
	}

	svg {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

	.local-cursor {
		position: absolute;
		width: 0;
		height: 0;
		pointer-events: none;
		z-index: 10000;
		transform: scale(0);
		transition: transform 150ms ease-out;

		&::before {
			content: "";
			position: absolute;
			left: -0.5rem;
			top: -0.5rem;
			width: 1rem;
			height: 1rem;
			box-shadow: 0 0 0 2px ${props => props.theme.primary.main};
			border-radius: 50%;
		}

		&.admin::before {
			box-shadow: 0 0 0 2px ${props => props.theme.red};
		}
	}

	&:hover .local-cursor {
		transform: none;
	}

	.focus-ball {
		transition: all 150ms ease;

		&.pulse {
			animation: ${pulse} 1000ms cubic-bezier(.85,.01,.23,1) infinite;
		}
	}
`;

const TimerDisplayWrapper = styled.div`
	display: none;
	position: absolute;
	top: 1.25rem;
	left: 1.5rem;
	font-size: 1.5rem;
	line-height: 1;
	font-weight: 700;
	color: rgba(0, 0, 0, 0.5);
	pointer-events: none;

	&.active {
		display: block;
		animation: ${popIn} 500ms cubic-bezier(.28,1.49,.19,1.01) forwards;
	}
`;

export const TimerDisplay = (props: { game: GameController }) => {
	const { state } = props.game.buzzwire;

	const playTime = state.playTime || 0;

	return (
		<TimerDisplayWrapper className={classNames({ 'active': playTime })}>
			{toHHMMSS(playTime)}
		</TimerDisplayWrapper>
	);
}

export const PlayerCursorsCanvasWrapper = styled.div`
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	pointer-events: none;
`;

export const PlayerCursor = styled.div`
	position: absolute;
	width: 0;
	height: 0;
	transition: all 50ms ease-out;

	.cursor {
		position: absolute;
		top: -2px;
		left: -2px;
		width: 4px;
		height: 4px;
		border-radius: 4px;
		background: rgba(0, 0, 0, 0.5);
	}

	.name {
		position: absolute;
		top: -0.35rem;
		left: 0.5rem;
		color: black;
		font-size: 0.7rem;
		font-weight: 700;
		line-height: 1;
		white-space: nowrap;
		opacity: 0.5;
	}

	&.self,
	&.admin {
		z-index: 10000;

		.cursor {
			top: -3px;
			left: -3px;
			width: 6px;
			height: 6px;
			border-radius: 6px;
			background: ${props => props.theme.primary.main};
			box-shadow: 0 0 0 1px white, 0 0 0 3px rgba(255, 255, 255, 0.5);
		}

		.name {
			top: -0.4rem;
			left: 1rem;
			font-size: 0.8rem;
			color: ${props => props.theme.primary.main};
			opacity: 0.75;
		}
	}

	&.admin {
		z-index: 9999;

		.cursor {
			background: ${props => props.theme.red};
			box-shadow: none;
		}

		.name {
			color: ${props => props.theme.red};
		}
	}

	&.tracing {
		.cursor {
			background: ${props => props.theme.blue};
		}

		.name {
			color: ${props => props.theme.blue};
			opacity: 1;
		}
	}

	&.behind {
		.cursor {
			background: ${props => props.theme.blue};
		}

		.name {
			color: ${props => props.theme.blue};
			opacity: 0.75;
		}
	}

	&.ahead {
		.cursor {
			background: ${props => props.theme.purple};
		}

		.name {
			color: ${props => props.theme.purple};
			opacity: 0.75;
		}
	}
`

export const PlayerCursorsCanvas = (props: { game: GameController }) => {
	const { room, currentUser } = props.game;
	const { state } = props.game.buzzwire;

	const cursors = [];
	const currentPlayer = state.players[currentUser.toLocaleLowerCase()];
	const currentPlayerIsAdmin = currentUser.toLocaleLowerCase() === room.roomAdmin.toLocaleLowerCase();
	for (const player of Object.values(state.players)) {
		if (!player.coords) continue;

		const self = player.name.toLocaleLowerCase() === currentUser.toLocaleLowerCase();
		const admin = player.name.toLocaleLowerCase() === room.roomAdmin.toLocaleLowerCase();
		const coords = (state.isPlaying && !self && !admin && player.progress > 0) ? state.path[player.progress] || player.coords : player.coords;

		const left = ((coords[0] / 800) * 100) + '%';
		const top = ((coords[1] / 450) * 100) + '%';

		const tracing = self && !admin && player.progress > 0 && !player.completed;

		const cursorClassNames = classNames({
			'self': self,
			'admin': admin,
			'tracing': tracing,
			'behind': !self && !admin && !currentPlayerIsAdmin && currentPlayer && player.progress < currentPlayer.progress,
			'ahead': !self && !admin && !currentPlayerIsAdmin && currentPlayer && player.progress > currentPlayer.progress
		});

		const cursor = (
			<PlayerCursor key={player.name} style={{ left, top, zIndex: player.progress }} className={cursorClassNames}>
				<div className="name">{ tracing ? (((player.progress+1) / state.path.length) * 100).toFixed(2) + '%' : player.name }</div>
				<div className="cursor"></div>
			</PlayerCursor>
		);

		cursors.push(cursor);
	}

	return (
		<PlayerCursorsCanvasWrapper>
			{cursors}
		</PlayerCursorsCanvasWrapper>
	);
}

export const PathPreview = (props: { admin?: boolean, isDrawing: boolean, path: [number, number][], isPlaying?: boolean, progress?: number }) => {
	const { admin, isDrawing, path, isPlaying, progress } = props;

	const invalidPath = path.length <= 2;
	if (invalidPath) {
		if (admin) return (
			<svg width="800" height="450" viewBox="0 0 800 450" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M348 232.776H349.536V218.784L360.096 232.776H361.632V216.288H360.096V230.28L349.536 216.288H348V232.776Z" fill="#B4B4B4"/>
				<path d="M373.591 233.064C378.175 233.064 382.015 229.152 382.015 224.52C382.015 219.888 378.175 216 373.591 216C369.031 216 365.143 219.888 365.143 224.52C365.143 229.152 369.031 233.064 373.591 233.064ZM373.591 231.624C369.871 231.624 366.703 228.36 366.703 224.52C366.703 220.704 369.871 217.44 373.591 217.44C377.335 217.44 380.479 220.704 380.479 224.52C380.479 228.36 377.335 231.624 373.591 231.624Z" fill="#B4B4B4"/>
				<path d="M392.227 232.776H393.763V226.68H398.995C402.379 226.68 404.947 224.544 404.947 221.496C404.947 218.448 402.379 216.288 398.995 216.288H392.227V232.776ZM393.763 225.216V217.752H398.707C401.491 217.752 403.387 219.192 403.387 221.496C403.387 223.776 401.491 225.216 398.707 225.216H393.763Z" fill="#B4B4B4"/>
				<path d="M420.067 232.776H421.747L414.475 216.288H412.795L405.523 232.776H407.203L408.907 228.888H418.363L420.067 232.776ZM409.579 227.4L413.635 218.184L417.691 227.4H409.579Z" fill="#B4B4B4"/>
				<path d="M427.642 232.776H429.178V217.752H434.89V216.288H421.93V217.752H427.642V232.776Z" fill="#B4B4B4"/>
				<path d="M449.92 216.288V223.632H439.864V216.288H438.328V232.776H439.864V225.12H449.92V232.776H451.456V216.288H449.92Z" fill="#B4B4B4"/>
			</svg>
		);

		return (
			<svg width="800" height="450" viewBox="0 0 800 450" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M320 232.8H321.536V226.704H326.768C330.152 226.704 332.72 224.568 332.72 221.52C332.72 218.472 330.152 216.312 326.768 216.312H320V232.8ZM321.536 225.24V217.776H326.48C329.264 217.776 331.16 219.216 331.16 221.52C331.16 223.8 329.264 225.24 326.48 225.24H321.536Z" fill="#B4B4B4"/>
				<path d="M337.731 231.336V216.312H336.195V232.8H346.899V231.336H337.731Z" fill="#B4B4B4"/>
				<path d="M361.801 217.776V216.312H350.305V232.8H361.801V231.336H351.841V225.144H360.889V223.656H351.841V217.776H361.801Z" fill="#B4B4B4"/>
				<path d="M379.153 232.8H380.833L373.561 216.312H371.881L364.609 232.8H366.289L367.993 228.912H377.449L379.153 232.8ZM368.665 227.424L372.721 218.208L376.777 227.424H368.665Z" fill="#B4B4B4"/>
				<path d="M389.23 233.064C392.878 233.064 394.966 231.024 394.966 228.384C394.966 225.696 392.95 224.496 389.566 223.704C386.494 222.96 384.934 222.24 384.934 220.584C384.934 218.832 386.542 217.416 388.75 217.416C390.55 217.416 392.254 218.208 393.646 219.552L394.582 218.352C393.046 216.936 391.126 216 388.822 216C385.678 216 383.398 218.016 383.398 220.704C383.398 223.296 385.294 224.376 388.798 225.192C391.894 225.912 393.406 226.728 393.406 228.528C393.406 230.208 391.894 231.648 389.302 231.648C386.998 231.648 385.126 230.688 383.686 229.248L382.726 230.448C384.406 232.08 386.614 233.064 389.23 233.064Z" fill="#B4B4B4"/>
				<path d="M409.941 217.776V216.312H398.445V232.8H409.941V231.336H399.981V225.144H409.029V223.656H399.981V217.776H409.941Z" fill="#B4B4B4"/>
				<path d="M424.998 232.8H426.558L431.31 218.4L436.038 232.8H437.598L443.19 216.312H441.462L436.758 230.232L432.15 216.312H430.446L425.862 230.232L421.134 216.312H419.406L424.998 232.8Z" fill="#B4B4B4"/>
				<path d="M457.246 232.8H458.926L451.654 216.312H449.974L442.702 232.8H444.382L446.086 228.912H455.542L457.246 232.8ZM446.758 227.424L450.814 218.208L454.87 227.424H446.758Z" fill="#B4B4B4"/>
				<path d="M462.312 232.8H463.849V216.312H462.312V232.8Z" fill="#B4B4B4"/>
				<path d="M472.954 232.8H474.49V217.776H480.202V216.312H467.242V217.776H472.954V232.8Z" fill="#B4B4B4"/>
			</svg>
		);
	}

	const svgPath = 'M' + path.map(p => p.join(',')).join(' L');
	const progressSvgPath = progress ? 'M' + path.slice(0, progress + 1).map(p => p.join(',')).join(' L') : '';
	const completed = progress === path.length - 1;
	return (
		<svg width="800" height="450" viewBox="0 0 800 450" fill="none" xmlns="http://www.w3.org/2000/svg">
			{ isDrawing ?
				<>
					<path d={svgPath} stroke="black" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.5" />
					<circle cx={path[path.length - 1][0]} cy={path[path.length - 1][1]} r="3" fill="#000000"/>
				</>
			:
				<>
					{ isPlaying && !completed && progress !== undefined ?
						<>
							<circle className={classNames('focus-ball', { 'pulse': progress === 0 })} cx={path[progress][0]} cy={path[progress][1]} r="6" stroke="#00F076" strokeWidth="2" />
						</>
					: null }
					<circle cx={path[0][0]} cy={path[0][1]} r="9" fill="#00F076"/>
					<circle cx={path[path.length - 1][0]} cy={path[path.length - 1][1]} r="9" fill={ completed ? '#00F076' : '#00E3FF' } />

					{/* { path.map(p => <circle key={p.join(',')} cx={p[0]} cy={p[1]} r="3" fill="#E72424" fillOpacity="0.5" />) } */}
					<path d={svgPath} stroke="black" strokeWidth="1" strokeLinecap="round" />
					{ progressSvgPath ?
						<path d={progressSvgPath} stroke="#00F076" strokeWidth="3" strokeLinecap="round" />
					: null }

					<circle cx={path[0][0]} cy={path[0][1]} r="3" fill="#000000"/>
					<circle cx={path[path.length - 1][0]} cy={path[path.length - 1][1]} r="3" fill="#000000"/>
				</>
			}
		</svg>
	);
}

export const GameStatePreviewWrapper = styled.div`
	padding: 2rem;
	font-size: 1rem;

	.empty {
		font-weight: 700;
		color: rgba(255, 255, 255, 0.5);
	}

	.label {
		font-weight: 700;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.5);
	}

	.winners {
		margin-top: 1rem;

		.winner {
			display: flex;
			align-items: center;
			font-size: 1.5rem;
			font-weight: 700;
			line-height: 2rem;
			color: white;

			.time {
				margin-left: 0.5rem;
				font-size: 1.25rem;
				color: rgba(255, 255, 255, 0.5);
			}

			.rank {
				font-size: 0.75rem;
				margin-right: 1rem;
				color: rgba(255, 255, 255, 0.5);
			}

			.self-badge {
				margin-left: 0.5rem;
				font-size: 0.75rem;
				line-height: 1.25rem;
				height: 1.25rem;
				padding: 0 0.5rem;
				color: white;
				background: ${props => props.theme.green};
				border-radius: 2rem;
			}

			&.rank-1, &.rank-2, &.rank-3 {
				.name {
					font-size: 2rem;
				}

				.time {
					margin-left: 0.75rem;
					font-size: 1.5rem;
				}
			}

			&.rank-1 .rank { color: ${props => props.theme.red}; }
			&.rank-2 .rank { color: ${props => props.theme.orange}; }
			&.rank-3 .rank { color: ${props => props.theme.yellow}; }

			&.rank-1 .name { color: ${props => props.theme.red}; }
			&.rank-2 .name { color: ${props => props.theme.orange}; }
			&.rank-3 .name { color: ${props => props.theme.yellow}; }

			&.rank-1 .time { color: ${props => props.theme.lightRed}; }
			&.rank-2 .time { color: ${props => props.theme.lightOrange}; }
			&.rank-3 .time { color: ${props => props.theme.lightYellow}; }
		}
	}
`;

export const GameStatePreview = (props: { game: GameController }) => {
	const { currentUser } = props.game;
	const { state } = props.game.buzzwire;

	let message = 'Waiting for game master...';
	if (state.isDrawing) message = 'Your game master is drawing...';
	else if (state.isOnCountdown) message = 'Game is starting...';
	else if (state.isPlaying) message = 'No winners yet.';

	return (
		<GameStatePreviewWrapper>
			{ state.winningPlayers.length > 0 ?
				<>
					<div className="label">Winners</div>
					<div className="winners">
						{ state.winningPlayers.map((p, i) => (
							<div className={`winner rank-${i+1}`} key={p.name}>
								<span className="rank">#{padStart((i+1).toString(), 2, '0')}</span>
								<span className="name">{p.name}</span>
								{ p.name.toLocaleLowerCase() === currentUser.toLocaleLowerCase() ? <span className="self-badge">YOU</span> : null }
								<span className="time">{p.time / 1000}s</span>
							</div>
						)) }
					</div>
				</>
			:
				<>
					<div className="empty">{message}</div>
				</>
			}
		</GameStatePreviewWrapper>
	);
}

type UserPopupObject = {
	key: number;
	name: string;
	pos: number;
	type: 'countdown' | 'success' | 'error';
}

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
	pointer-events: none;

	.name {
		font-size: 1rem;
		font-weight: 900;
		text-shadow: 0 0 5px white;
		color: black;
	}

	.icon {
		position: absolute;
		top: calc(50% - 1.5rem);
		left: calc(50% - 1.5rem);
		width: 3rem;
		height: 3rem;
		color: rgba(0, 0, 0, 0.25);
		opacity: 0.5;
		z-index: -1;

		svg {
			width: 100%;
			height: 100%;
		}
	}

	&.countdown {
		.name {
			font-size: 2.5rem;
			color: ${props => props.theme.primary.main};
		}

		.icon {
			top: calc(50% - 2rem);
			left: calc(50% - 2rem);
			width: 4rem;
			height: 4rem;
			color: ${props => props.theme.lightGreen};
		}
	}

	&.success {
		.name {
			color: ${props => props.theme.green};
		}

		.icon {
			color: ${props => props.theme.lightGreen};
		}
	}

	&.error {
		.name {
			color: ${props => props.theme.red};
		}

		.icon {
			color: ${props => props.theme.lightRed};
		}
	}
`;

const UserPopup = (props: { user: UserPopupObject }) => {
	const { user } = props;
	const left = `${(user.pos * 50) + 25}%`;

	return (
		<UserPopupWrapper className={user.type} style={{ left }}>
			<div className="name">{user.name}</div>
			<div className="icon">
				<FontAwesomeIcon spin={user.type === 'countdown'} icon={user.type === 'countdown' ? faCertificate : user.type === 'error' ? faTimes : faCheck} />
			</div>
		</UserPopupWrapper>
	);
}

const Winner = styled.div`
	position: absolute;
	padding: 2rem;
	bottom: 0;
	left: 0;
	right: 0;
	animation: ${translateUp} 500ms ${props => props.theme.transitions.easeOutQuint} forwards;
	text-align: center;
	pointer-events: none;

	.name {
		font-weight: 900;
		font-size: 2rem;
		color: ${props => props.theme.green};
		text-shadow: 0 0 15px white;
	}

	.label {
		font-size: 1rem;
		font-weight: 700;
		color: rgba(0, 0, 0, 0.5);
	}
`;

const UserPopups = (props: { game: GameController }) => {
	const { socket, currentUser } = props.game;
	const { state } = props.game.buzzwire;
	const [users, setUsers] = useState<UserPopupObject[]>([]);

	useEffect(() => {
		const flashUserPopup = (name: string, type: 'countdown' | 'success' | 'error') => {
			const key = new Date().getTime();
			const pos = type === 'countdown' ? 0.5 : Math.random();
			setUsers(prevUsers => [...prevUsers, { key, name, pos, type }]);

			setTimeout(() => {
				setUsers(newUsers => {
					const copy = [...newUsers];
					copy.splice(0, 1);
					return copy;
				});
			}, 1000);
		};

		const flashCountdown = () => {
			setTimeout(() => flashUserPopup('3', 'countdown'), 0);
			setTimeout(() => flashUserPopup('2', 'countdown'), 1000);
			setTimeout(() => flashUserPopup('1', 'countdown'), 2000);
		}

		const flashGo = () => flashUserPopup('GO!', 'countdown');

		const flashSuccess = (name: string) => {
			if (name.toLocaleLowerCase() !== currentUser.toLocaleLowerCase()) flashUserPopup(name, 'success');
		}

		const flashError = (name: string) => flashUserPopup(name, 'error');

		socket.on('game:buzzwire:game:countdown', flashCountdown);
		socket.on('game:buzzwire:game:started', flashGo);
		socket.on('game:buzzwire:game:playerwon', flashSuccess);
		socket.on('game:buzzwire:game:playerhit', flashError);

		return () => {
			socket.off('game:buzzwire:game:countdown', flashCountdown);
			socket.off('game:buzzwire:game:started', flashGo);
			socket.off('game:buzzwire:game:playerwon', flashSuccess);
			socket.off('game:buzzwire:game:playerhit', flashError);
		}
	}, [socket, users, setUsers, state, currentUser]);

	const currentPlayer = state.players[currentUser.toLocaleLowerCase()];
	const winTime = state.winningPlayers.find(p => p.name.toLocaleLowerCase() === currentUser.toLocaleLowerCase())?.time;
	const winTimeSeconds = winTime ? (winTime / 1000) + 's' : '';

	const userPopups = users.map(user => <UserPopup key={user.key} user={user} />);
	return (
		<>
			{ currentPlayer?.completed ?
				<Winner>
					<div className="name">Well done!</div>
					<div className="label">You finished in <strong>{winTimeSeconds}</strong>.</div>
				</Winner>
			: null }
			{userPopups}
		</>
	);
}

const AdminControlsWrapper = styled.div`
	height: 100%;

	.admin-controls {
		padding: 1rem 2rem;
	}

	.control-row {
		display: flex;
		margin: 1rem 0;

		.ui-button {
			margin-right: 1rem;
		}

		.ui-input {
			flex: 1;
			margin: 2px 0;
		}

		.label {
			margin: 1rem 0;
			font-weight: 700;
			opacity: 0.75;
		}
	}
`;

export const AdminControls = (props: { game: GameController }) => {
	const { room, currentUser } = props.game;
	const { state, setCoordinates, setIsDrawing, appendPoint, reset, startGame, stopGame } = props.game.buzzwire;

	const [isLocalDrawing, setIsLocalDrawing] = useState(false);
	const [isDrawingEnabled, setIsDrawingEnabled] = useState(false);
	const [isTracing, setIsTracing] = useState(false);
	const [svgPath, setSvgPath] = useState('');
	const tracePath = useRef<SVGPathElement>(null);

	const [localCoords, setLocalCoords] = useState([0, 0]);

	const traceSvgPath = useCallback(async () => {
		const path = tracePath.current;
		if (!path) return false;

		const length = path.getTotalLength();
		if (length < 30) return false;

		reset();
		await sleep(50);
		setIsTracing(true);

		let i = 0;
		const appendNextPoint = (onComplete: () => void) => {
			if (i >= length) {
				const lastPoint = path.getPointAtLength(length);
				appendPoint(lastPoint.x, lastPoint.y);
				setSvgPath('');
				setIsTracing(false);

				onComplete();
				return;
			}

			const point = path.getPointAtLength(i);
			appendPoint(point.x, point.y);
			i += 10;
			setTimeout(() => appendNextPoint(onComplete), 10);
		}

		await (new Promise<void>(appendNextPoint));
		return true;
	}, [tracePath, appendPoint, reset]);

	const startDrawing = useCallback((x: number, y: number) => {
		setIsLocalDrawing(true);
		setIsDrawing(true);
		appendPoint(x, y);
	}, [appendPoint, setIsDrawing]);

	const stopDrawing = useCallback(async (x: number, y: number) => {
		if (state.path.length < 3) reset();
		else appendPoint(x, y);

		setIsLocalDrawing(false);
		setIsDrawingEnabled(false);

		// retrace path to normalize distances
		const path = 'M' + state.path.map(p => p.join(',')).join(' L');
		setSvgPath(path);
		setIsDrawing(false);
		await sleep(0);
		const traced = await traceSvgPath();
		if (!traced) setSvgPath('');
	}, [state, appendPoint, setIsDrawing, traceSvgPath, reset]);

	const onMouseMove = useCallback((evt: React.MouseEvent<HTMLDivElement>) => {
		const [lx, ly, x, y] = getEventCoords(evt);

		setLocalCoords([lx, ly]);
		setCoordinates(x, y);

		if (isDrawingEnabled && isLocalDrawing) {
			// check if we've exceeded draw distance from the last point
			const last = state.path[state.path.length - 1];
			const distance = getDistance(last, [x, y]);
			if (distance >= 10) appendPoint(x, y);
		}
	}, [isDrawingEnabled, isLocalDrawing, state, appendPoint, setCoordinates]);

	const onMouseDown = useCallback((evt: React.MouseEvent<HTMLDivElement>) => {
		const [, , x, y] = getEventCoords(evt);
		if (isDrawingEnabled) startDrawing(x, y);
	}, [isDrawingEnabled, startDrawing]);

	const onMouseOut = useCallback((evt: React.MouseEvent<HTMLDivElement>) => {
		const [, , x, y] = getEventCoords(evt);
		if (isDrawingEnabled && isLocalDrawing) stopDrawing(x, y);
		setCoordinates();
	}, [isDrawingEnabled, isLocalDrawing, stopDrawing, setCoordinates]);

	const onMouseUp = useCallback((evt: React.MouseEvent<HTMLDivElement>) => {
		const [, , x, y] = getEventCoords(evt);
		if (isDrawingEnabled) stopDrawing(x, y);
	}, [isDrawingEnabled, stopDrawing]);

	const isCurrentUserAdmin = useMemo(() => room.roomAdmin.toLocaleLowerCase() === currentUser.toLocaleLowerCase(), [room, currentUser]);
	const invalidSvgPath = useMemo(() => svgPath && isSvgPathInvalid(svgPath), [svgPath]);
	const localCursorClassNames = classNames('local-cursor', { 'admin': isCurrentUserAdmin });

	return (
		<AdminControlsWrapper>
			<GameCanvasWrapper onMouseMove={onMouseMove} onMouseDown={onMouseDown} onMouseOut={onMouseOut} onMouseUp={onMouseUp}>
				{ svgPath ?
					<svg className="path-preview" width="800" height="450" viewBox="0 0 800 450" fill="none" xmlns="http://www.w3.org/2000/svg">
						{ invalidSvgPath ?
							<>
								<rect width="800" height="450" fill="white"/>
								<circle cx="400" cy="225" r="56.5" stroke="#E72424" strokeWidth="3"/>
								<path d="M462 162L337 287" stroke="#E72424" strokeWidth="3"/>
								<path d="M316.942 233.488H320.47V217H316.942V233.488Z" fill="#E72424"/>
								<path d="M323.88 233.488H327.408V222.832L335.376 233.488H338.904V217H335.376V227.656L327.408 217H323.88V233.488Z" fill="#E72424"/>
								<path d="M354.638 217L349.934 228.616L345.206 217H341.222L347.942 233.488H351.902L358.622 217H354.638Z" fill="#E72424"/>
								<path d="M370.364 233.488H374.324L367.628 217H363.644L356.948 233.488H360.908L362.06 230.656H369.212L370.364 233.488ZM363.188 227.896L365.636 221.896L368.084 227.896H363.188Z" fill="#E72424"/>
								<path d="M380.166 230.296V217H376.638V233.488H388.374V230.296H380.166Z" fill="#E72424"/>
								<path d="M390.841 233.488H394.369V217H390.841V233.488Z" fill="#E72424"/>
								<path d="M397.778 233.488H403.682C409.226 233.488 413.162 230.056 413.162 225.232C413.162 220.408 409.226 217 403.682 217H397.778V233.488ZM401.306 230.272V220.216H404.138C407.306 220.216 409.514 222.304 409.514 225.232C409.514 228.184 407.306 230.272 404.138 230.272H401.306Z" fill="#E72424"/>
								<path d="M422.271 233.488H425.799V228.136H429.687C433.263 228.136 435.903 225.832 435.903 222.568C435.903 219.304 433.263 217 429.687 217H422.271V233.488ZM425.799 224.896V220.24H429.327C431.055 220.24 432.255 221.152 432.255 222.568C432.255 223.984 431.055 224.896 429.327 224.896H425.799Z" fill="#E72424"/>
								<path d="M448.926 233.488H452.886L446.19 217H442.206L435.51 233.488H439.47L440.622 230.656H447.774L448.926 233.488ZM441.75 227.896L444.198 221.896L446.646 227.896H441.75Z" fill="#E72424"/>
								<path d="M457.361 233.488H460.889V220.192H466.049V217H452.225V220.192H457.361V233.488Z" fill="#E72424"/>
								<path d="M479.529 217V223.48H472.017V217H468.489V233.488H472.017V226.672H479.529V233.488H483.081V217H479.529Z" fill="#E72424"/>
								<path fillRule="evenodd" clipRule="evenodd" d="M316.942 241.488C312.524 241.488 308.942 237.906 308.942 233.488V217C308.942 212.582 312.524 209 316.942 209H320.47C321.055 209 321.626 209.063 322.175 209.182C322.724 209.063 323.295 209 323.88 209H327.408C328.824 209 330.194 209.375 331.391 210.062C332.564 209.386 333.925 209 335.376 209H338.904C339.299 209 339.687 209.029 340.066 209.084C340.446 209.028 340.832 209 341.222 209H345.206C346.939 209 348.581 209.559 349.922 210.538C351.263 209.559 352.904 209 354.638 209H358.622C359.486 209 360.333 209.14 361.132 209.404C361.929 209.141 362.775 209 363.644 209H367.628C369.271 209 370.832 209.503 372.132 210.389C373.415 209.512 374.967 209 376.638 209H380.166C382.217 209 384.087 209.772 385.503 211.041C386.919 209.772 388.79 209 390.841 209H394.369C394.954 209 395.524 209.063 396.074 209.182C396.623 209.063 397.193 209 397.778 209H403.682C407.943 209 412.149 210.379 415.368 212.954C416.757 210.588 419.328 209 422.271 209H429.687C432.243 209 434.806 209.655 437.038 210.893C438.453 209.696 440.272 209 442.206 209H446.19C447.245 209 448.266 209.207 449.205 209.59C450.137 209.209 451.157 209 452.225 209H466.049C466.464 209 466.871 209.032 467.269 209.092C467.667 209.032 468.074 209 468.489 209H472.017C473.375 209 474.653 209.338 475.773 209.935C476.893 209.338 478.172 209 479.529 209H483.081C487.5 209 491.081 212.582 491.081 217V233.488C491.081 237.906 487.5 241.488 483.081 241.488H479.529C478.172 241.488 476.893 241.15 475.773 240.553C474.653 241.15 473.375 241.488 472.017 241.488H468.489C467.114 241.488 465.82 241.141 464.689 240.53C463.559 241.141 462.264 241.488 460.889 241.488H457.361C456.583 241.488 455.831 241.377 455.12 241.17C454.403 241.378 453.652 241.488 452.886 241.488H448.926C447.188 241.488 445.541 240.925 444.198 239.941C442.855 240.925 441.209 241.488 439.47 241.488H435.51C433.732 241.488 432.031 240.897 430.655 239.846C429.308 240.876 427.625 241.488 425.799 241.488H422.271C419.325 241.488 416.752 239.896 415.363 237.526C412.151 240.102 407.951 241.488 403.682 241.488H397.778C397.193 241.488 396.623 241.425 396.074 241.306C395.524 241.425 394.954 241.488 394.369 241.488H390.841C390.421 241.488 390.009 241.456 389.607 241.393C389.205 241.456 388.793 241.488 388.374 241.488H376.638C376.244 241.488 375.856 241.46 375.477 241.404C375.098 241.46 374.713 241.488 374.324 241.488H370.364C368.625 241.488 366.979 240.925 365.636 239.941C364.293 240.925 362.646 241.488 360.908 241.488H356.948C356.079 241.488 355.228 241.347 354.425 241.08C353.625 241.346 352.775 241.488 351.902 241.488H347.942C346.293 241.488 344.727 240.982 343.423 240.09C342.138 240.972 340.581 241.488 338.904 241.488H335.376C333.959 241.488 332.59 241.113 331.393 240.426C330.22 241.102 328.859 241.488 327.408 241.488H323.88C323.295 241.488 322.724 241.425 322.175 241.306C321.626 241.425 321.055 241.488 320.47 241.488H316.942ZM327.408 233.488V222.832L335.376 233.488H338.904V217H335.376V227.656L327.408 217H323.88V233.488H327.408ZM320.47 233.488V217H316.942V233.488H320.47ZM347.942 233.488H351.902L358.622 217H354.638L349.934 228.616L345.206 217H341.222L347.942 233.488ZM388.374 233.488V230.296H380.166V217H376.638V233.488H388.374ZM367.628 217H363.644L356.948 233.488H360.908L362.06 230.656H369.212L370.364 233.488H374.324L367.628 217ZM363.188 227.896L365.636 221.896L368.084 227.896H363.188ZM390.841 233.488H394.369V217H390.841V233.488ZM397.778 217V233.488H403.682C403.836 233.488 403.988 233.485 404.138 233.48C404.704 233.461 405.251 233.405 405.778 233.315C410.192 232.562 413.162 229.422 413.162 225.232C413.162 221.042 410.192 217.92 405.778 217.172C405.251 217.083 404.704 217.027 404.138 217.008C403.988 217.003 403.836 217 403.682 217H397.778ZM409.306 223.738C408.826 222.093 407.543 220.88 405.778 220.419C405.269 220.286 404.72 220.216 404.138 220.216H401.306V230.272H404.138C404.72 230.272 405.269 230.202 405.778 230.068C407.543 229.607 408.826 228.392 409.306 226.737C409.443 226.268 409.514 225.764 409.514 225.232C409.514 224.704 409.443 224.204 409.306 223.738ZM422.271 233.488H425.799V228.136H429.687C429.884 228.136 430.079 228.129 430.271 228.115C431.485 228.027 432.573 227.666 433.461 227.089C433.585 227.009 433.705 226.924 433.821 226.836C434.397 226.395 434.873 225.854 435.223 225.233C435.365 224.982 435.486 224.717 435.585 224.441C435.792 223.865 435.903 223.236 435.903 222.568C435.903 222.149 435.859 221.746 435.776 221.362C435.452 219.868 434.526 218.656 433.209 217.892C432.37 217.405 431.372 217.101 430.271 217.021C430.079 217.007 429.884 217 429.687 217H422.271V233.488ZM435.51 233.488H439.47L440.622 230.656H447.774L448.926 233.488H452.886L446.19 217H442.206L435.51 233.488ZM441.75 227.896H446.646L444.198 221.896L441.75 227.896ZM457.361 233.488H460.889V220.192H466.049V217H452.225V220.192H457.361V233.488ZM468.489 233.488H472.017V226.672H479.529V233.488H483.081V217H479.529V223.48H472.017V217H468.489V233.488ZM430.271 224.795C430.322 224.784 430.372 224.771 430.421 224.758C431.541 224.453 432.255 223.66 432.255 222.568C432.255 222.068 432.105 221.631 431.836 221.275C431.49 220.818 430.948 220.494 430.271 220.341C430.085 220.299 429.89 220.269 429.687 220.254C429.578 220.245 429.468 220.241 429.355 220.24C429.345 220.24 429.336 220.24 429.327 220.24H425.799V224.896H429.327C429.336 224.896 429.345 224.896 429.355 224.896C429.468 224.895 429.578 224.891 429.687 224.882C429.89 224.867 430.085 224.837 430.271 224.795Z" fill="white"/>
							</>
						:
							<>
								<path ref={tracePath} d={svgPath} stroke="#808080" strokeWidth="1" strokeLinecap="round" />
								{ isTracing && state.path.length > 2 ?
									<PathPreview isDrawing={state.isDrawing} admin={isCurrentUserAdmin} path={state.path} />
								: null }
							</>
						}
					</svg>
				:
					<PathPreview isDrawing={state.isDrawing} admin={isCurrentUserAdmin} path={state.path} />
				}
				<PlayerCursorsCanvas game={props.game} />
				<div className={localCursorClassNames} style={{ left: localCoords[0], top: localCoords[1] }}></div>
				<TimerDisplay game={props.game} />
				<UserPopups game={props.game} />
			</GameCanvasWrapper>

			{ state.isPlaying || state.winningPlayers.length > 0 ?
				<GameStatePreview game={props.game} />
			: null }

			<div className="admin-controls">
				{ state.isPlaying && state.isOnCountdown ?
					<>
						<div className="control-row">
							<Button disabled>
								Stop Game
							</Button>
							<div className="label">The game is starting...</div>
						</div>
					</>
				: state.isPlaying ?
					<>
						<div className="control-row">
							<Button inverted onClick={stopGame}>
								Stop Game
							</Button>
							<div className="label">Click to stop the game.</div>
						</div>
					</>
				: isDrawingEnabled ?
					<div className="control-row">
						<Button disabled={isLocalDrawing} onClick={() => setIsDrawingEnabled(false)}>
							{ isLocalDrawing ? 'Drawing...' : 'Cancel Drawing' }
						</Button>
						<div className="label">
							{ isLocalDrawing ? 'Release mouse to stop drawing.' : 'Start drawing a path on the canvas to begin.' }
						</div>
					</div>
				: isTracing ?
					<div className="control-row">
						<Button disabled>
							Tracing SVG Path
						</Button>
						<div className="label">Please wait...</div>
					</div>
				:
					<>
						{ state.path.length > 3 ?
							<div className="control-row">
								<Button inverted onClick={startGame}>
									Start Game
								</Button>
								<div className="label">Click to start the game.</div>
							</div>
						: null }
						<div className="control-row">
							<Button onClick={() => { reset(); setIsDrawingEnabled(true); }}>
								Draw Pattern
							</Button>
							<div className="label">Click to start drawing pattern on the canvas.</div>
						</div>
						<div className="control-row">
							<Button onClick={traceSvgPath}>
								Trace SVG Path
							</Button>
							<Input inverted name="svgpath" value={svgPath} onChange={(evt: React.ChangeEvent<HTMLInputElement>) => setSvgPath(evt.target.value)} placeholder="Paste SVG Path curves here: (M0,0 L800,450)" />
						</div>
						<div className="control-row">
							<Button onClick={reset}>
								Reset
							</Button>
							<div className="label">Reset all game states.</div>
						</div>
					</>
				}
			</div>
		</AdminControlsWrapper>
	);
}

export const PlayerControls = (props: { game: GameController }) => {
	const { socket, room, currentUser } = props.game;
	const { state, setCoordinates } = props.game.buzzwire;

	const currentPlayer = state.players[currentUser.toLocaleLowerCase()];

	/* -- shake game area when player loses -- */
	const root = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const onPlayerHit = (name: string) => {
			const self = currentUser.toLocaleLowerCase() === name.toLocaleLowerCase();
			if (self && root.current) {
				const r = root.current;
				r.classList.add('shake');
				setTimeout(() => r.classList.remove('shake'), 500);
			}
		}
		socket.on('game:buzzwire:game:playerhit', onPlayerHit);

		return () => {
			socket.off('game:buzzwire:game:playerhit', onPlayerHit);
		}
	}, [socket, root, currentUser]);

	/* -- play progress tick sounds -- */
	const [lastPlayedProgress, setLastPlayedProgress] = useState(0);
	const sounds = useSounds();
	useEffect(() => {
		if (!currentPlayer) return;

		if (lastPlayedProgress !== currentPlayer.progress) {
			if (currentPlayer.progress > 0 && currentPlayer.progress < state.path.length-1) sounds.tick();
			setLastPlayedProgress(currentPlayer.progress);
		}
	}, [lastPlayedProgress, sounds, currentPlayer, state]);

	/* -- handle mouse events -- */
	const [localCoords, setLocalCoords] = useState([0, 0]);
	const onMouseMove = (evt: React.MouseEvent<HTMLDivElement>) => {
		const [lx, ly, x, y] = getEventCoords(evt);

		setLocalCoords([lx, ly]);
		setCoordinates(x, y);
	}

	/* -- handle touch events -- */
	const [touchStartPoint, setTouchStartPoint] = useState<[number, number] | null>(null);
	const onTouchStart = (evt: React.TouchEvent<HTMLDivElement>) => {
		if (evt.touches.length === 1) {
			const box = (evt.target as HTMLElement)?.getBoundingClientRect();
			if (!box) return;
		
			const lx = evt.touches[0].clientX - box.left;
			const ly = evt.touches[0].clientY - box.top;
			const x = 800 * (lx / box.width);
			const y = 450 * (ly / box.height);

			setTouchStartPoint([x, y]);
		}
	}

	const onTouchMove = (evt: React.TouchEvent<HTMLDivElement>) => {
		if (touchStartPoint && evt.touches.length === 1) {
			const box = (evt.target as HTMLElement)?.getBoundingClientRect();
			if (!box) return;
		
			const lx = evt.touches[0].clientX - box.left;
			const ly = evt.touches[0].clientY - box.top;
			const x = 800 * (lx / box.width);
			const y = 450 * (ly / box.height);

			setLocalCoords([lx, ly]);
			setCoordinates(x, y);
		}
	}

	const onTouchEnd = (evt: React.TouchEvent<HTMLDivElement>) => {
		if (touchStartPoint) {
			setCoordinates(touchStartPoint[0], touchStartPoint[1]);
			setTouchStartPoint(null);
		}
	}

	const localCursorClassNames = classNames('local-cursor', { 'admin': room.roomAdmin.toLocaleLowerCase() === currentUser.toLocaleLowerCase() });

	return (
		<>
			<GameCanvasWrapper ref={root} onMouseMove={onMouseMove} onMouseOut={() => setCoordinates()} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
				<PathPreview isDrawing={state.isDrawing} path={state.path} isPlaying={state.isPlaying} progress={currentPlayer?.progress || 0} />
				<PlayerCursorsCanvas game={props.game} />
				<div className={localCursorClassNames} style={{ left: localCoords[0], top: localCoords[1] }}></div>
				<TimerDisplay game={props.game} />
				<UserPopups game={props.game} />
			</GameCanvasWrapper>
			<GameStatePreview game={props.game} />
		</>
	);
}
