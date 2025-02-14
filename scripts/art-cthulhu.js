{

    const globals = {
    	touches: null,
    };

	let SLICES_COUNT = 60;
	let RINGS_DISTANCE = 20;
	let RINGS_SPEED = 1;
	let CENTER_MOVEMENT_SPEED = 1;
	let MAX_DISTANCE_TO_CENTER = 30;
	let TENTACLES_MOVEMENT = true;
	let SHOW_RINGS = true;
	let SATURATION = 50;
	let LIGHTNESS_FACTOR = 50;
	let ROTATE_AUTO = false;
	let ROTATION_ANGLE = 0;
	let ROTATION_INCREMENT = 0.5;
	let TENTACLES_COUNT = 5;
	let HUE = 0;

	let distanceToCenter = 0;
	let movingToCenter = false;
	let ringShift = 0;
	let timeCounter = 0;
	let slices = [];
	let ringIterations = 0;

	let mouseX;
	let mouseY;

	let clicking = false;

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

			let tentaclesPerFinger = TENTACLES_COUNT; 

			if (globals.touches){				
				let fingersCount = globals.touches.length;
				let fingerIndex = Math.floor(this.tentacle % fingersCount);
				tentaclesPerFinger = Math.ceil(TENTACLES_COUNT / fingersCount);
				//if (fingerIndex == 0) tentaclesPerFinger--;
				
				this.deltaX = globals.touches[fingerIndex].clientX - this.x;
				this.deltaY = globals.touches[fingerIndex].clientY - this.y;				
			}else{
				this.deltaX = mouseX - this.x;
				this.deltaY = mouseY - this.y;
			}

			let speedAxes = Utils.polarToCartesian(this.speed + distanceToCenter, (this.tentacle * Utils.degToRad(360) / tentaclesPerFinger) + Utils.degToRad(ROTATION_ANGLE));

			this.deltaX += speedAxes.x;
			this.deltaY += speedAxes.y;

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

	let updateRingShift = () => {
		if (timeCounter % RINGS_SPEED == 0) {
			if (ringShift >= RINGS_DISTANCE)
				ringShift = 1;
			else
				ringShift += 1;
		}
	}

	let updateDistanceToCenter = () => {
		if (timeCounter % CENTER_MOVEMENT_SPEED == 0) {
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
		ROTATE_AUTO = Utils.getRandomBool();
		ROTATION_ANGLE = Utils.getRandomInt(0, 360);
		ROTATION_INCREMENT = Utils.getRandomFloat(-1.0, 1.0, 1);
		SLICES_COUNT = Utils.getRandomInt(10, 60);
		RINGS_DISTANCE = Utils.getRandomInt(10, 20); 
		RINGS_SPEED = Utils.getRandomInt(1, 5);
		CENTER_MOVEMENT_SPEED = Utils.getRandomInt(1, 5);
		MAX_DISTANCE_TO_CENTER = Utils.getRandomInt(0, 60);
		TENTACLES_MOVEMENT = Utils.getRandomBool();

		ringIterations = SLICES_COUNT / RINGS_DISTANCE * TENTACLES_COUNT;
	}

	let addEvents = () => {
		canvas.addEventListener('mousemove', e => {
			trackMouse(e.offsetX, e.offsetY);
		}, false);

		canvas.addEventListener('touchstart', function (e) {
			clicking = true;

			globals.touches = e.touches;

			trackMouse(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
		});

		canvas.addEventListener('touchmove', function (e) {
			e.preventDefault();

			global.touches = e.touches;

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
		addSlices();
		addEvents();
		drawBackground(ctx, canvas);
		simulateTouchEvent();
		window.requestAnimationFrame(loop);
	}

	let isRing = (indexSlice) => {
		let result = false;

		for (let i = 0; i <= ringIterations; i++) {
			result = result || (indexSlice >= ringShift + (RINGS_DISTANCE * i) && indexSlice < ringShift + (RINGS_DISTANCE * i) + TENTACLES_COUNT);
		}

		return result;
	}

	let draw = () => {
		if (ROTATE_AUTO) ROTATION_ANGLE += ROTATION_INCREMENT;

		drawBackground(ctx, canvas);
		
		for (let i = 0; i < SLICES_COUNT * TENTACLES_COUNT; i++) {
			slices[i].update();

			let lightness = Utils.scale(SLICES_COUNT-slices[i].index, 0, SLICES_COUNT, 0, LIGHTNESS_FACTOR); 

			if (SHOW_RINGS && isRing(i))
				color = `hsl(${HUE}, ${SATURATION}%, ${lightness + 10}%)`;
			else
				color = `hsl(${HUE}, ${SATURATION}%, ${lightness}%)`;

			Utils.drawCircle(ctx, slices[i].x, slices[i].y, slices[i].diameter, color, color);
		}

		updateRingShift();

		if (TENTACLES_MOVEMENT) updateDistanceToCenter();

		timeCounter++;
	}

	let simulateTouchEvent = () => {
		const touch1 = new Touch({
			identifier: 1,
			target: canvas,
			clientX: 100,
			clientY: 150,
		});

		const touch2 = new Touch({
			identifier: 2,
			target: canvas,
			clientX: 200,
			clientY: 250,
		});


		const touch3 = new Touch({
			identifier: 3,
			target: canvas,
			clientX: 300,
			clientY: 350,
		});


		Utils.simulateTouchEvent('touchstart', [touch1, touch2, touch3], canvas);
	}

	let trackMouse = (x, y) => {
		if (clicking){
			mouseX = x;
			mouseY = y;
		}
	}

	let loop = (timestamp) => {
		let progress = timestamp - lastRender;

		draw();

		lastRender = timestamp;
		window.requestAnimationFrame(loop);
	}

	init();

	window.clearCanvas = () => {  
	}
}
