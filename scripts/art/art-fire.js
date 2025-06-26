{
    const globals = {
		random: null
    };

	let PARTICLES_COUNT = 300;
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
			this.previous = [];
			this.notFirstTime = notFirstTime;
			this.sin = globals.random.nextBool();
			this.yCenter = height + 100 - globals.random.nextInt(1, 50);
			this.diameter = MAXIMUM_DIAMETER;
			this.radius = this.diameter / 2;
			this.speed = 5;
			this.life = globals.random.nextInt(MINIMUM_LIFE, MAXIMUM_LIFE);
			this.xCenter = globals.random.nextInt(1, width);
		}

		getColor() {
			let alpha = this.life / MAXIMUM_LIFE;
			let green = (this.life / 2) * 255 / MAXIMUM_LIFE;
			let col = new Color(255, green, 0, alpha);
			return col;
		}

		getDiameter() {
			return this.life * MAXIMUM_DIAMETER / MAXIMUM_LIFE;
		}

		update() {		
			if (this.previous.length > 5)	
				this.previous.pop();
			let copy = Objects.cloneWithMethods(this);
			copy.previous = [];
			this.previous.unshift(copy);

			this.yCenter -= this.speed;

			if (this.sin || ALL_SIN)
				this.xMovement = (AMPLITUDE * (Math.sin(Trigonometry.degToRad(this.yCenter)))) + this.xCenter; //float
			else
				this.xMovement = (AMPLITUDE * (Math.cos(Trigonometry.degToRad(this.yCenter)))) + this.xCenter; //float

			if (this.life > 0)
				this.life--;
			else {
				this.setNewFireObject(true);
			}
		}
	}

	let randomize = () => {
		globals.random = Objects.getRandomObject();
		PARTICLES_COUNT = globals.random.nextInt(50, screen.height * screen.width / 2000);
		MINIMUM_LIFE = globals.random.nextInt(10, 90)
		MAXIMUM_LIFE = globals.random.nextInt(100, 200);
		MINIMUM_DIAMETER = globals.random.nextInt(1, 10);
		MAXIMUM_DIAMETER = globals.random.nextInt(12, 20);
		AMPLITUDE = globals.random.nextInt(10, 100);
		ALL_SIN = globals.random.nextBool();
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

			let color = objects[i].getColor()

			if (objects[i].notFirstTime){
				let color2 = Objects.cloneWithMethods(color);
				
				objects[i].previous.forEach(function (item) {	
					color2.alpha *= 0.7;
					Drawing.drawCircle(ctx, item.xMovement, item.yCenter, item.getDiameter(), color2.getRGBA(), color2.getRGBA());
				});
				

				Drawing.drawCircle(ctx, objects[i].xMovement, objects[i].yCenter, objects[i].getDiameter(), color.getRGBA(), color.getRGBA());
			}				
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

	window.clearCanvas = () => {		
		objects = [];
		addParticles();
	}

	window.magic = () => {  
		Sound.error();
	}

    window.upload = () => {
		Sound.error();
    }
	
	init();
}
