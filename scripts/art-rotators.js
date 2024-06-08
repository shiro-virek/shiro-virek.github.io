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

	let randomize = () => {
		OPACITY = Utils.getRandomFloat(0.03, 0.1, 2);
		THICKNESS = Utils.getRandomInt(1, 20);
		ANGLE_ROTATION = Utils.getRandomInt(0, 20);
		COLOR_MAP_MAX = Utils.getRandomInt(1, 10000);

		colorShift = Utils.getRandomInt(0, 359);

		ROTATORS = Utils.getRandomInt(0, 100);

		let rotatorsLength = 0
		let rotatorsAngle = 0;

		for (let i = 0; i < ROTATORS - 1; i++) {
			rotatorsLength += Utils.getRandomInt(300, 1000)
			rotatorsAngle += Utils.getRandomInt(0, 180);
			rotatorsLengths.push(rotatorsLength);
			rotatorsAngles.push(rotatorsAngle);
		}
	}

	let addEvents = () => {
		canvas.addEventListener('mousemove', e => {
			draw(e.offsetX, e.offsetY);
		}, false);

		canvas.addEventListener('touchstart', function (e) {
			draw(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
		});

		canvas.addEventListener('touchmove', function (e) {
			e.preventDefault();
			draw(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
		});
	}

	let init = () => {
		initCanvas();
		randomize();
		addEvents();
		drawBackground(ctx, canvas);
	}

	let draw = (xPointer, yPointer) => {
		if (lastPosX == 0) lastPosX = xPointer;
		if (lastPosY == 0) lastPosY = yPointer;

		let distance = Math.sqrt(Math.pow(lastPosX - xPointer, 2) + Math.pow(lastPosY - yPointer, 2))
		let hue = Utils.scale(distance, 0, 360, 0, COLOR_MAP_MAX);

		hue = (hue + colorShift) < 360 ? hue + colorShift : hue + colorShift - 360;

		let color = `hsl(${hue}, 100%, 50%, ${OPACITY})`;

		let lineWidth = Utils.scale(distance, 1, 400, 1, THICKNESS);

		Utils.drawLine(ctx, lastPosX, lastPosY, xPointer, yPointer, lineWidth, color);

		let angleRad = angle * RAD_CONST;

		Utils.drawLine(ctx, xPointer, yPointer,
			xPointer + parseInt(distance * Math.cos(angleRad)),
			yPointer + parseInt(distance * Math.sin(angleRad)),
			lineWidth, color);

		if (ROTATORS > 0)
			for (let i = 0; i < ROTATORS - 1; i++) {
				let angleRad2 = (angle + rotatorsAngles[i]) * RAD_CONST;
				Utils.drawLine(ctx, xPointer, yPointer,
					xPointer + parseInt((distance * rotatorsLengths[i]) * Math.cos(angleRad2)),
					yPointer + parseInt((distance * rotatorsLengths[i]) * Math.sin(angleRad2)),
					lineWidth, color);
			}

		angle += ANGLE_ROTATION;

		lastPosX = xPointer;
		lastPosY = yPointer;
	}

	angle = 0;

	init();

}