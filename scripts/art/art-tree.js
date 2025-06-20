{
    const globals = {
        random: null
    };

    const config = {
        randomize: true,
        clicking: false,
        mouseMoved: false, 
        amplitude: 10,
        hue: 0,
        maxDepth: 10, 
        length: 5,
    };    

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
        config.hue = globals.random.nextInt(1, 360);
    }

    let trackMouse = (x, y) => {
        if (lastPosX == 0) lastPosX = x;
        if (lastPosY == 0) lastPosY = y;

        if (config.clicking) {  
            config.amplitude = Numbers.scale(x, 0, width, 0, 50);
            config.length = Numbers.scale(y, 0, height, 0, 10);
        }

        lastPosX = x;
        lastPosY = y;
    }
    
    let draw = () => {
        drawBackground(ctx, canvas);

        drawTree(ctx, halfWidth, halfHeight, 0, config.maxDepth);
        drawTree(ctx, halfWidth, halfHeight, 90, config.maxDepth);
        drawTree(ctx, halfWidth, halfHeight, 180, config.maxDepth);
        drawTree(ctx, halfWidth, halfHeight, 270, config.maxDepth);
    }

    let drawTree = (ctx, x1, y1, angle, depth) => { 
        if (depth != 0){
            var x2 = x1 + (Math.cos(angle * Trigonometry.RAD_CONST) * depth * config.length);
            var y2 = y1 + (Math.sin(angle * Trigonometry.RAD_CONST) * depth * config.length);

            let brightness = Numbers.scale(depth, 0, config.maxDepth, 0, 50);
            let color = `hsl(${config.hue}, ${100}%, ${brightness}%)`
            Drawing.drawLine(ctx, x1, y1, x2, y2, depth, color);
            drawTree(ctx, x2, y2, angle - config.amplitude, depth - 1, depth);
            drawTree(ctx, x2, y2, angle + config.amplitude, depth - 1, depth);
        }
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