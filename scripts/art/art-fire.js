{
    const globals = {
		random: null,
		objects: [],
    };

	const config = {
        randomize: true,
		particlesCount: 300,
		minimumLife: 20,
		maximumLife: 100,
		minimumDiameter: 5,
		maximumDiameter: 15,
		amplitude: 50,
		allSin: false,
	};
	
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
			this.diameter = globals.maximumDiameter;
			this.radius = this.diameter / 2;
			this.speed = 5;
			this.life = globals.random.nextInt(globals.minimumLife, globals.maximumLife);
			this.xCenter = globals.random.nextInt(1, width);
		}

		getColor() {
			let alpha = this.life / globals.maximumLife;
			let green = (this.life / 2) * 255 / globals.maximumLife;
			let col = new Color(255, green, 0, alpha);
			return col;
		}

		getDiameter() {
			return this.life * globals.maximumDiameter / globals.maximumLife;
		}

		update() {		
			if (this.previous.length > 5)	
				this.previous.pop();
			let copy = Objects.cloneWithMethods(this);
			copy.previous = [];
			this.previous.unshift(copy);

			this.yCenter -= this.speed;

			if (this.sin || globals.allSin)
				this.xMovement = (globals.amplitude * (Math.sin(Trigonometry.degToRad(this.yCenter)))) + this.xCenter; //float
			else
				this.xMovement = (globals.amplitude * (Math.cos(Trigonometry.degToRad(this.yCenter)))) + this.xCenter; //float

			if (this.life > 0)
				this.life--;
			else {
				this.setNewFireObject(true);
			}
		}
	}

	let randomize = () => {
		globals.random = Objects.getRandomObject();
		globals.particlesCount = globals.random.nextInt(50, screen.height * screen.width / 2000);
		globals.minimumLife = globals.random.nextInt(10, 90)
		globals.maximumLife = globals.random.nextInt(100, 200);
		globals.minimumDiameter = globals.random.nextInt(1, 10);
		globals.maximumDiameter = globals.random.nextInt(12, 20);
		globals.amplitude = globals.random.nextInt(10, 100);
		globals.allSin = globals.random.nextBool();
	}

	let addFire = (mouseX, mouseY, keepSameSize = false) => {
		if (keepSameSize) globals.objects.shift();
		let obj = new Particle(true);
		obj.setNewFireObject(true);
		obj.xCenter = mouseX;
		obj.yCenter = mouseY;
		globals.objects.push(obj);
	}

	let addParticles = () => {
		for (i = 0; i < globals.particlesCount; i++) {
			obj = new Particle(false);
			globals.objects.push(obj);
		}
	}

	let addEvents = () => {
	}

	let init = () => {
		initCanvas();		
        if (config.randomize) randomize();
		addParticles();
		addEvents();
		drawBackground(ctx, canvas);
		window.requestAnimationFrame(loop)
	}

	let draw = () => {		
		drawBackground(ctx, canvas);

		for (i = 0; i < globals.particlesCount; i++) {
			globals.objects[i].update();

			let color = globals.objects[i].getColor()

			if (globals.objects[i].notFirstTime){
				let color2 = Objects.cloneWithMethods(color);
				
				globals.objects[i].previous.forEach(function (item) {	
					color2.alpha *= 0.7;
					Drawing.drawCircle(ctx, item.xMovement, item.yCenter, item.getDiameter(), color2.getRGBA(), color2.getRGBA());
				});
				

				Drawing.drawCircle(ctx, globals.objects[i].xMovement, globals.objects[i].yCenter, globals.objects[i].getDiameter(), color.getRGBA(), color.getRGBA());
			}				
		}
	}

	window.trackMouse = (mouseX, mouseY) => {
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
		globals.objects = [];
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
