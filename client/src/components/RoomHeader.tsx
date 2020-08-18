import React from 'react';
import styled from 'styled-components';
import { transparentize } from 'polished';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers } from '@fortawesome/free-solid-svg-icons';

import { GameController } from '../hooks/useGameController';

const RoomHeaderWrapper = styled.div`
	padding: 0 0 2rem;
	color: black;

	@media screen and (min-width: 960px) {
		padding: 2rem;
		border-bottom: 1px solid ${transparentize(0.9, 'black')};
	}

	h1 {
		margin: 0 0 0.25rem;
		font-size: 1.5rem;
	}

	.room-info {
		text-transform: uppercase;
		font-weight: 900;
		color: ${ transparentize(0.5, 'black') };

		.info {
			display: inline-block;
			margin-right: 0.75rem;
		}
	}

	&.inverted {
		color: white;
		
		.room-info {
			color: ${ transparentize(0.25, 'white')};
		}
	}
`;

export type RoomHeaderProps = {
	game: GameController;
	inverted?: boolean;
}

const RoomHeader = (props: RoomHeaderProps) => {
	const roomHeaderClassNames = classNames('ui-room-header', { inverted: props.inverted });
	return (
		<RoomHeaderWrapper className={roomHeaderClassNames}>
			<h1>{props.game.room.roomName}</h1>
			<div className="room-info">
				<div className="info room-type">Classic</div>
				<div className="info users">{props.game.participants.length} <FontAwesomeIcon icon={faUsers} /></div>
			</div>
		</RoomHeaderWrapper>
	);
};

export default RoomHeader;
