{
	let ENTROPY_1 = 2;
	let CIRCLES = 5;
	let colorShift = 0;
	let colorMapMax = 0;
	let size = 5;
	let saturation = 0;
	let lightness = 0;
	let opacity = 0.001;

	let init = () => {
		initCanvas();
		randomize();
		addEvents();	
	}

	let addEvents = () => {
		canvas.addEventListener('mousemove', e => {
			draw(ctx, e.offsetX, e.offsetY);
		}, false);

		canvas.addEventListener('touchstart', function (e) {
			draw(ctx, e.changedTouches[0].pageX, e.changedTouches[0].pageY);
		});

		canvas.addEventListener('touchmove', function (e) {
			e.preventDefault();
			draw(ctx, e.changedTouches[0].pageX, e.changedTouches[0].pageY);
		});
	}

	let randomize = () => {
		saturation = Utils.getRandomInt(20, 100);
		lightness = Utils.getRandomInt(20, 100);
		size = Utils.getRandomInt(5, 15);
		CIRCLES = Utils.getRandomInt(5, 15);
		colorShift = Utils.getRandomInt(0, 359);
		ENTROPY_1 = Utils.getRandomInt(1, 250);
		colorMapMax = Utils.getRandomInt(1, 10000);
		opacity = Utils.getRandomFloat(0.003, 0.03, 3);
	}

	let draw = (ctx, xPointer, yPointer) => {

		if (lastPosX == 0) lastPosX = xPointer;
		if (lastPosY == 0) lastPosY = yPointer;

		let distance = Math.sqrt(Math.pow(lastPosX - xPointer, 2) + Math.pow(lastPosY - yPointer, 2))

		let hue = Utils.scale(parseInt(distance), 0, 360, 0, colorMapMax);

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

			let entropyX = Utils.getRandomFloat(-1, 1, 3) * ENTROPY_1;
			let entropyY = Utils.getRandomFloat(-1, 1, 3) * ENTROPY_1;

			x = (lastPosX + xMod) + entropyX;
			y = (lastPosY + yMod) + entropyY;

			for (let i = 0; i <= CIRCLES; i++) {
				Utils.drawCircle(ctx, x, y, size * (CIRCLES / i), color, color);
			}
		}

		lastPosX = xPointer;
		lastPosY = yPointer;
	}

	init();
}
