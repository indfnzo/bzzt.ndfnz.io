import React, { PropsWithChildren } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import classNames from 'classnames';
import { transparentize } from 'polished';
import styled from 'styled-components';

const StyledLink = styled(Link)`
	position: relative;
	display: inline-block;
	padding: 1rem 2rem;
	background: ${props => props.theme.primary.main};
	color: white;
	font-weight: 700;
	font-size: 1.2rem;
	font-family: inherit;
	text-transform: uppercase;
	text-decoration: none;
	border: none;
	border-radius: 5px;
	outline: none;
	cursor: pointer;

	&:focus::after {
		content: "";
		position: absolute;
		top: -4px;
		left: -4px;
		right: -4px;
		bottom: -4px;
		border: 1px solid ${props => props.theme.primary.main};
		border-radius: 8px;
		pointer-events: none;
	}

	&.secondary {
		background: ${props => transparentize(0.1, props.theme.primary.main)};
		color: ${props => props.theme.primary.main};
	}

	&.disabled {
		background: ${props => transparentize(0.5, props.theme.primary.main)};
		cursor: not-allowed;
	}

	&.inverted {
		background: white;
		color: ${props => props.theme.primary.main};

		&.secondary {
			background: ${transparentize(0.9, 'white')};
			color: white;
		}

		&.disabled {
			background: ${transparentize(0.75, 'white')};
		}

		&:focus::after {
			border-color: white;
		}
	}
`;

export type ButtonLinkProps = {
	inverted?: boolean;
	disabled?: boolean;
	muted?: boolean;
	color?: 'primary' | 'secondary';
	onClick?: (evt?: React.MouseEvent<HTMLAnchorElement>) => void;
};

const ButtonLink = (props: PropsWithChildren<ButtonLinkProps & LinkProps<unknown>>) => {
	const { children, inverted, disabled, muted, color, to, ...linkProps } = props;

	const buttonClassNames = classNames('ui-button ui-button-link', {
		'inverted': inverted,
		'muted': muted,
		'disabled': disabled,
		'secondary': props.color === 'secondary'
	});

	return (
		<StyledLink
			to={disabled ? '#' : to}
			className={buttonClassNames}
			{...linkProps}>{props.children}</StyledLink>
	);
}

export default ButtonLink;
