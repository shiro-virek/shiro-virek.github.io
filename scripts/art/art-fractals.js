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
        mouseMoved: false
    };    

    let isInMandelbrotSet = (rc, ic, maxIterations = 50) => {
        let zr = 0;
        let zi = 0;
        
        for (let iterations = 0; iterations < maxIterations; iterations++) {
            const zrNew = zr * zr - zi * zi + rc;
            const ziNew = 2 * zr * zi + ic;
            
            zr = zrNew;
            zi = ziNew;
            
            if (zr * zr + zi * zi > 4) {
                return false;
            }
        }
        
        return true;
    }


    let isInJuliaSet = (zr, zi, cr, ci, maxIterations = 50) => {
        for (let i = 0; i < maxIterations; i++) {
            const zrNew = zr * zr - zi * zi + cr;
            const ziNew = 2 * zr * zi + ci;

            zr = zrNew;
            zi = ziNew;

            if (zr * zr + zi * zi > 4) {
                return false;
            }
        }

        return true;
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

                //if (isInMandelbrotSet(rc, ic)){
                if (isInJuliaSet(zr, zi, globals.cr, globals.ci)){
                    Pixels.setPixelBatch(ctx, data, x, y, 255, 255, 255);
                }else{
                    Pixels.setPixelBatch(ctx, data, x, y, 0, 0, 0);
                }                
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
