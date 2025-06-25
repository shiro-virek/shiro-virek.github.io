{    
    const globals = {
        random: null
    };

    const config = {
        randomize: true,
        clicking: false,
        mouseMoved: false, 
        mode: 1,
        pow: 2,
        maxIterations: 50,
        scale: 0.005,
        cr: -0.7,
        ci: 0.27,
        offsetX: 0,
        offsetY: 0,
        fractalFunctionIndex: 1,
        fractalFunctions: [mandelbrot, julia],
        drawFunctionIndex: 1,
        drawFunctions: [drawPaletteColor1, drawPaletteGrayscale1],
    };    

    function drawPaletteColor1(value, data, x, y){
        newValue = Numbers.scale(value, 0, config.maxIterations, 0, 360);
        const { r: red, g: green, b: blue } = Color.hslToRgb(newValue, 100, 50);
        Pixels.setPixelBatch(ctx, data, x, y, red, green, blue);
    }

    function drawPaletteGrayscale1(value, data, x, y){
        newValue = Numbers.scale(value, 0, config.maxIterations, 0, 255);
        Pixels.setPixelBatch(ctx, data, x, y, newValue, newValue, newValue);       
    }

    function mandelbrot(c, i){
        return Fractals.mandelbrot(c, i, config.maxIterations, config.pow);
    }

    function julia(c, i){
        return Fractals.julia(c, i, config.maxIterations, config.pow, config.cr, config.ci);
    }

    let init = () => {
		globals.random = Objects.getRandomObject();
        if (config.randomize) randomize();
        initCanvas();
        addEvents();
        window.requestAnimationFrame(loop);
    }

    let addEvents = () => {
        canvas.addEventListener('click', e => {
            
        }, false);

        canvas.addEventListener('mousemove', e => {
            config.mouseMoved = true;
			trackMouse(e.offsetX, e.offsetY);
		}, false);

		canvas.addEventListener('touchmove', function (e) {
			e.preventDefault();
            config.mouseMoved = true;
			trackMouse(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
		});

		canvas.addEventListener('touchstart', function (e) {
            config.mouseMoved = false;            
			trackMouse(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
			config.clicking = true;
		});

		canvas.addEventListener('mousedown', e => {
            config.mouseMoved = false;
			config.clicking = true;
		}, false);

		canvas.addEventListener('mouseup', e => {
			config.clicking = false;
		}, false);

		canvas.addEventListener('touchend', e => {
			config.clicking = false;
		}, false);  
    }

    let randomize = () => {
        config.mode = globals.random.nextBool();
        config.fractalFunctionIndex = globals.random.nextInt(0, config.fractalFunctions.length);
        config.drawFunctionIndex = globals.random.nextInt(0, config.drawFunctions.length);
        config.pow = globals.random.nextInt(2, 5);   
        config.cr = globals.random.nextRange(-1, 1);  
        config.ci = globals.random.nextRange(-1, 1);  
    }

    let trackMouse = (x, y) => {
        if (lastPosX == 0) lastPosX = x;
        if (lastPosY == 0) lastPosY = y;

        if (config.clicking) {  
            config.scale = config.mode ? Numbers.scale(x, 0, width, 0.00005, 0.01) : config.scale;
            if (!config.mode){
                config.cr = Numbers.scale(x, 0, width, -1, 1);
                config.ci = Numbers.scale(y, 0, height, -1, 1);
            }
        }

        lastPosX = x;
        lastPosY = y;
    }
    
    let draw = () => {
        drawBackground(ctx, canvas);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
    
        config.offsetX = -width * config.scale / 2;
        config.offsetY = -height * config.scale / 2;
    
        for (let x=0; x < width; x++){
            for (let y=0; y < height; y++){
                const rc = x * config.scale + config.offsetX;
                const ic = y * config.scale + config.offsetY;

                const fractalFunction = config.fractalFunctions[config.fractalFunctionIndex];
                let value = fractalFunction(rc, ic);
                
                const drawFunction = config.drawFunctions[config.drawFunctionIndex];
                drawFunction(value, data, x, y);
            }
        }        

        ctx.putImageData(imageData, 0, 0);
    }

    let loop = (timestamp) => {
        let progress = timestamp - lastRender;

        draw();

        lastRender = timestamp;
        window.requestAnimationFrame(loop);
    }

    init();

	window.clearCanvas = () => {  
	}
}
