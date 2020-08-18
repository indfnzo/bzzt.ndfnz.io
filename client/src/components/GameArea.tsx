import React from 'react';
import styled from 'styled-components';
import { transparentize } from 'polished';

import { GameController } from '../hooks/useGameController';
import { AdminControls as ClassicAdminControls, PlayerControls as ClassicPlayerControls } from './ClassicGame';

const GameAreaWrapper = styled.div`
	width: 100%;
	height: 100%;
	padding: 2rem;
	background: ${transparentize(0.75, 'black')};
`;

const GameArea = (props: { game: GameController }) => {
	const { game } = props;
	const isAdmin = game.room.roomAdmin.toLocaleLowerCase() === game.currentUser.toLocaleLowerCase();
	
	switch (game.mode) {
		case 'classic':
			break;
	}

	let control: React.ReactElement | null = null;
	if (game.mode === 'classic') {
		if (isAdmin) control = <ClassicAdminControls game={game} />;
		else control = <ClassicPlayerControls game={game} />;
	}

	return (
		<GameAreaWrapper>
			{control}
		</GameAreaWrapper>
	);

};

export default GameArea;
