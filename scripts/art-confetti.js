{
	let PARTICLES_COUNT = 500;
	let MINIMUM_LIFE = 20;
	let MAXIMUM_LIFE = 100;
	let MINIMUM_DIAMETER = 5;
	let MAXIMUM_DIAMETER = 15;
	let MINIMUM_SPEED = 5;
	let MAXIMUM_SPEED = 10;
	let AMPLITUDE = 50;
	let ALL_SIN = false;

	let objects = [];
	let clicking = false;

	const Figures = Object.freeze({
		Square: Symbol("square"),
		Circle: Symbol("circle")
	});

	class Particle {
		constructor() {
			this.setNewParticleObject();
		}

		setNewParticleObject(notFirstTime) {
			this.notFirstTime = notFirstTime;
			this.sin = Utils.getRandomBool();
			this.yCenter = -100 + Utils.getRandomInt(1, 50);
			this.diameter = MAXIMUM_DIAMETER;
			this.radius = this.diameter / 2;
			this.speed = Utils.getRandomInt(1, MAXIMUM_SPEED);
			this.life = Utils.getRandomInt(MINIMUM_LIFE, MAXIMUM_LIFE);
			this.xCenter = Utils.getRandomInt(1, width);
			var rand = Utils.getRandomInt(0, Object.keys(Figures).length - 1);
			this.shape = Figures[Object.keys(Figures)[rand]];
			this.hue = Utils.getRandomInt(0, 255);
			this.angle = Utils.getRandomInt(0, 360);
		}

		getColor() {
			let alpha = this.life / MAXIMUM_LIFE;
			let hue = this.life * 3 * this.hue / MAXIMUM_LIFE;
			let saturation = this.life * 100 / (MAXIMUM_LIFE * 3);
			let light = this.life * 100 / (MAXIMUM_LIFE * 3);
			return `hsl(${hue}, ${saturation}%, ${light}%, ${alpha})`;
		}

		getDiameter() {
			return this.life * MAXIMUM_DIAMETER / MAXIMUM_LIFE;
		}

		update() {
			this.yCenter += this.speed;

			if (this.sin || ALL_SIN)
				this.xMovement = (AMPLITUDE * (Math.sin(Utils.degToRad(this.yCenter)))) + this.xCenter; //float
			else
				this.xMovement = (AMPLITUDE * (Math.cos(Utils.degToRad(this.yCenter)))) + this.xCenter; //float

			this.angle++;

			if (this.life > 0)
				this.life--;
			else {
				this.setNewParticleObject(true);
			}
		}
	}

	let randomize = () => {
		PARTICLES_COUNT = Utils.getRandomInt(50, screen.height * screen.width / 1000);
		MINIMUM_LIFE = Utils.getRandomInt(10, 90)
		MAXIMUM_LIFE = Utils.getRandomInt(100, 200);
		MINIMUM_DIAMETER = Utils.getRandomInt(1, 10);
		MAXIMUM_DIAMETER = Utils.getRandomInt(12, 20);
		AMPLITUDE = Utils.getRandomInt(10, 100);
		ALL_SIN = Utils.getRandomBool();
	}

	let addParticle = (mouseX, mouseY, keepSameSize = false) => {
		if (keepSameSize) objects.shift();
		let obj = new Particle(true);
		obj.setNewParticleObject(true);
		obj.xCenter = mouseX;
		obj.yCenter = mouseY;
		objects.push(obj);
	}

	let addParticles = () => {
		for (i = 0; i < PARTICLES_COUNT; i++) {
			obj = new Particle(false);
			objects.push(obj);
		}
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
		addParticles();
		addEvents();
		drawBackground(ctx, canvas);
		window.requestAnimationFrame(loop)
	}

	let draw = () => {
		drawBackground(ctx, canvas);

		for (i = 0; i < PARTICLES_COUNT; i++) {
			objects[i].update();

			if (objects[i].notFirstTime) {
				switch (objects[i].shape) {
					case Figures.Circle:
						Utils.drawCircle(ctx, objects[i].xMovement, objects[i].yCenter, objects[i].getDiameter(), objects[i].getColor(), objects[i].getColor());
						break;
					case Figures.Square:
						Utils.drawSquare(ctx, objects[i].xMovement, objects[i].yCenter, objects[i].getDiameter(), objects[i].angle, objects[i].getColor());
						break;
				}
			}
		}
	}

	let trackMouse = (mouseX, mouseY) => {
		if (clicking)
			addParticle(mouseX, mouseY, true);
	}

	let loop = (timestamp) => {
		let progress = timestamp - lastRender;

		draw();

		lastRender = timestamp;
		window.requestAnimationFrame(loop);
	}

	init();

	window.clearCanvas = () => {		
		objects = [];
		addParticles();
	}
}
