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


    static whiteNoise = (random, volume = 0.05) => {
        const audioCtx = Sound.AudioContext.getInstance();

        const bufferSize = 2 * audioCtx.sampleRate;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            output[i] = random.next() * 2 - 1;
        }

        const whiteNoise = audioCtx.createBufferSource();
        whiteNoise.buffer = buffer;
        whiteNoise.loop = true;

        const gainNode = audioCtx.createGain();
        gainNode.gain.value = volume; 

        whiteNoise.connect(gainNode);
        gainNode.connect(audioCtx.destination);

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

    static error = () =>  {
        const ctx = Sound.AudioContext.getInstance();

        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        const oscillator = ctx.createOscillator();
        oscillator.type = 'square'; 
        oscillator.frequency.setValueAtTime(880, ctx.currentTime); 

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.05, ctx.currentTime); 

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.12);

        oscillator.onended = () => {
            oscillator.disconnect();
            gainNode.disconnect();
        };
    }

    static tada = () =>  {
        const audioCtx = Sound.AudioContext.getInstance();

        const oscillator = audioCtx.createOscillator();
        oscillator.type = 'triangle';

        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);

        oscillator.frequency.linearRampToValueAtTime(880, audioCtx.currentTime + 0.15);

        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

        oscillator.start(audioCtx.currentTime);

        oscillator.stop(audioCtx.currentTime + 0.5);
    }

    static stopAllSounds = () => {
        let ctx = Sound.AudioContext.getInstance();
        ctx.close();
    }

}