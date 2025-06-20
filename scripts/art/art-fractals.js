{    
    const globals = {
        random: null
    };

    const config = {
        randomize: true,
        clicking: false,
        mouseMoved: false, 
        mode: 1,
        functionIndex: 1,
        functions: [mandelbrot, julia],
        pow: 2,
        maxIterations: 50,
        scale: 0.005,
        cr: -0.7,
        ci: 0.27,
        offsetX: 0,
        offsetY: 0
    };    

    function mandelbrot(rc, ic){
        let zr = 0;
        let zi = 0;
        
        for (let i = 0; i < config.maxIterations; i++) {
            let zr_pow = zr;
            let zi_pow = zi;
            
            let rTemp = zr;
            let iTemp = zi;
            
            for (let j = 1; j < config.pow; j++) {
                const newR = rTemp * zr_pow - iTemp * zi_pow;
                const newI = rTemp * zi_pow + iTemp * zr_pow;
                rTemp = newR;
                iTemp = newI;
            }
            
            zr = rTemp + rc;
            zi = iTemp + ic;
            
            if (zr * zr + zi * zi > 4) {
                return i;
            }
        }
        
        return 0;
    }

    function julia(zr, zi){
        for (let i = 0; i < config.maxIterations; i++) {
            let zr_pow = zr;
            let zi_pow = zi;
            
            let rTemp = zr;
            let iTemp = zi;
            
            for (let j = 1; j < config.pow; j++) {
                const newR = rTemp * zr_pow - iTemp * zi_pow;
                const newI = rTemp * zi_pow + iTemp * zr_pow;
                rTemp = newR;
                iTemp = newI;
            }
            
            zr = rTemp + config.cr;
            zi = iTemp + config.ci;
            
            if (zr * zr + zi * zi > 4) {
                return i;
            }
        }
        
        return 0;
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
        config.functionIndex = Math.floor(Math.random() * config.functions.length)
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

                const fractalFunction = config.functions[config.functionIndex];
                let value = fractalFunction(rc, ic);
                
                value = Numbers.scale(value, 0, config.maxIterations, 0, 255);
                Pixels.setPixelBatch(ctx, data, x, y, value, value, value);
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
