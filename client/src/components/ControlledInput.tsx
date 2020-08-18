import React, { useState } from 'react';
import classNames from 'classnames';

import { InputProps, StyledLabel } from './Input';

export type ControlledInputProps = {
	transform?: (value: string) => string;
}
const ControlledInput = React.forwardRef<HTMLInputElement, InputProps & ControlledInputProps & React.HTMLProps<HTMLInputElement>>((props, ref) => {
	const [focused, setFocused] = useState(false);
	const handleFocus = () => setFocused(true);
	const handleBlur = () => setFocused(false);

	const [value, setValue] = useState('');
	const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
		if (props.transform) evt.target.value = props.transform(evt.target.value);
		setValue(evt.target.value);
		if (props.onChange) props.onChange(evt);
	};

	const labelClassNames = classNames('ui-input', { inverted: props.inverted, focused });

	return (
		<StyledLabel className={labelClassNames}>
			{ props.label ? <div className="input-label">{props.label}</div> : null }
			<input
				value={value}
				onChange={handleChange}
				ref={ref}
				type={props.type || 'text'}
				name={props.name}
				placeholder={props.placeholder}
				autoComplete={props.autoComplete}
				autoFocus={props.autoFocus}
				onFocus={handleFocus}
				onBlur={handleBlur} />
		</StyledLabel>
	);
});

export default ControlledInput;
