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


    static ping = () => {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        // Oscilador tipo seno o cuadrada puede funcionar
        const osc = audioCtx.createOscillator();
        osc.type = 'sine'; // o 'square' para un efecto más "duro"
        osc.frequency.value = 1000; // frecuencia alta para tono metálico

        // Ganancia para controlar la envolvente (volumen)
        const gain = audioCtx.createGain();

        // Conexión
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        // Envolvente rápida (sonido corto)
        const now = audioCtx.currentTime;
        gain.gain.setValueAtTime(1, now);               // volumen inicial
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2); // decay rápido en 200 ms

        // Iniciar y detener
        osc.start(now);
        osc.stop(now + 0.3); // corta después de 300 ms
    }
}