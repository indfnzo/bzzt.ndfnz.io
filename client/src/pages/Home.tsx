import React from 'react';
import styled from 'styled-components';

import { Header, ButtonGroup, ButtonLink } from '../components';

const HomeWrapper = styled.main`
	section.masthead {
		position: relative;
		padding-bottom: calc((41.6777vw * 3) - 4rem);
		background: ${props => props.theme.primary.main};
		color: white;
		z-index: 1;

		h1 {
			font-size: 3rem;
			font-weight: 900;
		}

		.divider {
			display: flex;
			align-items: flex-end;
			justify-content: flex-end;
			position: absolute;
			bottom: -1rem;
			right: 0;
			z-index: -1;

			img {
				width: 300%;
			}
		}

		@media screen and (min-width: 480px) {
			padding-bottom: calc((41.6777vw * 2) - 4rem);

			.divider img {
				width: 200%;
			}
		}

		@media screen and (min-width: 960px) {
			padding-bottom: calc(41.6777vw - 8rem);

			.divider img {
				width: 100%;
			}
		}
	}

	section.details {
		padding-top: 1rem;
	}
`;

const Home = () => {
	return (
		<HomeWrapper className="home">
			<section className="masthead">
				<div className="container">
					<Header inverted />
					<h1>
						Need a buzzer?
						<br/>
						BZZT it!
					</h1>
					<ButtonGroup>
						<ButtonLink inverted to="/room/new">Create Room</ButtonLink>
						<ButtonLink inverted color="secondary" to="/room/join">Join Room</ButtonLink>
					</ButtonGroup>
					<div className="divider">
						<img src="/images/home-masthead-divider.svg" alt=""/>
					</div>
				</div>
			</section>
			<section className="details">
				<div className="container">
					hi
				</div>
			</section>
		</HomeWrapper>
	);
}

export default Home;
