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

const playSound = (audio: HTMLAudioElement) => {
	const clone = audio.cloneNode() as HTMLAudioElement;
	clone.play();
}

const useSounds = () => {
	return {
		click: () => playSound(sounds.click),
		schwing: () => playSound(sounds.schwing),
		mouthPop: () => playSound(sounds.mouthPop),
		buzzerError: () => playSound(sounds.buzzerError),
		beepUp: () => playSound(sounds.beepUp),
		beepDown: () => playSound(sounds.beepDown),
		jump: () => playSound(sounds.jump)
	};
};

export default useSounds;
