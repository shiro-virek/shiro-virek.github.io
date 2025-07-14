{
    const globals = {
		random: null,
		mouseX: 0,
		mouseY: 0,
		slices: [],
		distanceToCenter: 0,
		movingToCenter: false,
		ringShift: 0,
		timeCounter: 0,
		ringIterations: 0,
    };

    const config = { 
        randomize: true,
		slicesCount: 60,
		ringsDistance: 20,
		ringsSpeed: 1,
		centerMovementSpeed: 1,
		maxDistanceToCenter: 30,
		tentaclesMovement: true,
		showRings: true,
		saturation: 50,
		lightnessFactor: 50,
		rotateAuto: false,
		rotationAngle: 0,
		rotationIncrement: 0.5,
		tentaclesCount: 5,
		hue: 0,
        functionIndex: 1,
        functions: [circle, pentagon, hexagon, square] 
    };

	function circle(color, i){
		Drawing.drawCircle(ctx, globals.slices[i].x, globals.slices[i].y, globals.slices[i].diameter, color);
	}
		
	function square(color, i){
		Drawing.drawSquare(ctx, globals.slices[i].x, globals.slices[i].y, globals.slices[i].diameter, 0, color);
	}

	function hexagon(color, i){
		Drawing.drawPolygon(ctx, globals.slices[i].x, globals.slices[i].y, globals.slices[i].diameter, 5, 0, color)
	}

	function pentagon(color, i){
		Drawing.drawPolygon(ctx, globals.slices[i].x, globals.slices[i].y, globals.slices[i].diameter, 6, 0, color)
	}

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
			globals.mouseX = globals.mouseX ? globals.mouseX : 0;
			globals.mouseY = globals.mouseY ? globals.mouseY : 0;
			this.x = this.x ? this.x : 0;
			this.y = this.y ? this.y : 0;

			let tentaclesPerFinger = config.tentaclesCount; 

			if (touches){				
				let fingersCount = touches.length;
				let fingerIndex = Math.floor(this.tentacle % fingersCount);
				
				this.deltaX = touches[fingerIndex].clientX - this.x;
				this.deltaY = touches[fingerIndex].clientY - this.y;				
			}else{
				this.deltaX = globals.mouseX - this.x;
				this.deltaY = globals.mouseY - this.y;
			}

			let speedAxes = Trigonometry.polarToCartesian(this.speed + globals.distanceToCenter, (this.tentacle * Trigonometry.degToRad(360) / tentaclesPerFinger) + Trigonometry.degToRad(config.rotationAngle));

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
		if (globals.timeCounter % config.ringsSpeed == 0) {
			if (globals.ringShift >= config.ringsDistance)
				globals.ringShift = 1;
			else
				globals.ringShift += 1;
		}
	}

	let updateDistanceToCenter = () => {
		if (globals.timeCounter % config.centerMovementSpeed == 0) {
			if (globals.distanceToCenter > config.maxDistanceToCenter)
				globals.movingToCenter = true;

			if (globals.distanceToCenter <= 0)
				globals.movingToCenter = false;

			if (globals.movingToCenter)
				globals.distanceToCenter -= 1;
			else
				globals.distanceToCenter += 1;
		}
	}

	let addSlices = () => {
		for (let j = config.slicesCount; j > 0; j--) {
			for (let i = 1; i <= config.tentaclesCount; i++)	{
				globals.slices.push(new Slice(i, j, 0, globals.mouseX, globals.mouseY));
			}
		}
	}

	let randomize = () => {
		globals.random = Objects.getRandomObject();
		config.hue = globals.random.nextInt(1, 360);
		config.lightnessFactor = globals.random.nextInt(0, 100);
		config.saturation = globals.random.nextInt(0, 100);
		config.showRings = globals.random.nextBool();
		config.tentaclesCount = globals.random.nextInt(1, 8);
		config.rotateAuto = globals.random.nextBool();
		config.rotationAngle = globals.random.nextInt(0, 360);
		config.rotationIncrement = globals.random.nextRange(-1.0, 1.0);
		config.slicesCount = globals.random.nextInt(10, 60);
		config.ringsDistance = globals.random.nextInt(10, 20); 
		config.ringsSpeed = globals.random.nextInt(1, 5);
		config.centerMovementSpeed = globals.random.nextInt(1, 5);
		config.maxDistanceToCenter = globals.random.nextInt(0, 60);
		config.tentaclesMovement = globals.random.nextBool();
        config.functionIndex = globals.random.nextInt(0, config.functions.length - 1);

		globals.ringIterations = config.slicesCount / config.ringsDistance * config.tentaclesCount;
	}

	let addEvents = () => {
	}

	let init = () => {
		initCanvas();
        if (config.randomize) randomize();
		console.log(config.tentaclesCount);
		addSlices();
		addEvents();
		drawBackground(ctx, canvas);
		//simulateTouchEvent();
		window.requestAnimationFrame(loop);
	}

	let isRing = (indexSlice) => {
		let result = false;

		for (let i = 0; i <= globals.ringIterations; i++) {
			result = result || (indexSlice >= globals.ringShift + (config.ringsDistance * i) && indexSlice < globals.ringShift + (config.ringsDistance * i) + config.tentaclesCount);
		}

		return result;
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

		Touch.simulateTouchEvent('touchstart', [touch1, touch2, touch3], canvas);
	}

	window.draw = () => {
		if (config.rotateAuto) config.rotationAngle += config.rotationIncrement;

		drawBackground(ctx, canvas);
		
		for (let i = 0; i < config.slicesCount * config.tentaclesCount; i++) {
			globals.slices[i].update();

			let lightness = Numbers.scale(config.slicesCount-globals.slices[i].index, 0, config.slicesCount, 0, config.lightnessFactor); 

			if (config.showRings && isRing(i))
				color = `hsl(${config.hue}, ${config.saturation}%, ${lightness + 10}%)`;
			else
				color = `hsl(${config.hue}, ${config.saturation}%, ${lightness}%)`;


			const tentacleFunction = config.functions[config.functionIndex];
			tentacleFunction(color, i);
		}

		updateRingShift();

		if (config.tentaclesMovement) updateDistanceToCenter();

		globals.timeCounter++;
	}

	window.trackMouse = (x, y) => {
		if (clicking){
			globals.mouseX = x;
			globals.mouseY = y;
		}
	}
	
	window.clearCanvas = () => {
		Sound.error();
	}

	window.magic = () => { 
		config.tentaclesCount++;
		globals.slices = [];
		addSlices(); 
		Sound.tada();
	}

    window.upload = () => {
		Sound.error();
    }

	init();
}
