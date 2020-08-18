import React from 'react';
import styled from 'styled-components';
import { transparentize } from 'polished';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

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
	display: block;
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

	.admin-icon {
		display: inline-block;
		margin-left: 0.75em;
		color: ${props => props.theme.yellow};
		line-height: 1rem;
	}
`;

const RoomParticipants = (props: { game: GameController }) => {
	const { participants, currentUser, room } = props.game;

	const userPanels = [];
	for (const u of participants) {
		const isActive = currentUser.toLocaleLowerCase() === u.name.toLocaleLowerCase();
		const isAdmin = room.roomAdmin.toLocaleLowerCase() === u.name.toLocaleLowerCase();
		const userPanelClassNames = classNames('ui-user-panel', { active: isActive });
		userPanels.push(
			<UserPanel className={userPanelClassNames} key={u.socketId}>
				{u.name}
				{ isAdmin ?
					<span className="admin-icon">
						<FontAwesomeIcon icon={faStar} />
					</span>
				: null }
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
