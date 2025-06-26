{
    const globals = {
		random: null
    };

	let angle = 0;

	let colorShift = 0;

	let rotatorsLengths = [];
	let rotatorsAngles = [];

	let OPACITY = 0.5;
	let THICKNESS = 1;

	let ANGLE_ROTATION = 10;

	let COLOR_MAP_MAX = 500;
	let ROTATORS = 3;

	let functionExecute;

	let randomize = () => {
		globals.random = Objects.getRandomObject();

		OPACITY = globals.random.nextRange(0.01, 0.1, 2);
		THICKNESS = globals.random.nextInt(1, 20);
		ANGLE_ROTATION = globals.random.nextInt(0, 20);
		COLOR_MAP_MAX = globals.random.nextInt(1, 10000);

		colorShift = globals.random.nextInt(0, 359);

		ROTATORS = globals.random.nextInt(2, 5);

		let rotatorsLength = 0
		let rotatorsAngle = 0;

		for (let i = 0; i < ROTATORS - 1; i++) {
			rotatorsLength += globals.random.nextInt(300, 1000)
			rotatorsAngle += globals.random.nextInt(0, 180);
			rotatorsLengths.push(rotatorsLength);
			rotatorsAngles.push(rotatorsAngle);
		}

		functionExecute = globals.random.nextInt(0, 4);
	}

	let addEvents = () => {
	}

	let init = () => {
		initCanvas();
		randomize();
		addEvents();
		drawBackground(ctx, canvas);
	}

	window.trackMouse = (xPointer, yPointer) => {
		if (lastPosX == 0) lastPosX = xPointer;
		if (lastPosY == 0) lastPosY = yPointer;

		if (clicking){	
			draw(xPointer, yPointer);
		}

		lastPosX = xPointer;
		lastPosY = yPointer;
	}

	let draw = (xPointer, yPointer) => {

		let distance = Trigonometry.distanceBetweenTwoPoints(lastPosX, lastPosY, xPointer, yPointer);
		let hue = Numbers.scale(distance, 0, 360, 0, COLOR_MAP_MAX);

		hue = (hue + colorShift) < 360 ? hue + colorShift : hue + colorShift - 360;

		let color = `hsl(${hue}, 100%, 50%, ${OPACITY})`;
		
		let angleRad = angle * Trigonometry.RAD_CONST;

		if (ROTATORS > 0)
			for (let i = 0; i < ROTATORS - 1; i++) {
				let angleRad2 = (angle + rotatorsAngles[i]) * Trigonometry.RAD_CONST;
				ctx.beginPath();

				ctx.moveTo(lastPosX, lastPosY);
				ctx.lineTo(xPointer + parseInt((distance * rotatorsLengths[i]) * Math.cos(angleRad)), yPointer + parseInt((distance * rotatorsLengths[i]) * Math.sin(angleRad2)));
				ctx.lineTo(xPointer + parseInt((distance * rotatorsLengths[i]) * Math.cos(angleRad2)), yPointer + parseInt((distance * rotatorsLengths[i]) * Math.sin(angleRad2)));
				
				if (functionExecute == 0) ctx.lineTo(xPointer, yPointer);
				if (functionExecute == 1) ctx.lineTo(yPointer, yPointer);
				if (functionExecute == 2) ctx.lineTo(yPointer, xPointer);
				if (functionExecute == 3) ctx.lineTo(xPointer, xPointer);
				
				ctx.fillStyle = color;
				ctx.fill();
			}

		angle += ANGLE_ROTATION;
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