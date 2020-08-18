import React, { useState } from 'react';
import classNames from 'classnames';
import { transparentize } from 'polished';
import styled from 'styled-components';

export const StyledLabel = styled.label`
	position: relative;
	display: block;
	margin: 1rem 0;

	input, textarea {
		display: block;
		width: 100%;
		padding: 0.75rem 2rem;
		margin: 0;
		font-size: 1.2rem;
		font-family: inherit;
		line-height: 1.5rem;
		color: black;
		background: none;
		border: 1px solid black;
		border-radius: 10rem;
		outline: none;

		&::placeholder {
			opacity: 0.5;
			color: black;
		}
	}

	textarea {
		resize: vertical;
		min-height: 7.5rem;
	}

	.input-label {
		padding: 0 2rem;
		margin: 0 0 0.75rem;
		font-size: 0.9rem;
		text-transform: uppercase;
		line-height: 1rem;
		font-weight: 700;
		color: black;
		border-radius: 3px;
	}

	.input-error {
		padding: 0 2rem;
		margin: 0.75rem 0 0;
		color: ${props => props.theme.red};
		font-weight: 700;
		font-size: 1rem;
	}

	&.error {
		input, textarea {
			box-shadow: 0 0 0 3px ${props => props.theme.red};
		}

		.input-label {
			color: ${props => props.theme.red} !important;
		}
	}

	&.focused {
		input, textarea {
			color: ${props => props.theme.primary.main};
			border-color: ${props => props.theme.primary.main};
		}

		.input-label {
			color: ${props => props.theme.primary.main};
		}
	}

	&.inverted {
		input, textarea {
			color: white;
			border-color: ${transparentize(0.5, 'white')};

			&::placeholder {
				opacity: 0.25;
				color: white;
			}
		}

		.input-label {
			color: ${transparentize(0.5, 'white')};
		}

		&.focused {
			input, textarea {
				border-color: white;
			}

			.input-label {
				color: white;
			}
		}
	}
`;

export type InputProps = {
	name: string;
	inverted?: boolean;
	label?: string;
	error?: string | null;
	onChange?: (evt: React.ChangeEvent<HTMLInputElement>) => void;
};
const Input = React.forwardRef<HTMLInputElement, InputProps & React.HTMLProps<HTMLInputElement>>((props, ref) => {
	const [focused, setFocused] = useState(false);
	const handleFocus = () => setFocused(true);
	const handleBlur = () => setFocused(false);

	const labelClassNames = classNames('ui-input', {
		inverted: props.inverted,
		error: props.error,
		focused
	});

	return (
		<StyledLabel className={labelClassNames}>
			{ props.label ? <div className="input-label">{props.label}</div> : null }
			<input
				ref={ref}
				type={props.type || 'text'}
				name={props.name}
				disabled={props.disabled}
				placeholder={props.placeholder}
				autoComplete={props.autoComplete}
				maxLength={props.maxLength}
				autoFocus={props.autoFocus}
				onChange={props.onChange}
				onFocus={handleFocus}
				onBlur={handleBlur} />
			{ props.error ? <div className="input-error">{props.error}</div> : null }
		</StyledLabel>
	);
});

export default Input;
