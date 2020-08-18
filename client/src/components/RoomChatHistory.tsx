import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';

import { GameController } from '../hooks/useGameController';

const ChatHistory = styled.div`
	padding: 0.5rem 2rem;
	background: rgba(0, 0, 0, 0.05);

	.label {
		padding: 1rem 0;
		font-size: 0.8rem;
		font-weight: 900;
		color: ${props => props.theme.primary.main};
		text-transform: uppercase;
	}
`;

const ChatMessageWrapper = styled.div`
	margin: 0.5rem 0;

	&.system {
		font-weight: 700;
		font-size: 0.8rem;
		font-style: italic;
		opacity: 0.5;
	}

	strong {
		color: ${props => props.theme.primary.main};
	}
`;

const ChatMessage = (props: { message: ChatMessage }) => {
	const { message } = props;

	if (message.system) return (
		<ChatMessageWrapper className="system">
			{message.message}
		</ChatMessageWrapper>
	);
	return (
		<ChatMessageWrapper>
			<strong>{message.username}:</strong> {message.message}
		</ChatMessageWrapper>
	);
}

const RoomChatHistory = (props: { autoscroll: boolean; game: GameController }) => {
	const { chats } = props.game;

	const root = useRef<HTMLDivElement>(null);
	const scrollReference = useRef<HTMLDivElement>(null);

	// scroll to bottom every rerender
	useEffect(() => {
		if (props.autoscroll) scrollReference.current?.scrollIntoView({ behavior: 'smooth' });
	}, [chats, props.autoscroll]);

	return (
		<ChatHistory ref={root} className="ui-room-chat-history">
			<div className="label">Room Chat</div>
			{ chats.map(chat => <ChatMessage key={chat.timestamp} message={chat} />) }
			<div ref={scrollReference} className="scroll-reference"></div>
		</ChatHistory>
	);
}

export default RoomChatHistory;
