class Sound {
    static whiteNoise = () => {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        const bufferSize = 2 * audioCtx.sampleRate;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = audioCtx.createBufferSource();
        whiteNoise.buffer = buffer;
        whiteNoise.loop = true;

        whiteNoise.connect(audioCtx.destination);
        whiteNoise.start();
    }


    static ping = (frequency = 1000) => {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        const osc = audioCtx.createOscillator();
        osc.type = 'sine'; 
        osc.frequency.value = frequency; 

        const gain = audioCtx.createGain();

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        const now = audioCtx.currentTime;
        gain.gain.setValueAtTime(1, now);              
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2); 

        osc.start(now);
        osc.stop(now + 0.3); 
    }
}