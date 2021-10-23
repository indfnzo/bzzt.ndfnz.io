import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { darken, transparentize } from 'polished';
import classNames from 'classnames';

import { GameController } from '../hooks/useGameController';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';

const ChatHistory = styled.div`
	background: rgba(0, 0, 0, 0.05);

	.chat-history {
		padding: 0.5rem 2rem;
	}

	.history-header {
		padding: 0 2rem;
		position: sticky;
		top: 0;
		z-index: 100;
		background: ${transparentize(0.1, darken(0.05, 'white'))};
		backdrop-filter: blur(2px);

		.collapse-toggle {
			display: block;
			position: absolute;
			top: 0.5rem;
			right: 0.75rem;
			width: 2rem;
			height: 2rem;
			appearance: none;
			border: none;
			border-radius: 50%;
			background: white;
			text-align: center;
			line-height: 2rem;
			outline: none;
			cursor: pointer;
			transition: all 100ms ease;

			&:hover, &:focus {
				box-shadow: 0 5px 10px rgba(0, 0, 0, 0.25), 0 0 0 2px ${props => props.theme.primary.main};
			}
		}

		.label {
			padding: 1rem 0;
			font-size: 0.8rem;
			font-weight: 900;
			color: ${props => props.theme.primary.main};
			text-transform: uppercase;
		}
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
		font-weight: 900;
		color: ${props => props.theme.primary.main};

		&.admin {
			color: ${props => props.theme.red};
		}
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
			<strong className={message.admin ? 'admin' : ''}>{message.username}:</strong> {message.message}
		</ChatMessageWrapper>
	);
}

const RoomChatHistory = (props: { autoscroll: boolean; game: GameController }) => {
	const { chats } = props.game;
	const [collapsed, setCollapsed] = useState(true);
	const [lastReadChat, setLastReadChat] = useState<any>(null);
	const [unreadCount, setUnreadCount] = useState(0);

	const root = useRef<HTMLDivElement>(null);
	const scrollReference = useRef<HTMLDivElement>(null);

	// scroll to bottom every rerender
	useEffect(() => {
		if (props.autoscroll) {
			if (!collapsed) scrollReference.current?.scrollIntoView({ behavior: 'smooth' });
			else root.current?.scrollIntoView({ behavior: 'smooth' });
		}
	}, [chats, props.autoscroll, collapsed]);

	// increment unread counter
	useEffect(() => {
		const index = lastReadChat ? chats.indexOf(lastReadChat) + 1 : 0;
		setUnreadCount(chats.length - index);
		if (!collapsed) setLastReadChat(chats[chats.length - 1]);
	}, [chats, collapsed, lastReadChat, setLastReadChat]);
	
	const rootClassNames = classNames('ui-room-chat-history', {
		'collapsed': collapsed
	});

	return (
		<ChatHistory ref={root} className={rootClassNames}>
			<div className="history-header">
				<div className="label">
					Room Chat
					{ unreadCount > 0 ? ` (${unreadCount})` : '' }
				</div>
				<button className="collapse-toggle" onClick={() => setCollapsed(!collapsed)}>
					{ collapsed ? <FontAwesomeIcon icon={faChevronUp} /> : <FontAwesomeIcon icon={faChevronDown} /> }
				</button>
			</div>

			<div className="chat-history">
				{ chats.map(chat => <ChatMessage key={chat.username + chat.message + chat.timestamp} message={chat} />) }
				<div ref={scrollReference} className="scroll-reference"></div>
			</div>
		</ChatHistory>
	);
}

export default RoomChatHistory;
