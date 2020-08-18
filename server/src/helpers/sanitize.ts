/**
 * Normalizes a string (name) to a not-so-weird format.
 */
const sanitize = (text: any, length?: number): string => {
	if (text == null) return '';
	if (typeof text !== 'string' && typeof text.toString === 'function') text = text.toString();

	const str = (text as string).trim().replace(/\s+/g, ' ');
	if (!length) return str;

	// we split the string with Array.from so we can distinguish emojis
	const chars = Array.from(str);
	return chars.slice(0, length).join('');
};

export default sanitize;
