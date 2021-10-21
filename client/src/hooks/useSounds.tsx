const sounds = {
	click: new Audio('/sounds/click.wav'),
	schwing: new Audio('/sounds/schwing.wav'),
	mouthPop: new Audio('/sounds/mouth_pop.ogg'),
	buzzerError: new Audio('/sounds/buzzer_error.wav'),
	beepUp: new Audio('/sounds/beep_up.wav'),
	beepDown: new Audio('/sounds/beep_down.wav'),
	jump: new Audio('/sounds/8bit_jump.wav')
};

// load all the sounds once
for (const sound of Object.values(sounds)) {
	sound.load();
}

const playSound = (audio: HTMLAudioElement, volume: number) => {
	console.log('playSound', volume);
	const clone = audio.cloneNode() as HTMLAudioElement;
	clone.volume = volume;
	clone.play();
}

const useSounds = () => {
	return {
		click: (volume = 1.0) => playSound(sounds.click, volume),
		schwing: (volume = 1.0) => playSound(sounds.schwing, volume),
		mouthPop: (volume = 1.0) => playSound(sounds.mouthPop, volume),
		buzzerError: (volume = 1.0) => playSound(sounds.buzzerError, volume),
		beepUp: (volume = 1.0) => playSound(sounds.beepUp, volume),
		beepDown: (volume = 1.0) => playSound(sounds.beepDown, volume),
		jump: (volume = 1.0) => playSound(sounds.jump, volume)
	};
};

export default useSounds;
