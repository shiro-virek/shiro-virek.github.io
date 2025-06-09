class Sound {
    static lastPlayed = 0;
    static minInterval = 10; 


    static AudioContext = (() => {
        let instance;
        
        function createInstance() {
            const object = new (window.AudioContext || window.webkitAudioContext)();
            return object;
        }
        
        return {
            getInstance() {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
            }
        };
    })();


    static whiteNoise = () => {
        const audioCtx = Sound.AudioContext.getInstance();

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


    static ping(freq = 1000, duration = 0.1, volume = 0.2) {
        const ctx = Sound.AudioContext.getInstance();

        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        const now = performance.now();
        if (now - Sound.lastPlayed < Sound.minInterval) return;

        Sound.lastPlayed = now;

        const audioNow = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.frequency.setValueAtTime(freq, audioNow);
        osc.type = 'square';

        gain.gain.setValueAtTime(volume, audioNow);
        gain.gain.exponentialRampToValueAtTime(0.001, audioNow + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(audioNow);
        osc.stop(audioNow + duration);

        osc.onended = () => {
            osc.disconnect();
            gain.disconnect();
        };
    }

}