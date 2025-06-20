{
	const globals = {
		random: null
    };

	let ENTROPY_1 = 2;
	let CIRCLES = 5;
	let colorShift = 0;
	let colorMapMax = 0;
	let size = 5;
	let saturation = 0;
	let lightness = 0;
	let opacity = 0.001;

	let clicking = false;

	let init = () => {
		initCanvas();
		randomize();
		addEvents();	
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

	let randomize = () => {
		globals.random = Objects.getRandomObject();

		saturation = globals.random.nextInt(20, 100);
		lightness = globals.random.nextInt(20, 100);
		size = globals.random.nextInt(5, 15);
		CIRCLES = globals.random.nextInt(5, 15);
		colorShift = globals.random.nextInt(0, 359);
		ENTROPY_1 = globals.random.nextInt(1, 250);
		colorMapMax = globals.random.nextInt(1, 10000);
		opacity = globals.random.nextRange(0.003, 0.03, 3);
	}

	let trackMouse = (xPointer, yPointer) => {
		if (lastPosX == 0) lastPosX = xPointer;
		if (lastPosY == 0) lastPosY = yPointer;

		if (clicking){	
			draw(ctx, xPointer, yPointer);
		}	
	
		lastPosX = xPointer;
		lastPosY = yPointer;
	}

	let draw = (ctx, xPointer, yPointer) => {

		let distance = Math.sqrt(Math.pow(lastPosX - xPointer, 2) + Math.pow(lastPosY - yPointer, 2))

		let hue = Numbers.scale(parseInt(distance), 0, 360, 0, colorMapMax);

		hue = (hue + colorShift) < 360 ? hue + colorShift : hue + colorShift - 360;

		let color = `hsl(${hue}, ${saturation}%, ${lightness}%, ${opacity})`;

		let steps = parseInt(distance / size)
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
				xMod = - parseInt((size * i) * Math.cos(angleCart));
			} else {
				xMod = parseInt((size * i) * Math.cos(angleCart));
			}

			if (yPointer < lastPosY) {
				yMod = - parseInt((size * i) * Math.sin(angleCart));
			} else {
				yMod = parseInt((size * i) * Math.sin(angleCart));
			}

			let entropyX = globals.random.nextRange(-1, 1, 3) * ENTROPY_1;
			let entropyY = globals.random.nextRange(-1, 1, 3) * ENTROPY_1;

			x = (lastPosX + xMod) + entropyX;
			y = (lastPosY + yMod) + entropyY;

			for (let i = 0; i <= CIRCLES; i++) {
				Drawing.drawCircle(ctx, x, y, size * (CIRCLES / i), color, color);
			}
		}
	}

	init();

	window.clearCanvas = () => {
		initCanvas();
	}
}
