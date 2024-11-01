{
	let PARTICLES_COUNT = 500;
	let MINIMUM_LIFE = 20;
	let MAXIMUM_LIFE = 100;
	let MINIMUM_DIAMETER = 5;
	let MAXIMUM_DIAMETER = 15;
	let AMPLITUDE = 50;
	let ALL_SIN = false;

	let objects = [];
	let clicking = false;
	
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

	class Particle {
		constructor() {
			this.setNewFireObject();
		}

		setNewFireObject(notFirstTime) {
			this.notFirstTime = notFirstTime;
			this.sin = Utils.getRandomBool();
			this.yCenter = height + 100 - Utils.getRandomInt(1, 50);
			this.diameter = MAXIMUM_DIAMETER;
			this.radius = this.diameter / 2;
			this.speed = 5;
			this.life = Utils.getRandomInt(MINIMUM_LIFE, MAXIMUM_LIFE);
			this.xCenter = Utils.getRandomInt(1, width);
		}

		getColor() {
			let alpha = this.life * 255 / MAXIMUM_LIFE;
			let green = (this.life / 2) * 255 / MAXIMUM_LIFE;
			let col = new Color(255, green, 0, alpha);
			return col;
		}

		getDiameter() {
			return this.life * MAXIMUM_DIAMETER / MAXIMUM_LIFE;
		}

		update() {
			this.yCenter -= this.speed;

			if (this.sin || ALL_SIN)
				this.xMovement = (AMPLITUDE * (Math.sin(Utils.degToRad(this.yCenter)))) + this.xCenter; //float
			else
				this.xMovement = (AMPLITUDE * (Math.cos(Utils.degToRad(this.yCenter)))) + this.xCenter; //float


			if (this.life > 0)
				this.life--;
			else {
				this.setNewFireObject(true);
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

	let addFire = (mouseX, mouseY, keepSameSize = false) => {
		if (keepSameSize) objects.shift();
		let obj = new Particle(true);
		obj.setNewFireObject(true);
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

			if (objects[i].notFirstTime)
				Utils.drawCircle(ctx, objects[i].xMovement, objects[i].yCenter, objects[i].getDiameter(), objects[i].getColor().getRGBA(), objects[i].getColor().getRGBA());
		}
	}

	let trackMouse = (mouseX, mouseY) => {
		if (clicking)
			addFire(mouseX, mouseY, true);
	}

	let loop = (timestamp) => {
		let progress = timestamp - lastRender;

		draw();

		lastRender = timestamp;
		window.requestAnimationFrame(loop);
	}

	init();
}
