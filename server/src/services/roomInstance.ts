import bcrypt from 'bcrypt';

import RoomService from './roomService';
import { ClassicGameInstance } from '../socket/middlewares/setupClassicGame';
import { BuzzwireGameInstance } from '../socket/middlewares/setupBuzzwireGame';

const INSTANCE_POOL: { [roomCode: string]: RoomInstance } = {};

export default class RoomInstance {
	id: number;
	roomCode: string;
	roomName: string;
	roomAdmin: string;
	dateCreatedUtc: string;

	participants: { [key: string]: User } = {};
	participantsHistory: string[] = [];
	roomExpirationTimer?: NodeJS.Timeout;

	gameType: GameType;
	classic: ClassicGameInstance;
	buzzwire: BuzzwireGameInstance;

	getPassword: () => string;

	get hasPassword() {
		const password = this.getPassword();
		return !!(password && password.length > 0);
	}

	static getInstance = (room: Room) => {
		if (!(room.roomCode in INSTANCE_POOL)) {
			const instance = new RoomInstance(room);
			INSTANCE_POOL[room.roomCode] = instance;
		}
		const instance = INSTANCE_POOL[room.roomCode];
		instance.updateValues(room);
		return instance;
	}

	static getInstances = (rooms: Room[]) => {
		return rooms.map(r => RoomInstance.getInstance(r));
	}

	constructor(room: Room) {
		// store hashed password as a constructor variable (so it's not accessible outside)
		this.getPassword = () => room.password;

		this.id = room.id;
		this.roomCode = room.roomCode;
		this.roomName = room.roomName;
		this.roomAdmin = room.roomAdmin;
		this.dateCreatedUtc = room.dateCreatedUtc;

		this.gameType = room.gameType;
		this.classic = new ClassicGameInstance();
		this.buzzwire = new BuzzwireGameInstance();
	}

	updateValues = (room: Room) => {
		this.getPassword = () => room.password;
		this.id = room.id;
		this.roomCode = room.roomCode;
		this.roomName = room.roomName;
		this.roomAdmin = room.roomAdmin;
		this.dateCreatedUtc = room.dateCreatedUtc;

		this.gameType = room.gameType;
	}

	validateUsername = (username: string) => {
		if (!username) return 'USERNAME_EMPTY';
		if (Object.values(this.participants).find(u => u.name.trim().toLocaleLowerCase() === username.trim().toLocaleLowerCase())) return 'USERNAME_TAKEN';
		return null;
	}

	authenticate = (password: string) => {
		const hashedPassword = this.getPassword();
		if (!hashedPassword) return null;
		if (!password) return 'PASSWORD_EMPTY';
		if (bcrypt.compareSync(password, hashedPassword)) return null;
		return 'PASSWORD_INVALID';
	}

	join = (socketId: string, name: string) => {
		// Note: This method unconditionally joins a user into the list.
		// Make sure that user conflict scenarios have been synchronously validated before using this.
		const user: User = { socketId, name };
		this.participants[socketId] = user;
		if (this.participantsHistory.indexOf(name.toLocaleLowerCase()) === -1) {
			this.participantsHistory.push(name.toLocaleLowerCase());
		}

		// reset the room expiration timeout
		if (this.isAdmin(user) && this.roomExpirationTimer) {
			clearTimeout(this.roomExpirationTimer);
			delete this.roomExpirationTimer;
		}

		this.notifyParticipantsChanged();
		return user;
	}

	getUser = (socketId: string) => {
		if (socketId in this.participants) return this.participants[socketId];
		else return null;
	}

	isAdmin = (user: User) => {
		return this.roomAdmin.toLocaleLowerCase() == user.name.toLocaleLowerCase();
	}

	leave = (socketId: string) => {
		if (socketId in this.participants) {
			// disband the room in 1 minute if the admin leaves
			if (this.isAdmin(this.participants[socketId])) {
				this.roomExpirationTimer = setTimeout(this.disband, 60 * 1000);
			}

			delete this.participants[socketId];
		}

		this.notifyParticipantsChanged();
	}

	disband = () => {
		const roomService = RoomService.getInstance('rooms.db');
		roomService.deleteRoom(this.roomCode);
	}

	getParticipants = () => {
		const participants = Object.values(this.participants);
		return participants.sort(
			(x, y) =>
				this.participantsHistory.indexOf(x.name.toLocaleLowerCase()) -
				this.participantsHistory.indexOf(y.name.toLocaleLowerCase())
		);
	}

	notifyParticipantsChanged = () => {
		const roomService = RoomService.getInstance('rooms.db');
		const io = roomService.io;
		if (!io) return;

		for (const socket of Object.values(io.sockets || {})) {
			if (Object.keys(socket.rooms).includes(this.roomCode)) {
				io.to(this.roomCode).emit('room:participants:changed', this.getParticipants());
			}
		}
	}
}
