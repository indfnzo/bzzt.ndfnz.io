import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { transparentize, darken, hsl } from 'polished';
import classNames from 'classnames';

import { useSounds } from '../hooks';

const unlockScale = keyframes`
	from { transform: scaleX(1); }
	to   { transform: scaleX(0); }
`;

const BuzzerButtonFrame = styled.div`
	display: inline-block;
	padding: 0.125rem 0.33rem;
	background: white;
	border-radius: 10px;
	box-shadow: 0 -0.25rem 0 ${transparentize(0.75, 'black')} inset;

	.buzzer-button {
		display: block;
		padding: 1.5rem 2rem;
		font-size: 2rem;
		font-weight: 900;
		background: ${hsl(0, 0, 0.5)};
		color: white;
		border: none;
		border-radius: 10px;
		box-shadow: 0 0.25rem 0 ${hsl(0, 0, 0.4)};
		outline: none;
		transform: translateY(-0.75rem);
		transition: all 50ms ease;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
		cursor: pointer;

		&:active {
			transform: translateY(-0.5rem);
			box-shadow: 0 1px 0 ${hsl(0, 0, 0.4)};
		}
	}

	&.online .buzzer-button {
		background: ${props => props.theme.red};
		box-shadow: 0 0.25rem 0 ${props => darken(0.1, props.theme.red)};

		&:active {
			box-shadow: 0 1px 0 ${props => darken(0.1, props.theme.red)};
		}
	}

	&.locked .buzzer-button {
		position: relative;
		background: ${hsl(0, 0, 0.5)};
		box-shadow: 0 1px 0 ${hsl(0, 0, 0.4)};
		transform: translateY(-0.5rem);
		cursor: not-allowed;

		&::after {
			content: "";
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: ${transparentize(0.9, 'black')};
			transform-origin: left center;
			animation: ${unlockScale} 1s linear forwards;
		}
	}

	&.online.locked .buzzer-button {
		background: ${props => props.theme.yellow};
		box-shadow: 0 1px 0 ${props => darken(0.1, props.theme.yellow)};
	}

	&.accepted .buzzer-button {
		position: relative;
		background: ${props => props.theme.green};
		box-shadow: 0 1px 0 ${props => darken(0.1, props.theme.green)};
		transform: translateY(-0.5rem);
		cursor: default;
	}
`;

export type BuzzerButtonProps = {
	onBuzz: () => void;
	onTest: () => void;
	accepted?: boolean;
	online?: boolean;
	locked?: boolean;
	volume?: number;
}
const BuzzerButton = (props: BuzzerButtonProps) => {
	const [timeoutLocked, setTimeoutLocked] = useState(false);

	const volume = props.volume == undefined ? 1.0 : props.volume;
	const sounds = useSounds();

	const online = props.online == null ? true : props.online;
	const locked = timeoutLocked || props.locked;

	const handleClick = (evt: React.MouseEvent<HTMLButtonElement>) => {
		if (locked) return;

		if (online) props.onBuzz();
		else props.onTest();

		// play sounds
		sounds.mouthPop(volume);
		if (!online) setTimeout(() => sounds.jump(volume), 250);

		setTimeoutLocked(true);
		setTimeout(() => setTimeoutLocked(false), 1000);
	};

	const frameClassNames = classNames('ui-buzzer-button', { online, locked });

	if (props.accepted) {
		if (timeoutLocked) setTimeoutLocked(false);
		return (
			<BuzzerButtonFrame className="ui-buzzer-button accepted">
				<button className="buzzer-button" disabled>
					ACCEPTED
				</button>
			</BuzzerButtonFrame>
		);
	}

	return (
		<BuzzerButtonFrame className={frameClassNames}>
			<button className="buzzer-button" disabled={locked} onClick={handleClick}>
				{ locked ? 'LOCKED' : online ? 'BUZZ' : 'TEST' }
			</button>
		</BuzzerButtonFrame>
	);
};

export default BuzzerButton;
