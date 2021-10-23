import React from 'react';
import styled from 'styled-components';
import { transparentize } from 'polished';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShareAlt, faUsers } from '@fortawesome/free-solid-svg-icons';

import { GameController } from '../hooks/useGameController';

const RoomHeaderWrapper = styled.div`
	display: flex;
	padding: 0 0 2rem;
	color: black;

	@media screen and (min-width: 960px) {
		padding: 2rem;
		border-bottom: 1px solid ${transparentize(0.9, 'black')};
	}

	.content-column {
		flex: 1;
	}

	.share-column {
		flex: 0 0 auto;
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

	.share-link {
		display: block;
		width: 3rem;
		height: 3rem;
		line-height: 3rem;
		text-align: center;
		font-size: 1.25rem;
		color: ${props => props.theme.primary.main};
		text-decoration: none;
		border-radius: 5px;
		transition: all 100ms ease;

		&:hover, &:focus {
			background: rgba(0, 0, 0, 0.1);
		}

		&:active {
			background: ${props => props.theme.primary.main};
			color: white;
		}
	}

	&.inverted {
		color: white;
		
		.room-info {
			color: ${transparentize(0.25, 'white')};
		}

		.share-link {
			color: ${transparentize(0.25, 'white')};

			&:hover, &:focus {
				background: ${transparentize(0.9, 'white')};
			}

			&:active {
				background: white;
				color: ${props => props.theme.primary.main};
			}
		}
	}
`;

export type RoomHeaderProps = {
	game: GameController;
	inverted?: boolean;
}

const RoomHeader = (props: RoomHeaderProps) => {

	const roomLink = `${window.location.origin}/room/${props.game.room.roomCode.toLocaleLowerCase()}`;
	const copyRoomLink = async () => {
		await navigator.clipboard.writeText(roomLink);
		alert('Your room link has been copied to the clipboard!');
	}

	const roomHeaderClassNames = classNames('ui-room-header', { inverted: props.inverted });

	return (
		<RoomHeaderWrapper className={roomHeaderClassNames}>
			<div className="content-column">
				<h1>{props.game.room.roomName}</h1>
				<div className="room-info">
					<div className="info room-type">{props.game.type}</div>
					<div className="info users">{props.game.participants.length} <FontAwesomeIcon icon={faUsers} /></div>
				</div>
			</div>
			<div className="share-column">
				<a className="share-link" href={roomLink} onClick={(evt) => { copyRoomLink(); evt.preventDefault(); return false; }}>
					<FontAwesomeIcon icon={faShareAlt} />
				</a>
			</div>
		</RoomHeaderWrapper>
	);
};

export default RoomHeader;
