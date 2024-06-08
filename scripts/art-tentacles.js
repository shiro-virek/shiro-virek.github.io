{
	let OBJECTS_COUNT = 60;
	let RINGS_DISTANCE = 20;
	let RINGS_SPEED = 1;
	let CENTER_MOVEMENT_SPEED = 1;
	let MAX_DISTANCE_TO_CENTER = 30;
	let TENTACLES_MOVEMENT = true;
	let SHOW_RINGS = true;
	let SATURATION = 50;
	let LIGHTNESS_FACTOR = 50;

	let HUE = 0;

	let distanceToCenter = 0;
	let movingToCenter = false;
	let colorFactor = 0;
	let globalCounter = 0;
	let objects = [];

	let mouseX;
	let mouseY;

	class TrailingObject {

		constructor(speed, quadrant, mouseX, mouseY) {
			this.speed = speed;
			this.diameter = this.speed;
			this.radius = Math.floor(this.diameter / 2);
			this.quadrant = quadrant;

			this.xCenter = mouseX - this.radius;
			this.yCenter = mouseX - this.radius;

		}

		adjustQuadrant = () => {

			switch (this.quadrant) {
				case 1:
					this.difX -= this.diameter + distanceToCenter;
					this.difY -= this.diameter + distanceToCenter;
					break;
				case 2:
					this.difX += this.diameter + distanceToCenter;
					this.difY -= this.diameter + distanceToCenter;
					break;
				case 3:
					this.difX -= this.diameter + distanceToCenter;
					this.difY += this.diameter + distanceToCenter;
					break;
				case 4:
					this.difX += this.diameter + distanceToCenter;
					this.difY += this.diameter + distanceToCenter;
					break;
			}
		}

		update = () => {
			mouseX = mouseX ? mouseX : 0;
			mouseY = mouseY ? mouseY : 0;
			this.xCenter = this.xCenter ? this.xCenter : 0;
			this.yCenter = this.yCenter ? this.yCenter : 0;

			this.difX = mouseX - this.xCenter;
			this.difY = mouseY - this.yCenter;

			this.adjustQuadrant();

			this.xCenter += this.difX / this.speed;
			this.yCenter += this.difY / this.speed;
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

	let addParticles = () => {
		for (let i = OBJECTS_COUNT; i > 0; i--) {
			objects.push(new TrailingObject(i, 1, mouseX, mouseY));
			objects.push(new TrailingObject(i, 2, mouseX, mouseY));
			objects.push(new TrailingObject(i, 3, mouseX, mouseY));
			objects.push(new TrailingObject(i, 4, mouseX, mouseY));
		}
	}

	let randomize = () => {
		HUE = Utils.getRandomInt(1, 360);
		LIGHTNESS_FACTOR = Utils.getRandomInt(0, 100);
		SATURATION = Utils.getRandomInt(0, 100);
		SHOW_RINGS = Utils.getRandomBool();

		OBJECTS_COUNT = Utils.getRandomInt(10, 60); //60
		RINGS_DISTANCE = Utils.getRandomInt(10, 20); //20
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
		randomize();
		addParticles();
		addEvents();
		drawBackground(ctx, canvas);
	}

	let isLight = (indexRing) => {
		let result = false;

		let iterations = OBJECTS_COUNT / RINGS_DISTANCE * 4;

		for (let i = 0; i <= iterations; i++) {
			result = result || (indexRing >= colorFactor + (RINGS_DISTANCE * i) && indexRing < colorFactor + (RINGS_DISTANCE * i) + 4);
		}

		return result;
	}

	let draw = () => {
		drawBackground(ctx, canvas);

		for (let i = 0; i < OBJECTS_COUNT * 4; i++) {
			objects[i].update();

			let lightness = (i * LIGHTNESS_FACTOR / (OBJECTS_COUNT * 4));

			if (SHOW_RINGS && isLight(i))
				color = `hsl(${HUE}, ${SATURATION}%, ${lightness + 10}%)`;
			else
				color = `hsl(${HUE}, ${SATURATION}%, ${lightness}%)`;

			drawCircle(objects[i].xCenter, objects[i].yCenter, objects[i].diameter, color);
		}

		updateColorFactor();

		if (TENTACLES_MOVEMENT) updateDistanceToCenter();

		globalCounter++;
	}

	trackMouse = (x, y) => {
		mouseX = x;
		mouseY = y;
	}

	loop = (timestamp) => {
		let progress = timestamp - lastRender;

		draw();

		lastRender = timestamp;
		window.requestAnimationFrame(loop);
	}

	init();

	window.requestAnimationFrame(loop)
}
