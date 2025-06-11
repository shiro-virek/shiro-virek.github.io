{    
    const globals = {
        random: null, 
        scale: 0.005,
        cr: -0.7,
        ci: 0.27
    };

    const config = {
        randomize: true,
        clicking: false,
        mouseMoved: false, 
        pow: 2,
        maxIterations: 50
    };    

    let isInMandelbrotSet = (rc, ic) => {
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

    let isInJuliaSet = (zr, zi, cr, ci) => {
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
            
            zr = rTemp + cr;
            zi = iTemp + ci;
            
            if (zr * zr + zi * zi > 4) {
                return i;
            }
        }
        
        return 0;
    }

    let init = () => {
		globals.random = Objects.getRandomObject();
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
    
    }


    let trackMouse = (x, y) => {
        if (lastPosX == 0) lastPosX = x;
        if (lastPosY == 0) lastPosY = y;

        if (config.clicking) {  
            //globals.scale = Numbers.scale(x, 0, width, 0.00005, 0.01);
            globals.cr = Numbers.scale(x, 0, width, -1, 1);
            globals.ci = Numbers.scale(y, 0, height, -1, 1);
        }

        lastPosX = x;
        lastPosY = y;
    }
    
    let draw = () => {
        drawBackground(ctx, canvas);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
            
        const offsetX = -width * globals.scale / 2;
        const offsetY = -height * globals.scale / 2;
        
        for (let x=0; x < width; x++){
            for (let y=0; y < height; y++){
                const rc = x * globals.scale + offsetX;
                const ic = y * globals.scale + offsetY;

                const zr = x * globals.scale + offsetX;
                const zi = y * globals.scale + offsetY;

                let value = isInMandelbrotSet(rc, ic);
                //let value = isInJuliaSet(zr, zi, globals.cr, globals.ci);
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
