import React from 'react';
import styled from 'styled-components';
import { transparentize } from 'polished';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faLock, faUnlock } from '@fortawesome/free-solid-svg-icons';

import { GameController } from '../hooks/useGameController';

const RoomParticipantsWrapper = styled.div`
	border-bottom: 1px solid ${transparentize(0.9, 'black')};

	.label {
		padding: 1rem 2rem 0;
		font-size: 0.8rem;
		font-weight: 900;
		color: ${props => props.theme.primary.main};
		text-transform: uppercase;
	}
`;

const UserPanel = styled.div`
	position: relative;
	display: flex;
	padding: 1rem 2rem;
	border-bottom: 1px solid ${transparentize(0.9, 'black')};
	font-weight: 700;
	line-height: 1rem;
	color: ${transparentize(0.25, 'black')};

	&:last-child {
		border-bottom: none;
	}

	&.active {
		color: ${props => props.theme.primary.main};
		font-weight: 900;
	}

	.name {
		flex: 0 0 auto;
	}

	.admin-icon {
		flex: 0 0 auto;
		margin-left: 0.75em;
		color: ${props => props.theme.yellow};
	}

	.lock-icon {
		flex: 0 0 auto;
		margin-left: 0.75em;
		font-size: 0.8rem;
		color: ${props => props.theme.red};
	}

	.spacer {
		flex: 1;
	}

	.user-actions {
		flex: 0 0 auto;
		display: flex;
		position: absolute;
		top: calc(50% - 1rem);
		right: 1rem;

		.button-icon {
			margin-left: 0.25rem;
			height: 2rem;
			line-height: 2rem;
			width: 2rem;
			font-size: 0.8rem;
			background: none;
			border: none;
			border-radius: 50%;
			outline: none;
			cursor: pointer;

			&:hover, &:focus {
				background: ${props => props.theme.primary.main};
				color: white;
			}
		}

		.user-score {
			margin-left: 0.25rem;
			padding: 0 0.25rem;
			line-height: 2rem;
			color: ${props => props.theme.green};
			font-weight: 900;
		}
	}
`;

const RoomParticipants = (props: { game: GameController }) => {
	const { room, participants, currentUser } = props.game;

	const currentUserIsAdmin = room.roomAdmin.toLocaleLowerCase() === currentUser.toLocaleLowerCase();

	const userPanels = [];
	for (const u of participants) {
		const isActive = currentUser.toLocaleLowerCase() === u.name.toLocaleLowerCase();

		const isAdmin = room.roomAdmin.toLocaleLowerCase() === u.name.toLocaleLowerCase();

		const classic = props.game.mode === 'classic';
		const showLockControls = currentUserIsAdmin && !isAdmin;
		const toggleBuzzerLock = props.game.classic.toggleBuzzerLock;
		const score = props.game.classic.state.scores[u.name.toLocaleLowerCase()];
		let locked = false;
		if (classic) {
			const state = props.game.classic.state;
			locked = state.lockedBuzzers.indexOf(u.name.toLocaleLowerCase()) >= 0;
		}

		const userPanelClassNames = classNames('ui-user-panel', { active: isActive });
		userPanels.push(
			<UserPanel className={userPanelClassNames} key={u.socketId}>
				<span className="name">{u.name}</span>
				{ isAdmin ?
					<span className="admin-icon">
						<FontAwesomeIcon icon={faStar} />
					</span>
				: null }
				{ locked ?
					<span className="lock-icon">
						<FontAwesomeIcon icon={faLock} />
					</span>
				: null }

				<div className="spacer"></div>

				<div className="user-actions">
					{ classic ?
						<>
							<span className="user-score">
								{ score }
							</span>
							{ showLockControls ?
								<button className="button-icon" title={ locked ? 'Unlock' : 'Lock' } onClick={() => toggleBuzzerLock(u.name)}>
									<FontAwesomeIcon icon={ locked ? faUnlock : faLock } />
								</button>
							: null }
						</>
					: null }
				</div>
			</UserPanel>
		);
	}

	return (
		<RoomParticipantsWrapper className="ui-room-participants">
			<div className="label">Players</div>
			{userPanels}
		</RoomParticipantsWrapper>
	);
}

export default RoomParticipants;
