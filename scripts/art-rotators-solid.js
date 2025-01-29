{
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

	let clicking = false;

	let randomize = () => {
		OPACITY = Utils.getRandomFloat(0.01, 0.1, 2);
		THICKNESS = Utils.getRandomInt(1, 20);
		ANGLE_ROTATION = Utils.getRandomInt(0, 20);
		COLOR_MAP_MAX = Utils.getRandomInt(1, 10000);

		colorShift = Utils.getRandomInt(0, 359);

		ROTATORS = Utils.getRandomInt(2, 5);

		let rotatorsLength = 0
		let rotatorsAngle = 0;

		for (let i = 0; i < ROTATORS - 1; i++) {
			rotatorsLength += Utils.getRandomInt(300, 1000)
			rotatorsAngle += Utils.getRandomInt(0, 180);
			rotatorsLengths.push(rotatorsLength);
			rotatorsAngles.push(rotatorsAngle);
		}

		functionExecute = Utils.getRandomInt(0, 3);
	}

	let addEvents = () => {
		canvas.addEventListener('mousemove', e => {
			trackMouse(e.offsetX, e.offsetY);
		}, false);

		canvas.addEventListener('touchstart', function (e) {
			clicking = true;
			trackMouse(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
		});

		canvas.addEventListener('touchmove', function (e) {
			e.preventDefault();
			trackMouse(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
		});

		canvas.addEventListener('mousedown', e => {
			clicking = true;
		}, false);

		canvas.addEventListener('mouseup', e => {
			clicking = false;
		}, false);

		canvas.addEventListener('touchend', e => {
			clicking = false;
		}, false);   
	}

	let init = () => {
		initCanvas();
		randomize();
		addEvents();
		drawBackground(ctx, canvas);
	}

	let trackMouse = (xPointer, yPointer) => {
		if (lastPosX == 0) lastPosX = xPointer;
		if (lastPosY == 0) lastPosY = yPointer;

		if (clicking){	
			draw(xPointer, yPointer);
		}

		lastPosX = xPointer;
		lastPosY = yPointer;
	}

	let draw = (xPointer, yPointer) => {

		let distance = Utils.distanceBetweenTwoPoints(lastPosX, lastPosY, xPointer, yPointer);
		let hue = Utils.scale(distance, 0, 360, 0, COLOR_MAP_MAX);

		hue = (hue + colorShift) < 360 ? hue + colorShift : hue + colorShift - 360;

		let color = `hsl(${hue}, 100%, 50%, ${OPACITY})`;
		
		let angleRad = angle * RAD_CONST;

		if (ROTATORS > 0)
			for (let i = 0; i < ROTATORS - 1; i++) {
				let angleRad2 = (angle + rotatorsAngles[i]) * RAD_CONST;
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

	angle = 0;

	init();

	window.clearCanvas = () => {
		initCanvas();
	}
}