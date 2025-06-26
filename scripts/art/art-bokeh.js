{
	const globals = {
		random: null
    };

    const config = { 
        randomize: true,	
		entropy: 2,
		circles: 5,
		colorShift: 0,
		colorMapMax: 0,
		size: 5,
		saturation: 0,
		lightness: 0,
		opacity: 0.003,
    };

	let init = () => {
		initCanvas();		

		globals.random = Objects.getRandomObject();
        if (config.randomize) randomize();
		addEvents();	
	}

	let addEvents = () => {
	}

	let randomize = () => {
		config.saturation = globals.random.nextInt(20, 100);
		config.lightness = globals.random.nextInt(20, 100);
		config.size = globals.random.nextInt(5, 15);
		config.circles = globals.random.nextInt(5, 15);
		config.colorShift = globals.random.nextInt(0, 359);
		config.entropy = globals.random.nextInt(1, 250);
		config.colorMapMax = globals.random.nextInt(1, 10000);
		globals.random.nextRange(0.003, 0.03, 3);
	}

	window.trackMouse = (xPointer, yPointer) => {
		if (lastPosX == 0) lastPosX = xPointer;
		if (lastPosY == 0) lastPosY = yPointer;

		if (clicking){	
			draw(ctx, xPointer, yPointer);
		}	
	
		lastPosX = xPointer;
		lastPosY = yPointer;
	}

	let draw = (ctx, xPointer, yPointer) => {

		let distance = Trigonometry.distanceBetweenTwoPoints(lastPosX, lastPosY, xPointer,  yPointer);

		let hue = Numbers.scale(parseInt(distance), 0, 360, 0, config.colorMapMax);

		hue = (hue + config.colorShift) < 360 ? hue + config.colorShift : hue + config.colorShift - 360;

		let color = `hsl(${hue}, ${config.saturation}%, ${config.lightness}%, ${config.opacity})`;

		let steps = parseInt(distance / config.size)
		let xMod = 0;
		let yMod = 0;
		let x = 0;
		let y = 0;
		let angleCart = 0;

		if ((xPointer < lastPosX && yPointer > lastPosY) || (xPointer > lastPosX && yPointer < lastPosY)) {
			angleCart = Math.atan((xPointer - lastPosX) / (yPointer - lastPosY)) + 1.5708;
		}
		else {
			angleCart = Math.atan((yPointer - lastPosY) / (xPointer - lastPosX));
		}

		for (i = 1; i <= steps; i++) {
			if (xPointer < lastPosX) {
				xMod = - parseInt((config.size * i) * Math.cos(angleCart));
			} else {
				xMod = parseInt((config.size * i) * Math.cos(angleCart));
			}

			if (yPointer < lastPosY) {
				yMod = - parseInt((config.size * i) * Math.sin(angleCart));
			} else {
				yMod = parseInt((config.size * i) * Math.sin(angleCart));
			}

			let entropyX = globals.random.nextRange(-1, 1, 3) * config.entropy;
			let entropyY = globals.random.nextRange(-1, 1, 3) * config.entropy;

			x = (lastPosX + xMod) + entropyX;
			y = (lastPosY + yMod) + entropyY;

			for (let i = 0; i <= config.circles; i++) {
				Drawing.drawCircle(ctx, x, y, config.size * (config.circles / i), color, color);
			}
		}
	}

	window.clearCanvas = () => {
		initCanvas();
	}

	window.magic = () => {  
		Sound.error();
	}

    window.upload = () => {
		Sound.error();
    }

	init();
}
