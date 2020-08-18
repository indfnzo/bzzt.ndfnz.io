const getErrorDetails = (errorCode: string) => {
	if (!errorCode) return null;

	switch (errorCode) {
		case 'ROOM_NOT_FOUND':
			return {
				title: 'Room Not Found',
				subtitle: 'This room doesn\'t exist or has already expired.'
			};

		default:
			return {
				title: 'Woops!',
				subtitle: `An unknown error has occurred: ${errorCode}`
			};
	}
}

export default getErrorDetails;
