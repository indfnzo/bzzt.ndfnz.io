import React from 'react';
import styled from 'styled-components';
import { transparentize } from 'polished';

import { GameController } from '../hooks/useGameController';
import { AdminControls as ClassicAdminControls, PlayerControls as ClassicPlayerControls } from './ClassicGame';
import { AdminControls as BuzzwireAdminControls, PlayerControls as BuzzwirePlayerControls } from './BuzzwireGame';

const GameAreaWrapper = styled.div`
	position: relative;
	width: 100%;
	height: 100%;
	padding: 2rem;
	background: ${transparentize(0.75, 'black')};
	border-radius: 10px;

	&.wrapper-classic {
		overflow: hidden;
	}

	&.wrapper-buzzwire {
		padding: 0;
	}
`;

const GameArea = (props: { game: GameController }) => {
	const { game } = props;
	const isAdmin = game.room.roomAdmin.toLocaleLowerCase() === game.currentUser.toLocaleLowerCase();

	let control: React.ReactElement | null = null;
	if (game.type === 'classic') {
		if (isAdmin) control = <ClassicAdminControls game={game} />;
		else control = <ClassicPlayerControls game={game} />;
	} else if (game.type === 'buzzwire') {
		if (isAdmin) control = <BuzzwireAdminControls game={game} />;
		else control = <BuzzwirePlayerControls game={game} />;
	}

	return (
		<GameAreaWrapper className={`wrapper-${game.type}`}>
			{control}
		</GameAreaWrapper>
	);

};

export default GameArea;
