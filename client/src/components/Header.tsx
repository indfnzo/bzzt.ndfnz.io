import React from 'react';
import styled from 'styled-components';
import classNames from 'classnames';
import { Link } from 'react-router-dom';

const StyledHeader = styled.header`
	display: flex;
	align-items: center;

	a {
		display: inline-block;
		padding: 2rem 0;
		margin-right: 1rem;
		color: ${props => props.theme.primary.main};
		font-size: 1.2rem;
		line-height: 2rem;
		font-weight: 800;
		text-decoration: none;

		&.logo {
			display: flex;
			align-items: center;

			svg {
				height: 2rem;

				path {
					fill: ${props => props.theme.primary.main};
				}
			}
		}

		&.room-link {
			color: ${props => props.theme.lightBlue};

			.room-code {
				color: ${props => props.theme.secondary.main};
			}
		}
	}

	&.inverted {
		a {
			color: white;

			&.logo svg path {
				fill: white;
			}

			&.room-link {
				color: rgba(255, 255, 255, 0.5);

				.room-code {
					color: ${props => props.theme.yellow};
				}
			}
		}
	}
`;

export type HeaderProps = {
	inverted?: boolean;
	roomCode?: string;
}

const Header = (props: React.PropsWithChildren<HeaderProps>) => {
	const { inverted, roomCode, children } = props;

	const roomLink = roomCode ? '/room/' + roomCode.toLocaleLowerCase() : null;
	const headerClassNames = classNames('ui-header', { inverted });

	return (
		<StyledHeader className={headerClassNames}>
			<Link className="logo" to="/">
				<svg width="101" height="40" viewBox="0 0 101 40" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path fillRule="evenodd" clipRule="evenodd" d="M31 0V8H44.3333L31 24V32H47V40H71V32H57.6667L71 16V8H55V0H31ZM41.6667 24L48.3333 16H60.3333L53.6667 24H41.6667Z" fill="white"/>
					<path fillRule="evenodd" clipRule="evenodd" d="M17.8462 36H0V4H17.1955C23.2837 4 27.5128 7.40029 27.5128 12.0582C27.5128 15.179 25.8862 17.8806 23.0978 19.2314C26.8157 20.8151 29 23.8428 29 27.3828C29 32.5065 24.3526 36 17.8462 36ZM9 11.5924H15.0112C16.8702 11.5924 18.2179 12.6172 18.2179 14.0146C18.2179 15.4119 16.8702 16.4367 15.0112 16.4367H9V11.5924ZM9 23.2838H16.359C18.3109 23.2838 19.7051 24.3552 19.7051 25.8457C19.7051 27.3362 18.3109 28.4076 16.359 28.4076H9V23.2838Z" fill="white"/>
					<path d="M73 4V12H83V36H91V12H101V4H73Z" fill="white"/>
				</svg>
			</Link>
			{ roomLink ? <Link className="room-link" to={roomLink}>【<span className="room-code">{roomCode}</span>】</Link> : null }
			{children}
		</StyledHeader>
	);
}

export default Header;
