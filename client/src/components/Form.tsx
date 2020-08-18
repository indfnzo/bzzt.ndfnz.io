import React from 'react';
import styled from 'styled-components';

const StyledForm = styled.form`
	display: block;
`;

const Form = (props: React.PropsWithChildren<React.HTMLProps<HTMLFormElement>>) => {
	const { ref, as, ...formProps } = props;
	return <StyledForm className="ui-form" {...formProps}>{props.children}</StyledForm>;
}

export default Form;
