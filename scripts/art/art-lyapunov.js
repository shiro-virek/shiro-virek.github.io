{
    const globals = {
        random: null,
        initialClickCx: 0,
        initialClickCy: 0,
    };

    const config = {
        randomize: true,
        mode: 1,
        pow: 2,
        minValue: -2,
        maxValue: 2,
        scale: 0.005,
        offsetX: 0,
        offsetY: 0,
        hue: 10,
        pattern: "ABAB",
        steps: 10,
        discard: 100,
        aRange: [2.5, 4.0],
        bRange: [2.5, 4.0],
        drawFunctions: [drawPaletteColor1, drawPaletteColor2, drawPaletteGrayscale1, drawPaletteGrayscale2, drawPaletteHue1, drawPaletteHue2],
    };

    function drawPaletteColor1(value, data, x, y) {
        newValue = Numbers.scale(value, config.minValue, config.maxValue, 0, 360);
        const { r: red, g: green, b: blue } = Color.hslToRgb(newValue, 100, 50);
        Pixels.setPixelBatch(ctx, data, x, y, red, green, blue);
    }

    function drawPaletteHue1(value, data, x, y) {
        newValue = Numbers.scale(value, config.minValue, config.maxValue, 0, 50);
        const { r: red, g: green, b: blue } = Color.hslToRgb(config.hue, 100, newValue);
        Pixels.setPixelBatch(ctx, data, x, y, red, green, blue);
    }

    function drawPaletteGrayscale1(value, data, x, y) {
        newValue = Numbers.scale(value, config.minValue, config.maxValue, 0, 255);
        Pixels.setPixelBatch(ctx, data, x, y, newValue, newValue, newValue);
    }

    function drawPaletteColor2(value, data, x, y) {
        newValue = Numbers.scale(value, config.minValue, config.maxValue, 360, 0);
        const { r: red, g: green, b: blue } = Color.hslToRgb(newValue, 100, 50);
        Pixels.setPixelBatch(ctx, data, x, y, red, green, blue);
    }

    function drawPaletteHue2(value, data, x, y) {
        newValue = Numbers.scale(value, config.minValue, config.maxValue, 50, 0);
        const { r: red, g: green, b: blue } = Color.hslToRgb(config.hue, 100, newValue);
        Pixels.setPixelBatch(ctx, data, x, y, red, green, blue);
    }

    function drawPaletteGrayscale2(value, data, x, y) {
        newValue = Numbers.scale(value, config.minValue, config.maxValue, 255, 0);
        Pixels.setPixelBatch(ctx, data, x, y, newValue, newValue, newValue);
    }

    let init = () => {
        globals.random = Objects.getRandomObject();
        if (config.randomize) randomize();
        initCanvas();
        addEvents();
        config.offsetX = -width * config.scale / 2;
        config.offsetY = -height * config.scale / 2;
        window.requestAnimationFrame(loop);
    }

    let addEvents = () => {
        canvas.addEventListener('mousedown', function (e) {
            globals.initialClickCx = e.offsetX * config.scale + config.offsetX;
            globals.initialClickCy = e.offsetY * config.scale + config.offsetY;
        });

        canvas.addEventListener('touchstart', function (e) {
            globals.initialClickCx = e.changedTouches[0].pageX * config.scale + config.offsetX;
            globals.initialClickCy = e.changedTouches[0].pageY * config.scale + config.offsetY;
        });
    }

    let randomize = () => {
        config.drawFunctionIndex = globals.random.nextInt(0, config.drawFunctions.length - 1);
        config.pow = globals.random.nextInt(2, 5);
        config.cr = globals.random.nextRange(-1, 1);
        config.ci = globals.random.nextRange(-1, 1);
        config.hue = globals.random.nextInt(0, 360);
        config.pattern = getPattern();
        config.scale = 20;
        config.mode = globals.random.nextBool()
    }

    let computeLyapunov = (A, B) => {
        let x = 0.5;
        let sum = 0;
        let N = 0;

        const sequence = config.pattern.split('').map(ch => ch === 'A' ? A : B);

        for (let i = 0; i < config.discard; i++) {
            let r = sequence[i % sequence.length];
            x = r * x * (1 - x);
        }

        for (let i = 0; i < config.steps; i++) {
            let r = sequence[i % sequence.length];
            x = r * x * (1 - x);
            let derivative = Math.abs(r * (1 - 2 * x));
            if (derivative < 1e-8) derivative = 1e-8;
            sum += Math.log(derivative);
            N++;
        }

        return sum / N;
    }

    let getPattern = () => {
        let letters = globals.random.nextInt(1, 10);
        let pattern = "";
        for(let i=0; i < letters; i++){
            pattern += globals.random.nextBool() ? "A" : "B";
        }
        return pattern;
    }

    let drawLyapunov = () => {
        const imgData = ctx.createImageData(width, height);
        const data = imgData.data;
        const drawFunction = config.drawFunctions[config.drawFunctionIndex];

        for (let py = 0; py < height; py++) {
            let B = config.bRange[0] + (py / height) * (config.bRange[1] - config.bRange[0]);

            for (let px = 0; px < width; px++) {
                let A = config.aRange[0] + (px / width) * (config.aRange[1] - config.aRange[0]);

                let lambda = computeLyapunov(A, B);

                const idx = 4 * (py * width + px);
                    
                drawFunction(lambda, data, px, py);
            }
        }

        ctx.putImageData(imgData, 0, 0);
    }

    window.draw = () => {
        drawBackground(ctx, canvas);
        drawLyapunov();
    }

    window.trackMouse = (x, y) => {
        if (clicking) {
            if (config.mode) {
                let delta = lastPosY - y;
                if (delta !== 0) {
                    const zoomFactor = 1 + (delta > 0 ? -0.1 : 0.1);
                    config.scale = config.scale * zoomFactor;

                    config.offsetX = globals.initialClickCx - initialClickX * config.scale;
                    config.offsetY = globals.initialClickCy - initialClickY * config.scale;
                }
            } else {
                if (globals.random.nextBool()){
                    config.aRange = [Numbers.scale(x, 0, width, 1, 5), Numbers.scale(y, 0, height, 1, 5)];
                    config.bRange = [Numbers.scale(x, 0, width, 1, 5), Numbers.scale(y, 0, height, 1, 5)];
                }else{
                    config.aRange = [Numbers.scale(x, 0, width, 1, 5), Numbers.scale(y, 0, height, 1, 5)];
                    config.bRange = [Numbers.scale(y, 0, height, 1, 5), Numbers.scale(x, 0, width, 1, 5)];
                }
            }

            lastPosY = y;
        }
    }

    window.clearCanvas = () => {
        Sound.error();
    }

    window.magic = () => {
        Sound.error();
    }

    window.upload = () => {
        Sound.error();
    }

    init();
}
