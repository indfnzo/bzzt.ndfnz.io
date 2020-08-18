import React from 'react';
import styled from 'styled-components';
import classNames from 'classnames';
import { Link } from 'react-router-dom';

const StyledHeader = styled.header`
	display: flex;

	a {
		display: inline-block;
		padding: 2rem 0;
		color: ${props => props.theme.primary.main};
		font-size: 1.2rem;
		font-weight: 800;
		text-decoration: none;
	}

	&.inverted {
		a {
			color: white;
		}
	}
`;

export type HeaderProps = {
	inverted?: boolean;
}

const Header = (props: React.PropsWithChildren<HeaderProps>) => {
	const headerClassNames = classNames('ui-header', { inverted: props.inverted });

	return (
		<StyledHeader className={headerClassNames}>
			<Link to="/">BZZT</Link>
			{props.children}
		</StyledHeader>
	);
}

export default Header;
