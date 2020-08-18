import path from 'path';
import bcrypt from 'bcrypt';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import moment from 'moment';

import config from '../appconfig';

import RoomInstance from './roomInstance';

const SERVICE_POOL: { [dbName: string]: RoomService } = {};

export default class RoomService {
	static getInstance = (dbName: string) => {
		if (!(dbName in SERVICE_POOL)) {
			const instance = new RoomService(dbName);
			SERVICE_POOL[dbName] = instance;
		}
		return SERVICE_POOL[dbName];
	}

	private dbPath: string;
	private constructor(dbName: string) {
		this.dbPath = path.resolve(config.sqlite_root, dbName);
	}

	private open = () => {
		return open({
			filename: this.dbPath,
			driver: sqlite3.Database
		});
	}

	io?: SocketIO.Server;
	register = (io: SocketIO.Server) => {
		this.io = io;
	}

	reset = async () => {
		const db = await this.open();
		await db.exec(`
			DROP TABLE IF EXISTS rooms;
			CREATE TABLE rooms (
				id INTEGER PRIMARY KEY,
				roomCode TEXT,
				password TEXT,
				roomName TEXT,
				roomAdmin TEXT,
				dateCreatedUtc TEXT
			);
		`);
		await db.close();
	}

	getAllRooms = async () => {
		const db = await this.open();
		const rooms = await db.all<Room[]>('SELECT * FROM rooms');
		await db.close();
		if (!rooms) return [];
		return RoomInstance.getInstances(rooms);
	}

	getRoom = async (roomCode: string) => {
		const db = await this.open();
		const room = await db.get<Room>('SELECT * FROM rooms WHERE roomCode = (?)', roomCode);
		await db.close();
		if (!room) return null;
		return RoomInstance.getInstance(room);
	}

	private generateRandomCode = (length: number) => {
		let out = '';
		const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		for (let i = 0; i < length; i++) {
		out += charset.charAt(Math.floor(Math.random() * charset.length));
		}
		return out;
	}

	private generateRoomCode = async () => {
		const db = await this.open();
		let attempts = 0;
		while(true) {
			const length = attempts > 100 ? 7 : attempts > 10 ? 6 : 5;
			const roomCode = this.generateRandomCode(length);
			const conflicts = await db.get<{ count: number }>('SELECT COUNT(*) AS count FROM rooms WHERE roomCode = (?)', roomCode);
			if (!conflicts || conflicts.count === 0) {
				await db.close();
				return roomCode;
			}
			attempts++;
		}
	}

	createRoom = async (roomName: string, password: string, roomAdmin: string) => {
		var roomCode = await this.generateRoomCode();
		const hashedPassword = password ? bcrypt.hashSync(password, 10) : null;
		const dateCreatedUtc = moment.utc().toISOString();

		const db = await this.open();
		const result = await db.run('INSERT INTO rooms (roomCode, roomName, password, roomAdmin, dateCreatedUtc) VALUES (?, ?, ?, ?, ?)', roomCode, roomName, hashedPassword, roomAdmin, dateCreatedUtc);

		const room = await db.get<Room>('SELECT * FROM rooms WHERE id = (?)', result.lastID);
		await db.close();
		if (!room) return null;
		return new RoomInstance(room);
	}

	deleteRoom = async (roomCode: string) => {
		// delete room
		const db = await this.open();
		await db.run('DELETE FROM rooms WHERE roomCode = (?)', roomCode);
		await db.close();

		// disconnect all users
		if (!this.io) return;
		for (const socketId of Object.keys(this.io.sockets.sockets || {})) {
			const socket = this.io.sockets.sockets[socketId];
			if (Object.keys(socket.rooms).includes(roomCode)) {
				socket.disconnect(true);
			}
		}
	}
}
