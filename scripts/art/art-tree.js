{
    const globals = {
        random: null
    };

    const config = {
        randomize: true,
        amplitude: 10,
        hue: 0,
        maxDepth: 10, 
        length: 5,
        modifAmount: 50,
        mode: 1,
    };    

    let init = () => {
		globals.random = Objects.getRandomObject();
        if (config.randomize) randomize();
        initCanvas();
        addEvents();
        window.requestAnimationFrame(loop);
    }

    let addEvents = () => {
    }

    let randomize = () => {
        config.hue = globals.random.nextInt(1, 360);
        config.mode = globals.random.nextInt(0, 2);
        config.modifAmount = globals.random.nextInt(-100, 100);
    }

    window.trackMouse = (x, y) => {
        if (clicking) {  
            config.amplitude = Numbers.scale(x, 0, width, 0, 50);
            config.length = Numbers.scale(y, 0, height, 0, 10);
        }
    }
    
    window.draw = () => {
        drawBackground(ctx, canvas);

        drawTree(ctx, halfWidth, halfHeight, 0, config.maxDepth, config.modifAmount, -config.modifAmount);
        drawTree(ctx, halfWidth, halfHeight, 90, config.maxDepth, config.modifAmount, config.modifAmount);
        drawTree(ctx, halfWidth, halfHeight, 180, config.maxDepth, -config.modifAmount, config.modifAmount);
        drawTree(ctx, halfWidth, halfHeight, 270, config.maxDepth, -config.modifAmount, -config.modifAmount);
    }

    let drawTree = (ctx, x1, y1, angle, depth, modifierX, modifierY) => { 
        if (depth != 0){
            var x2 = x1 + (Math.cos(angle * Trigonometry.RAD_CONST) * depth * config.length);
            var y2 = y1 + (Math.sin(angle * Trigonometry.RAD_CONST) * depth * config.length);

            let brightness = Numbers.scale(depth, 0, config.maxDepth, 0, 50);
            let color = `hsl(${config.hue}, ${100}%, ${brightness}%)`

            switch (config.mode) {
                case 0:
                    Drawing.drawLine(ctx, x1, y1, x2, y2, depth, color);
                    break;
                case 1:
                    const mx = (x1 + x2) / 2 + modifierX;
                    const my = (y1 + y2) / 2 + modifierY; 

                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.quadraticCurveTo(mx, my, x2, y2);
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 3;
                    ctx.stroke();
                    break;
            }

            drawTree(ctx, x2, y2, angle - config.amplitude, depth - 1, -Numbers.absoluteSubstraction(modifierX, 5), -Numbers.absoluteSubstraction(modifierY, 5));
            drawTree(ctx, x2, y2, angle + config.amplitude, depth - 1, -Numbers.absoluteSubstraction(modifierX, 5), -Numbers.absoluteSubstraction(modifierY, 5));
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