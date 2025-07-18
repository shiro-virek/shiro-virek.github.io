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
        maxIterations: 500000,
        scale: 0.005,
        cr: -0.7,
        ci: 0.27,
        offsetX: 0,
        offsetY: 0,
        hue: 10,
        drawFunctionIndex: 1,
        drawFunctions: [drawPaletteColor1, drawPaletteColor2, drawPaletteGrayscale1, drawPaletteGrayscale2, drawPaletteHue1, drawPaletteHue2],
    };    

    function drawPaletteColor1(value, data, x, y){
        newValue = Numbers.scale(value, 0, config.maxIterations, 0, 360);
        const { r: red, g: green, b: blue } = Color.hslToRgb(newValue, 100, 50);
        Pixels.setPixelBatch(ctx, data, x, y, red, green, blue);
    }

    function drawPaletteHue1(value, data, x, y){
        newValue = Numbers.scale(value, 0, config.maxIterations, 0, 50);
        const { r: red, g: green, b: blue } = Color.hslToRgb(config.hue, 100, newValue);
        Pixels.setPixelBatch(ctx, data, x, y, red, green, blue);
    }

    function drawPaletteGrayscale1(value, data, x, y){
        newValue = Numbers.scale(value, 0, config.maxIterations, 0, 255);
        Pixels.setPixelBatch(ctx, data, x, y, newValue, newValue, newValue);       
    }

    function drawPaletteColor2(value, data, x, y){
        newValue = Numbers.scale(value, 0, config.maxIterations, 360, 0);
        const { r: red, g: green, b: blue } = Color.hslToRgb(newValue, 100, 50);
        Pixels.setPixelBatch(ctx, data, x, y, red, green, blue);
    }

    function drawPaletteHue2(value, data, x, y){
        newValue = Numbers.scale(value, 0, config.maxIterations, 50, 0);
        const { r: red, g: green, b: blue } = Color.hslToRgb(config.hue, 100, newValue);
        Pixels.setPixelBatch(ctx, data, x, y, red, green, blue);
    }

    function drawPaletteGrayscale2(value, data, x, y){
        newValue = Numbers.scale(value, 0, config.maxIterations, 255, 0);
        Pixels.setPixelBatch(ctx, data, x, y, newValue, newValue, newValue);       
    }

    function hopalong(){
        return drawHopalong(config.maxIterations);
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
        
        config.scale = 20;
        
        config.mode = globals.random.nextBool()

    }
    
    let hopalongStep = (x, y) => {
        const a = config.pow;
        const b = config.cr; 
        const c = config.ci; 

        let sign = x >= 0 ? 1 : -1;
        let xn = y - sign * Math.sqrt(Math.abs(b * x - c));
        let yn = a - x;
        return [xn, yn];
    }

    let drawHopalong = (iterations) => {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        let scale = config.scale;
        let x = 0;
        let y = 0;
        const drawFunction = config.drawFunctions[config.drawFunctionIndex];
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < iterations; i++) {
            [x, y] = hopalongStep(x, y);
            const px = Math.floor(cx + x * scale);
            const py = Math.floor(cy - y * scale);
            if (px >= 0 && px < width && py >= 0 && py < height) {       
                drawFunction(i, imageData.data, px, py);
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }

    window.draw = () => {
        drawBackground(ctx, canvas);
        hopalong(config.maxIterations);
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
                config.cr = Numbers.scale(x, 0, width, -1, 1);
                config.ci = Numbers.scale(y, 0, height, -1, 1);
            }

            lastPosY = y;
        }
    }

	window.clearCanvas = () => {
		Sound.error();
	}

	window.magic = () => {  
        config.mode = !config.mode;
        Sound.tada();
	}

    window.upload = () => {
		Sound.error();
    }

    init();
}
