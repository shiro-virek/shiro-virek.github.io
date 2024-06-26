{
	let SLICES_COUNT = 60;
	let RINGS_DISTANCE = 20;
	let RINGS_SPEED = 1;
	let CENTER_MOVEMENT_SPEED = 1;
	let MAX_DISTANCE_TO_CENTER = 30;
	let TENTACLES_MOVEMENT = true;
	let SHOW_RINGS = true;
	let SATURATION = 50;
	let LIGHTNESS_FACTOR = 50;
	let ROTATE = 0;

	let TENTACLES_COUNT = 5;

	let HUE = 0;

	let distanceToCenter = 0;
	let movingToCenter = false;
	let colorFactor = 0;
	let globalCounter = 0;
	let slices = [];

	let mouseX;
	let mouseY;

	class Slice {

		constructor(tentacle, slice, mouseX, mouseY) {
			this.speed = slice;
			this.tentacle = tentacle;
			this.diameter = slice;
			this.index = slice;
			this.radius = Math.floor(this.diameter / 2);
			
			this.x = mouseX - this.radius;
			this.y = mouseX - this.radius;
		}

		update = () => {
			mouseX = mouseX ? mouseX : 0;
			mouseY = mouseY ? mouseY : 0;
			this.x = this.x ? this.x : 0;
			this.y = this.y ? this.y : 0;

			this.deltaX = mouseX - this.x;
			this.deltaY = mouseY - this.y;

			let speedAxes = Utils.polarToCartesian(this.speed, (this.tentacle * Utils.degToRad(360) / TENTACLES_COUNT) + Utils.degToRad(ROTATE));

			this.deltaX += speedAxes.x + distanceToCenter;
			this.deltaY += speedAxes.y + distanceToCenter;

			this.x += (this.deltaX / this.speed);
			this.y += (this.deltaY / this.speed);
		}
	}

	class Color {
		constructor(r, g, b, a) {
			this.red = r;
			this.green = g;
			this.blue = b;
			this.alpha = a;
		}

		getRGBA() {
			return `rgba(${this.red}, ${this.green}, ${this.blue}, ${this.alpha})`;
		}
	}

	let updateColorFactor = () => {
		if (globalCounter % RINGS_SPEED == 0) {
			if (colorFactor >= RINGS_DISTANCE)
				colorFactor = 1;
			else
				colorFactor += 1;
		}
	}

	let updateDistanceToCenter = () => {
		if (globalCounter % CENTER_MOVEMENT_SPEED == 0) {
			if (distanceToCenter > MAX_DISTANCE_TO_CENTER)
				movingToCenter = true;

			if (distanceToCenter <= 0)
				movingToCenter = false;

			if (movingToCenter)
				distanceToCenter -= 1;
			else
				distanceToCenter += 1;
		}
	}

	let addSlices = () => {
		for (let j = SLICES_COUNT; j > 0; j--) {
			for (let i = 1; i <= TENTACLES_COUNT; i++)	{
				slices.push(new Slice(i, j, 0, mouseX, mouseY));
			}
		}
	}

	let randomize = () => {
		HUE = Utils.getRandomInt(1, 360);
		LIGHTNESS_FACTOR = Utils.getRandomInt(0, 100);
		SATURATION = Utils.getRandomInt(0, 100);
		SHOW_RINGS = Utils.getRandomBool();
		TENTACLES_COUNT = Utils.getRandomInt(1, 8);
		ROTATE = Utils.getRandomInt(0, 360);

		SLICES_COUNT = Utils.getRandomInt(10, 60);
		RINGS_DISTANCE = Utils.getRandomInt(10, 20); 
		RINGS_SPEED = Utils.getRandomInt(1, 5);
		CENTER_MOVEMENT_SPEED = Utils.getRandomInt(1, 5);
		MAX_DISTANCE_TO_CENTER = Utils.getRandomInt(0, 60);
		TENTACLES_MOVEMENT = Utils.getRandomBool();
	}

	let addEvents = () => {
		canvas.addEventListener('mousemove', e => {
			trackMouse(e.offsetX, e.offsetY);
		}, false);

		canvas.addEventListener('touchstart', function (e) {
			trackMouse(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
		});

		canvas.addEventListener('touchmove', function (e) {
			e.preventDefault();
			trackMouse(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
		});
	}

	let init = () => {
		initCanvas();
		randomize();
		addSlices();
		addEvents();
		drawBackground(ctx, canvas);
	}

	let isLight = (indexRing) => {
		let result = false;

		let iterations = SLICES_COUNT / RINGS_DISTANCE * 4;

		for (let i = 0; i <= iterations; i++) {
			result = result || (indexRing >= colorFactor + (RINGS_DISTANCE * i) && indexRing < colorFactor + (RINGS_DISTANCE * i) + 4);
		}

		return result;
	}

	let draw = () => {
		ROTATE += 0.5;

		drawBackground(ctx, canvas);
		
		for (let i = 0; i < SLICES_COUNT * TENTACLES_COUNT; i++) {
			slices[i].update();

			let lightness = Utils.scale(SLICES_COUNT-slices[i].index, 0, SLICES_COUNT, 0, LIGHTNESS_FACTOR); // (i * LIGHTNESS_FACTOR); // / (SLICES_COUNT * TENTACLES_COUNT * slices[i].tentacle ));

			//if (SHOW_RINGS && isLight(i))
			//	color = `hsl(${HUE}, ${SATURATION}%, ${lightness + 10}%)`;
			//else
				color = `hsl(${HUE}, ${SATURATION}%, ${lightness}%)`;

			Utils.drawCircle(ctx, slices[i].x, slices[i].y, slices[i].diameter, color, color);
		}

		updateColorFactor();

		//if (TENTACLES_MOVEMENT) updateDistanceToCenter();

		globalCounter++;
	}

	let trackMouse = (x, y) => {
		mouseX = x;
		mouseY = y;
	}

	let loop = (timestamp) => {
		let progress = timestamp - lastRender;

		draw();

		lastRender = timestamp;
		window.requestAnimationFrame(loop);
	}

	init();

	window.requestAnimationFrame(loop)
}
