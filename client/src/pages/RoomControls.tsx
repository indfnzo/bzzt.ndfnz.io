import React, { useState } from 'react';
import styled from 'styled-components';
import {transparentize } from 'polished';
import { useMediaQuery } from 'react-responsive';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp } from '@fortawesome/free-solid-svg-icons';

import { Header, GameArea, Loader, RoomHeader, RoomParticipants, RoomChatBox, RoomChatHistory } from '../components';
import { useGameController } from '../hooks';

export const RoomControlsWrapper = styled.main`
	background: ${props => props.theme.primary.main};
	background-image: url('/images/room-background.svg');
	background-size: cover;
	background-position: center center;
	color: white;

	> .container {
		display: flex;
		flex-direction: column;

		> header {
			flex: 0 0 auto;
		}

		> .game-controls-wrapper {
			flex: 1;
			margin-bottom: 2rem;
			min-height: 32rem;
			height: 64rem;
			max-height: calc(var(--innerHeight, 100vh) - 8rem);
		}
	}
`;

const GameControlsWrapper = styled.div`
	display: flex;
	flex-direction: column;

	.room-details {
		position: relative;
		display: flex;
		flex-direction: column;
		background: white;
		color: black;
		border-radius: 10px;
		overflow: hidden;

		.spacer {
			flex: 1;
		}

		.ui-room-participants {
			flex: 1;
			overflow-x: auto;
		}

		.ui-room-chat-history {
			position: relative;
			flex: 1;
			overflow-x: auto;
			margin-bottom: 3.5rem;

			&.collapsed {
				max-height: 3rem;
				overflow: hidden;
			}
		}

		.ui-room-chat-box {
			flex: 0 0 auto;
			position: absolute;
			bottom: 0;
			left: 0;
			right: 0;
		}

		&.mobile {
			height: calc(var(--innerHeight, 100vh) - 4rem);
			transition: height 500ms ${props => props.theme.transitions.easeOutQuint};

			&.collapsed {
				height: 6.5rem;

				.ui-room-chat {
					> div:first-child {
						display: none;
					}
				}

				.collapse-button {
					.icon {
						transform: none;
					}
				}
			}

			.collapse-button {
				flex: 0 0 auto;
				padding: 0.5rem 1rem;
				line-height: 2rem;
				font-size: 0.9rem;
				font-family: inherit;
				font-weight: 700;
				text-align: left;
				text-transform: uppercase;
				background: none;
				border: none;
				border-bottom: 1px solid ${transparentize(0.9, 'black')};
				color: ${props => props.theme.primary.main};
				outline: none;
				cursor: pointer;

				.icon {
					float: right;
					transform: scaleY(-1);
					transition: transform 500ms ${props => props.theme.transitions.easeOutQuint};
				}
			}
		}
	}

	.game-area-wrapper {
		margin-bottom: 8rem;
	}

	@media screen and (max-width: 959px) {
		.room-details {
			position: fixed;
			left: 2rem;
			right: 2rem;
			bottom: 2rem;
			z-index: 100;
		}
	}

	.game-area-wrapper {
		flex: 1;
		position: relative;
		border-radius: 10px;
		overflow: hidden;
	}

	@media screen and (min-width: 960px) {
		flex-direction: row;

		.room-details {
			flex: 0 0 360px;
			margin-right: 2rem;
		}

		.game-area-wrapper {
			flex: 1;
			margin-bottom: 0;
		}
	}

	@media screen and (min-width: 1280px) {
		.room-details {
			flex: 0 0 480px;
		}
	}
`;

export type RoomProps = {
	room: Room;
	socket: SocketIOClient.Socket;
	username: string;
	connected: boolean;
};
const RoomControls = (props: RoomProps) => {
	const isMobile = useMediaQuery({ maxWidth: 959 });
	const { room, username, socket, connected } = props;

	const game = useGameController(room, socket, username);

	const [collapsed, setCollapsed] = useState(true);
	const isMobileCollapsed = isMobile && collapsed;

	const toggleCollapse = () => setCollapsed(!collapsed);

	const gameArea = (
		<div className="game-area-wrapper">
			<Loader dim loading={!connected} message="Reconnecting" />
			<GameArea game={game}></GameArea>
		</div>
	);

	return (
		<RoomControlsWrapper className="room">
			<div className="container">
				<Header inverted />
				<GameControlsWrapper className="game-controls-wrapper">
					{ isMobile ?
						<>
							<div className="mobile-room-header">
								<RoomHeader inverted game={game} />
							</div>
							{ gameArea }
							<div className={`room-details mobile ${ isMobileCollapsed ? 'collapsed' : '' }`}>
								<Loader dim loading={!connected} />
								<button className="collapse-button" onClick={toggleCollapse}>
									{ isMobileCollapsed ? 'Show' : 'Hide' }
									<div className="icon">
										<FontAwesomeIcon icon={faChevronUp} />
									</div>
								</button>
								<RoomParticipants game={game} />
								<RoomChatHistory autoscroll={!isMobileCollapsed} game={game} />
								<RoomChatBox game={game} />
							</div>
						</>
					:
						<>
							<div className="room-details">
								<Loader dim loading={!connected} />
								<RoomHeader game={game} />
								<RoomParticipants game={game} />
								<RoomChatHistory autoscroll game={game} />
								<RoomChatBox game={game} />
							</div>
							{ gameArea }
						</>
					}
				</GameControlsWrapper>
			</div>
		</RoomControlsWrapper>
	);
}

export default RoomControls;
