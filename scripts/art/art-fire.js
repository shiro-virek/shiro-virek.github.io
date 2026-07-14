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
	
	const TRAIL_LENGTH = 5;

	class Particle {
		constructor() {
			this.previous = [];
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

		getDiameter() {
			return this.life * globals.maximumDiameter / globals.maximumLife;
		}

		update(delta) {		
			if (this.previous.length >= TRAIL_LENGTH)
				this.previous.shift();
			this.previous.push({
				x: this.xMovement,
				y: this.yCenter,
				d: this.getDiameter()
			});

			this.yCenter -= this.speed * (delta / FRAME_TIME);

			if (this.sin || globals.allSin)
				this.xMovement = (globals.amplitude * (Math.sin(Trigonometry.degToRad(this.yCenter)))) + this.xCenter;
			else
				this.xMovement = (globals.amplitude * (Math.cos(Trigonometry.degToRad(this.yCenter)))) + this.xCenter;

			this.life -= 1 * (delta / FRAME_TIME);
			if (this.life <= 0) {
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
		for (let i = 0; i < globals.particlesCount; i++) {
			let obj = new Particle(false);
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

	window.draw = (delta) => {		
		drawBackground(ctx, canvas);

		for (let i = 0; i < globals.particlesCount; i++) {
			let p = globals.objects[i];
			p.update(delta);

			if (!p.notFirstTime) continue;

			let alpha = p.life / globals.maximumLife;
			let green = (p.life / 2) * 255 / globals.maximumLife;

			let trailAlpha = alpha;
			for (let j = 0; j < p.previous.length; j++) {
				let item = p.previous[j];
				trailAlpha *= 0.7;
				Drawing.drawCircle(ctx, item.x, item.y, item.d, `rgba(255,${green},0,${trailAlpha})`);
			}

			Drawing.drawCircle(ctx, p.xMovement, p.yCenter, p.getDiameter(), `rgba(255,${green},0,${alpha})`);
		}
	}

	window.trackMouse = (mouseX, mouseY) => {
		if (clicking)
			addFire(mouseX, mouseY, true);
	}

	window.clearCanvas = () => {		
		globals.objects = [];
		addParticles();
	}

    window.upload = () => {
		Sound.error();
    }
	
	init();
}
