{
	const config = {
        randomize: true,
		randomSize: true,	
		randomHue: true,		
		drawTrail: true,
		hue: 20,
		radius: 20,
		drawQuadtree: false,
		opacity: 1,
    };

	const globals = {
		random: null,
		ballCollection: null,
	}

	class Ball {
		constructor(x, y) {
			this.x = x;
			this.y = y;
			this.radius = config.randomSize ? globals.random.nextInt(5, 50) : config.radius;
			this.mass = this.radius * 2;
			this.speedY = globals.random.nextRange(1, 5);
			this.speedX = globals.random.nextRange(1, 5);
			this.hue = config.randomHue ? globals.random.nextInt(0, 255) : config.hue;
		}

		draw = (ctx) => {
			let value = Numbers.scale(Math.abs(this.speedX) + Math.abs(this.speedY), 0, 10, 0, 100);
			let color = `hsl(${this.hue}, ${100}%, ${value}%)`;

			if (config.drawTrail){
				let angle = Trigonometry.angleBetweenTwoPoints(this.prevX, this.prevY, this.x, this.y);
				let distance = Trigonometry.distanceBetweenTwoPoints(this.x, this.y, this.prevX, this.prevY);

				for (let index = 1; index < 5; index++) {

					let color2 = `hsl(${this.hue}, ${100}%, ${value}%, ${1.0 / index})`;

					let trailPoint = Trigonometry.polarToCartesian(distance + ((index - 1) * 5), angle * Trigonometry.RAD_CONST);

					Drawing.drawCircle(ctx, this.x - trailPoint.x, this.y - trailPoint.y, this.radius * (1.0 - (index / 30)), color2, color2);
				}
			}

			Drawing.drawCircle(ctx, this.x, this.y, this.radius, color, color);
		}

		move() {
			this.prevX = this.x;
			this.prevY = this.y;
			this.x += this.speedX;
			this.y += this.speedY;
		}

		checkCollisionsBalls() {
			let returnObjects = [];

			globals.ballCollection.quad.retrieve(returnObjects, this);

			for (const element of returnObjects) {
				let ball = element;

				if (ball == this)
					continue;

				let newVelX1 = 0;
				let newVelY1 = 0;
				let newVelX2 = 0;
				let newVelY2 = 0;
				let catX = Math.abs(ball.x - this.x);
				let catY = Math.abs(ball.y - this.y);
				let distance = Math.sqrt(catX * catX + catY * catY);

				if (distance < ball.radius + this.radius) {
					newVelX1 = (this.speedX * (this.mass - ball.mass) + (2 * ball.mass * ball.speedX)) / (this.mass + ball.mass);
					newVelY1 = (this.speedY * (this.mass - ball.mass) + (2 * ball.mass * ball.speedY)) / (this.mass + ball.mass);

					newVelX2 = (ball.speedX * (ball.mass - this.mass) + (2 * this.mass * this.speedX)) / (ball.mass + this.mass);
					newVelY2 = (ball.speedY * (ball.mass - this.mass) + (2 * this.mass * this.speedY)) / (ball.mass + this.mass);

					this.x += newVelX1;
					this.y += newVelY1;
					ball.x += newVelX2;
					ball.y += newVelY2;

					this.speedX = newVelX1;
					this.speedY = newVelY1;
					ball.speedX = newVelX2;
					ball.speedY = newVelY2;
				
					Sound.ping(1000);
				}
			}
		}

		checkCollisionsWalls() {
			let collision = false;

			if ((this.getRight() > width)) {
				this.speedX = -Math.abs(this.speedX);
				collision = true
			}

			if (this.getLeft() < 0) {
				this.speedX = Math.abs(this.speedX);
				collision = true
			}

			if ((this.getBottom() > height)) {
				this.speedY = -Math.abs(this.speedY);
				collision = true;
			}

			if ((this.getTop() < 0)) {
				this.speedY = Math.abs(this.speedY);
				collision = true;
			}

			if (collision) Sound.ping(200);

			if (this.speedX > 0 && this.speedX < 1) this.speedX = 1;
			if (this.speedY > 0 && this.speedY < 1) this.speedY = 1;
		}


		getTop = () => this.y - this.radius;
		getBottom = () => this.y + this.radius;
		getLeft = () => this.x - this.radius;
		getRight = () => this.x + this.radius;
	}

	class BallCollection {
		constructor() {
			this.balls = [];
			this.quad = Quadtree.generateQuadtree(width, height);
		}

		drawBalls = (ctx) => {
			for (const ball of globals.ballCollection.balls) {
				ball.move();
				ball.checkCollisionsBalls();
				ball.checkCollisionsWalls();
				ball.draw(ctx);
			}
		}

		addBall = (x, y) => {
			let ball = new Ball(x, y);

			globals.ballCollection.balls.push(ball);

			Sound.ping(100);
		}

		populateQuadTree = () => {
			this.quad.clear();
			for (const ball of globals.ballCollection.balls) {
				this.quad.insert(ball);
			}
		}

		draw = (ctx) => {
			if (this.balls.length > 0) {
				if (config.drawQuadtree)
					this.quad.drawQuadtree(ctx, this.quad);
				this.drawBalls(ctx);
				this.populateQuadTree();
			}
		}
	}

	let init = () => {
		initCanvas();
		
        drawBackground(ctx, canvas, config.opacity);

		globals.ballCollection = new BallCollection()
		globals.random = Objects.getRandomObject();
		if (config.randomize) randomize();
		addEvents();
		window.requestAnimationFrame(loop);
	}

	let addEvents = () => {
		canvas.addEventListener('click', e => {
			globals.ballCollection.addBall(e.offsetX, e.offsetY);
		}, false);
	}

	let randomize = () => {
		config.drawTrail = globals.random.nextBool();
		config.randomSize = globals.random.nextBool();
		config.randomHue = globals.random.nextBool();
		config.hue = globals.random.nextInt(0, 255);
		config.radius = globals.random.nextInt(5, 25);
		config.opacity = globals.random.next(0.1, 1.0);
	}

	window.draw = () => {
		drawBackground(ctx, canvas, config.opacity);
		globals.ballCollection.draw(ctx);
	}

    window.trackMouse = (xMouse, yMouse) => {
    }

	window.clearCanvas = () => {		
		globals.ballCollection = new BallCollection();
	}

	window.magic = () => {  
		Sound.error();
	}

    window.upload = () => {
		Sound.error();
    }

	init();
}
