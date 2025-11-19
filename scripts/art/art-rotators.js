{
	const globals = {
		random: null,
		angle: 0,
		colorShift: 0,
		rotatorsLengths: [],
		rotatorsAngles: [],
    };

    const config = { 
        randomize: true,
		opacity: 0.5,
		thickness: 1,
		angleRotation: 10,
		colorMapMax: 500,
		rotators: 3,
    };

	let randomize = () => {
		globals.random = Objects.getRandomObject();

		config.opacity = globals.random.nextRange(0.03, 0.1);
		config.thickness = globals.random.nextInt(1, 5);
		config.angleRotation = globals.random.nextRange(0, 5);

		colorShift = globals.random.nextInt(0, 359);

		config.rotators = globals.random.nextInt(0, 100);

		let rotatorsLength = 0
		let rotatorsAngle = 0;

		for (let i = 0; i < config.rotators - 1; i++) {
			rotatorsLength += globals.random.nextInt(300, 1000)
			rotatorsAngle += globals.random.nextInt(0, 180);
			globals.rotatorsLengths.push(rotatorsLength);
			globals.rotatorsAngles.push(rotatorsAngle);
		}
	}

	let addEvents = () => {
	}

	let init = () => {
		initCanvas();		
        if (config.randomize) randomize();
		addEvents();
		drawBackground(ctx, canvas);
	}

	window.trackMouse = (xPointer, yPointer) => {
		if (clicking){	
			draw(xPointer, yPointer);
		}
	}

	window.draw = (xPointer, yPointer) => {
		let distance = Trigonometry.distanceBetweenTwoPoints(lastPosX, lastPosY, xPointer, yPointer);
		let hue = Numbers.scale(distance, 0, 100, 0, 360);

		hue = (hue + colorShift) < 360 ? hue + colorShift : hue + colorShift - 360;

		let color = `hsl(${hue}, 100%, 50%, ${config.opacity})`;

		let lineWidth = Numbers.scale(distance, 0, 500, 1, config.thickness); 

		Drawing.drawLine(ctx, lastPosX, lastPosY, xPointer, yPointer, lineWidth, color);

		if (config.rotators > 0)
			for (let i = 0; i < config.rotators - 1; i++) {
				let angleRad2 = (globals.angle + globals.rotatorsAngles[i]) * Trigonometry.RAD_CONST;
				Drawing.drawLine(ctx, xPointer, yPointer,
					xPointer + parseInt((distance * globals.rotatorsLengths[i]) * Math.cos(angleRad2)),
					yPointer + parseInt((distance * globals.rotatorsLengths[i]) * Math.sin(angleRad2)),
					lineWidth, color);
			}

		globals.angle += config.angleRotation;
	}

	window.clearCanvas = () => {
		initCanvas();
		drawBackground(ctx, canvas);
	}

	window.magic = () => {  
		Sound.error();
	}

    window.upload = () => {
		Sound.error();
    }

	init();
}