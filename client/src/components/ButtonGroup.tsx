import React from 'react';
import styled from 'styled-components';
import classNames from 'classnames';

const ButtonGroupWrapper = styled.div`
	display: block;
	margin: 1rem 0 0;

	button, a {
		margin-right: 1rem;
		margin-bottom: 1rem;
	}

	&.align-right {
		text-align: right;

		button {
			margin-left: 1rem;
			margin-right: 0;
		}
	}
`;

export type ButtonGroupProps = {
	align?: 'left' | 'right';
};
const ButtonGroup = (props: React.PropsWithChildren<ButtonGroupProps>) => {
	const buttonGroupClassNames = classNames('ui-button-group', {
		'align-right': props.align === 'right'
	});

	return (
		<ButtonGroupWrapper className={buttonGroupClassNames}>
			{props.children}
		</ButtonGroupWrapper>
	);
}

export default ButtonGroup;
