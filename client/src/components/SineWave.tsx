import classNames from 'classnames';
import React from 'react';

const SineWave = (props: { className?: string, fill: string }) => {
	const { className, fill } = props;

	return (
		<svg className={classNames('sine-wave', className)} width="400" height="128" viewBox="0 0 400 128" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M50 64C34.105 39 18.21 14 0 14V128H400V14C381.79 14 365.895 39 350 64C334.105 89 318.21 114 300 114C281.79 114 265.895 89 250 64C234.105 39 218.21 14 200 14C181.79 14 165.895 39 150 64C134.105 89 118.21 114 100 114C81.79 114 65.895 89 50 64Z" fill={fill} />
		</svg>
	);
}

export default SineWave;
