const appconfig = {
	// Where should we store sqlite dbs?
	sqlite_root: "D:\\projects\\personal\\bzzt.ndfnz.io\\server\\runtime",

	// Once an admin leaves, how long should we wait before deleting the room?
	room_timeout: 60*60*5, // 5 minutes

	// Where are the static build files located?
	client_build_path: '../client/build'
}


export default appconfig;
