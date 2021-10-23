import { transparentize } from 'polished';
import React from 'react';
import styled, { keyframes } from 'styled-components';

import SineWave from './SineWave';

const animateIn = keyframes`
	from { transform: translateY(10vh); opacity: 0; }
	to   { transform: none; opacity: 1; }
`;

const shiftLeft = keyframes`
	from { left: -200%; }
	to   { left: 0; }
`;

const RoomBackgroundFillWrapper = styled.div`
	position: fixed;
	left: 0;
	top: 0;
	right: 0;
	bottom: 0;
	pointer-events: none;
	overflow: hidden;

	.sine-wave {
		position: absolute;
		left: -200%;
		top: 0;
		width: 400%;
		height: 100%;
		opacity: 0;

		&.wave-1 {
			animation: ${animateIn} 2s ease-out forwards, ${shiftLeft} 30s linear infinite;
		}

		&.wave-2 {
			animation: ${animateIn} 2s 750ms ease-out forwards, ${shiftLeft} 25s linear infinite;
		}

		&.wave-3 {
			animation: ${animateIn} 2s 1500ms ease-out forwards, ${shiftLeft} 20s linear infinite;
		}
	}
`;

const RoomBackgroundFill = (props: { inverted?: boolean }) => {
	const fillColor = props.inverted ? transparentize(0.975, '#343781') : transparentize(0.975, 'white');

	return (
		<RoomBackgroundFillWrapper>
			<SineWave className="wave-1" fill={fillColor} />
			<SineWave className="wave-2" fill={fillColor} />
			<SineWave className="wave-3" fill={fillColor} />
		</RoomBackgroundFillWrapper>
	);
}

export default RoomBackgroundFill;
