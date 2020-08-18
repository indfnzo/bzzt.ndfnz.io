import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';

const fadeIn = keyframes`
	from { opacity: 0; }
	to   { opacity: 1; }
`;

const LoaderWrapper = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	color: white;
	animation: ${fadeIn} 500ms 500ms ease forwards;
	opacity: 0;
	z-index: 10;

	&.dim {
		background: rgba(0, 0, 0, 0.5);
	}

	.spinner {
		position: absolute;
		top: calc(50% - 1rem);
		left: calc(50% - 1rem);

		svg {
			display: block;
			width: 2rem !important;
			height: 2rem !important;
		}
	}

	.message {
		position: absolute;
		top: calc(50% + 2rem);
		left: 50%;
		font-weight: 700;
		text-transform: uppercase;
		white-space: nowrap;
		transform: translateX(-50%);
		opacity: 0.5;
	}
`;

export type LoaderProps = {
	loading?: boolean;
	dim?: boolean;
	message?: string;
}

const Loader = (props: LoaderProps) => {
	if (props.loading != null && !props.loading) return null;

	const loaderClassNames = classNames('ui-loader', { dim: props.dim });

	return (
		<LoaderWrapper className={loaderClassNames}>
			<div className="spinner">
				<FontAwesomeIcon icon={faCircleNotch} spin />
			</div>
			{ props.message ?
				<div className="message">{props.message}</div>
			: null }
		</LoaderWrapper>
	);
};

export default Loader;
