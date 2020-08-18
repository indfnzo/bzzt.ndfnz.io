import React from 'react';
import styled from 'styled-components';
import { transparentize, darken } from 'polished';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

import { GameController } from '../hooks/useGameController';

const ChatInput = styled.div`
	position: relative;
	background: ${darken(0.05, 'white')};
	border-top: 1px solid ${transparentize(0.95, 'black')};

	input {
		display: block;
		padding: 1rem 4rem 1rem 2rem;
		line-height: 1.5rem;
		width: 100%;
		background: none;
		border: none;
		font-family: inherit;
		outline: none;
	}

	button {
		display: block;
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		width: 2rem;
		height: 2rem;
		background: white;
		color: ${props => props.theme.primary.main};
		border: none;
		border-radius: 50%;
		box-shadow: 0 5px 10px rgba(0, 0, 0, 0.125);
		outline: none;
		cursor: pointer;
		transition: all 100ms ease;

		svg {
			width: 100%;
			height: 100%;
		}

		&:hover, &:focus {
			box-shadow: 0 5px 10px rgba(0, 0, 0, 0.25), 0 0 0 2px ${props => props.theme.primary.main};
		}
	}
`;

const RoomChatBox = (props: { game: GameController }) => {
	const { sendChat } = props.game;
	const chatInput = React.useRef<HTMLInputElement>(null);

	const sendMessage = (evt: React.FormEvent<HTMLFormElement>) => {
		evt.preventDefault();
		if (!chatInput.current) return false;

		const message = chatInput.current.value.trim();
		if (!message) return;
		sendChat(message);

		chatInput.current.value = '';
		chatInput.current.focus();
		return false;
	}

	return (
		<ChatInput className="ui-room-chat-box">
			<form onSubmit={sendMessage}>
				<input
					ref={chatInput}
					type="text"
					placeholder="Send something..."
					maxLength={256} />
				<button type="submit">
					<FontAwesomeIcon icon={faArrowRight} />
				</button>
			</form>
		</ChatInput>
	);
}

export default RoomChatBox;
