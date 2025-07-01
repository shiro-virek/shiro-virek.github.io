{
    const globals = {
		random: null,
		angle: 0,
		rotatorsLengths: [],
		rotatorsAngles: [],
    };

    const config = { 
        randomize: true,
		colorShift: 0,
		opacity: 0.5,
		thickness: 1,
		angleRotation: 10,
		colorMapMax: 500,
		rotators: 3,
		functionExecute: 0,
    };

	let randomize = () => {
		globals.random = Objects.getRandomObject();

		config.opacity = globals.random.nextRange(0.01, 0.1, 2);
		config.thickness = globals.random.nextInt(1, 20);
		config.angleRotation = globals.random.nextInt(0, 20);
		config.colorMapMax = globals.random.nextInt(1, 10000);

		config.colorShift = globals.random.nextInt(0, 359);

		config.rotators = globals.random.nextInt(2, 5);

		let rotatorsLength = 0
		let rotatorsAngle = 0;

		for (let i = 0; i < config.rotators - 1; i++) {
			rotatorsLength += globals.random.nextInt(300, 1000)
			rotatorsAngle += globals.random.nextInt(0, 180);
			globals.rotatorsLengths.push(rotatorsLength);
			globals.rotatorsAngles.push(rotatorsAngle);
		}

		config.functionExecute = globals.random.nextInt(0, 4);
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
		let hue = Numbers.scale(distance, 0, 360, 0, config.colorMapMax);

		hue = (hue + config.colorShift) < 360 ? hue + config.colorShift : hue + config.colorShift - 360;

		let color = `hsl(${hue}, 100%, 50%, ${config.opacity})`;
		
		let angleRad = globals.angle * Trigonometry.RAD_CONST;

		if (config.rotators > 0)
			for (let i = 0; i < config.rotators - 1; i++) {
				let angleRad2 = (globals.angle + globals.rotatorsAngles[i]) * Trigonometry.RAD_CONST;
				ctx.beginPath();

				ctx.moveTo(lastPosX, lastPosY);
				ctx.lineTo(xPointer + parseInt((distance * globals.rotatorsLengths[i]) * Math.cos(angleRad)), yPointer + parseInt((distance * globals.rotatorsLengths[i]) * Math.sin(angleRad2)));
				ctx.lineTo(xPointer + parseInt((distance * globals.rotatorsLengths[i]) * Math.cos(angleRad2)), yPointer + parseInt((distance * globals.rotatorsLengths[i]) * Math.sin(angleRad2)));
				
				if (config.functionExecute == 0) ctx.lineTo(xPointer, yPointer);
				if (config.functionExecute == 1) ctx.lineTo(yPointer, yPointer);
				if (config.functionExecute == 2) ctx.lineTo(yPointer, xPointer);
				if (config.functionExecute == 3) ctx.lineTo(xPointer, xPointer);
				
				ctx.fillStyle = color;
				ctx.fill();
			}

		globals.angle += config.angleRotation;
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