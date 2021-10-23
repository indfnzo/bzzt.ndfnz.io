import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { RoomBackgroundFill, Loader, GlobalError } from '../components';
import { useRoom } from '../hooks';
import RoomAuth from './RoomAuth';

export const RoomWrapper = styled.main`
	background: ${props => props.theme.primary.main};
	color: white;

	> .container,
	> .stacking-container {
		position: relative;
		z-index: 1;
	}
`;

const RoomLanding = () => {
	const urlParams = useParams<{ roomCode: string }>();
	const roomCode = urlParams.roomCode.toUpperCase();

	const [room, loading, error] = useRoom(roomCode);

	if (!room) {
		return (
			<RoomWrapper className="room">
				<div className="container">
					<Loader loading={loading} />
					{ error ?
						<GlobalError title={error.title} subtitle={error.subtitle} />
					: null }
				</div>
				<RoomBackgroundFill />
			</RoomWrapper>
		);
	} else {
		return <RoomAuth room={room} />;
	}
}

export default RoomLanding;
