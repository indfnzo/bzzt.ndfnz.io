const sounds = {
	click: new Audio('/sounds/click.wav'),
	schwing: new Audio('/sounds/schwing.wav'),
	mouthPop: new Audio('/sounds/mouth_pop.ogg'),
	buzzerError: new Audio('/sounds/buzzer_error.wav'),
	beepUp: new Audio('/sounds/beep_up.wav'),
	beepDown: new Audio('/sounds/beep_down.wav'),
	jump: new Audio('/sounds/8bit_jump.wav'),
	countdownReady: new Audio('/sounds/8bit_countdown_ready.wav'),
	countdownGo: new Audio('/sounds/8bit_countdown_go.wav'),
	retroAccomplished: new Audio('/sounds/retro_accomplished.wav'),
	successArpeggio: new Audio('/sounds/success_arpeggio.flac'),
	tick: new Audio('/sounds/tick.wav'),
	pauseStart: new Audio('/sounds/pause_start.wav')
};

const loops = {
	music: new Audio('/sounds/music.mp3')
}

// load all the sounds once
for (const sound of Object.values(sounds)) {
	sound.load();
}

const playSound = async (audio: HTMLAudioElement, volume: number) => {
	const clone = audio.cloneNode() as HTMLAudioElement;
	clone.volume = (Math.exp(volume)-1)/(Math.E-1); // scale volume exponentially to compensate for logarithmic human ear perception

	// ignore playback errors (when user hasn't interacted with the page yet)
	try {
		await clone.play();
	} catch (_) {}
}

const _loops: { [key: string]: HTMLAudioElement | null } = {};
const setupLoop = (key: string, audio: HTMLAudioElement) => {
	const load = () => {
		if (!(key in _loops)) {
			audio.load();
			_loops[key] = audio;
		}
	}

	const stop = () => {
		const node = key in _loops ? _loops[key] : null;
		if (node) {
			node.pause();
			node.currentTime = 0;
		}
	}

	const start = async (volume = 1, loop = true) => {
		load();
		const node = key in _loops ? _loops[key] : null;
		if (!node) return setTimeout(start, 50);

		node.volume = volume;
		node.loop = loop;
		try {
			await node.play();
		} catch (_) {
			setTimeout(() => start(volume, loop), 250);
		}
	}

	return { load, start, stop };
}

const useSounds = () => {
	return {
		click: (volume = 1.0) => playSound(sounds.click, volume),
		schwing: (volume = 1.0) => playSound(sounds.schwing, volume),
		mouthPop: (volume = 1.0) => playSound(sounds.mouthPop, volume),
		buzzerError: (volume = 1.0) => playSound(sounds.buzzerError, volume),
		beepUp: (volume = 1.0) => playSound(sounds.beepUp, volume),
		beepDown: (volume = 1.0) => playSound(sounds.beepDown, volume),
		jump: (volume = 1.0) => playSound(sounds.jump, volume),
		countdownReady: (volume = 1.0) => playSound(sounds.countdownReady, volume),
		countdownGo: (volume = 1.0) => playSound(sounds.countdownGo, volume),
		retroAccomplished: (volume = 1.0) => playSound(sounds.retroAccomplished, volume),
		successArpeggio: (volume = 1.0) => playSound(sounds.successArpeggio, volume),
		tick: (volume = 1.0) => playSound(sounds.tick, volume),
		pauseStart: (volume = 1.0) => playSound(sounds.pauseStart, volume),

		loops: {
			music: setupLoop('music', loops.music)
		}
	};
};

export default useSounds;
