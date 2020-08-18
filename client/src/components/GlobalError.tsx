import React from 'react';
import styled from 'styled-components';
import { transparentize } from 'polished';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const GlobalErrorWrapper = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: var(--innerHeight, 100vh);

	.error-content {
		padding: 2rem;
		max-width: 30rem;
		background: white;
		color: ${props => props.theme.red};
		text-align: center;
		border-radius: 10px;

		.icon {
			margin-bottom: 2rem;
			font-size: 2rem;
		}

		.title {
			margin: 2rem 0 0.5rem;
			font-weight: 900;
		}

		.subtitle {
			color: ${props => transparentize(0.25, props.theme.red)};
			font-weight: 700;
		}
	}
`;

export type GlobalErrorProps = {
	image?: React.ReactElement;
	title?: string;
	subtitle?: string;
}

const GlobalError = (props: GlobalErrorProps) => {
	return (
		<GlobalErrorWrapper>
			<div className="error-content">
				<div className="icon">
					<FontAwesomeIcon icon={faExclamationTriangle} />
				</div>
				{ props.title ?
					<h1 className="title">{props.title}</h1>
				: null }
				{ props.subtitle ?
					<div className="subtitle">{props.subtitle}</div>
				: null }
			</div>
		</GlobalErrorWrapper>
	);
};

export default GlobalError;
