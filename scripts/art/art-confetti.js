{
    const globals = {
		random: null,
		objects: [],
    };

    const config = { 
        randomize: true,
		particlesCount: 500,
		minimumLife: 20,
		maximumLife: 100,
		minimumDiameter: 5,
		maximumDiameter: 15,
		minimumSpeed: 5,
		maximumSpeed: 10,
		amplitude: 50,
		allSin: false,
    };

	const Figures = Object.freeze({
		Square: Symbol("square"),
		Circle: Symbol("circle"),
        Hexagon: Symbol("hexagon"),
	});

	class Particle {
		constructor() {
			this.setNewParticleObject();
		}

		setNewParticleObject(notFirstTime) {
			this.notFirstTime = notFirstTime;
			this.sin = globals.random.nextBool();
			this.yCenter = -100 + globals.random.nextInt(1, 50);
			this.diameter = config.maximumDiameter;
			this.radius = this.diameter / 2;
			this.speed = globals.random.nextInt(1, config.maximumSpeed);
			this.life = globals.random.nextInt(config.minimumLife, config.maximumLife);
			this.xCenter = globals.random.nextInt(1, width);
			var rand = globals.random.nextInt(0, Object.keys(Figures).length - 1);
			this.shape = Figures[Object.keys(Figures)[rand]];
			this.hue = globals.random.nextInt(0, 255);
			this.angle = globals.random.nextInt(0, 360);
		}

		getColor() {
			let alpha = this.life / config.maximumLife;
			let hue = this.life * 3 * this.hue / config.maximumLife;
			let saturation = this.life * 100 / (config.maximumLife * 3);
			let light = this.life * 100 / (config.maximumLife * 3);
			return `hsl(${hue}, ${saturation}%, ${light}%, ${alpha})`;
		}

		getDiameter() {
			return this.life * config.maximumDiameter / config.maximumLife;
		}

		update() {
			this.yCenter += this.speed;

			if (this.sin || config.allSin)
				this.xMovement = (config.amplitude * (Math.sin(Trigonometry.degToRad(this.yCenter)))) + this.xCenter; //float
			else
				this.xMovement = (config.amplitude * (Math.cos(Trigonometry.degToRad(this.yCenter)))) + this.xCenter; //float

			this.angle++;

			if (this.life > 0)
				this.life--;
			else {
				this.setNewParticleObject(true);
			}
		}
	}

	let randomize = () => {
		globals.random = Objects.getRandomObject();

		config.particlesCount = globals.random.nextInt(50, screen.height * screen.width / 1000);
		config.minimumLife = globals.random.nextInt(10, 90)
		config.maximumLife = globals.random.nextInt(100, 200);
		config.minimumDiameter = globals.random.nextInt(1, 10);
		config.maximumDiameter = globals.random.nextInt(12, 20);
		config.amplitude = globals.random.nextInt(10, 100);
		config.allSin = globals.random.nextBool();
	}

	let addParticle = (mouseX, mouseY, keepSameSize = false) => {
		if (keepSameSize) globals.objects.shift();
		let obj = new Particle(true);
		obj.setNewParticleObject(true);
		obj.xCenter = mouseX;
		obj.yCenter = mouseY;
		globals.objects.push(obj);
	}

	let addParticles = () => {
		for (i = 0; i < config.particlesCount; i++) {
			obj = new Particle(false);
			globals.objects.push(obj);
		}
	}

	let addEvents = () => {
	}

	let init = () => {
		Browser.setTitle('Confetti');  
		initCanvas();
		if (config.randomize) randomize();
		addParticles();
		addEvents();
		drawBackground(ctx, canvas);
		window.requestAnimationFrame(loop)
	}

	window.draw = () => {
		drawBackground(ctx, canvas);

		for (i = 0; i < config.particlesCount; i++) {
			globals.objects[i].update();

			if (globals.objects[i].notFirstTime) {
				switch (globals.objects[i].shape) {
					case Figures.Circle:
						Drawing.drawCircle(ctx, globals.objects[i].xMovement, globals.objects[i].yCenter, globals.objects[i].getDiameter(), globals.objects[i].getColor());
						break;
					case Figures.Square:
						Drawing.drawSquare(ctx, globals.objects[i].xMovement, globals.objects[i].yCenter, globals.objects[i].getDiameter(), globals.objects[i].angle, globals.objects[i].getColor());
						break;
					case Figures.Hexagon:
						Drawing.drawPolygon(ctx, globals.objects[i].xMovement, globals.objects[i].yCenter, globals.objects[i].getDiameter(), 6, globals.objects[i].angle, globals.objects[i].getColor());
						break;
				}
			}
		}
	}

	window.trackMouse = (mouseX, mouseY) => {
		if (clicking)
			addParticle(mouseX, mouseY, true);
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
