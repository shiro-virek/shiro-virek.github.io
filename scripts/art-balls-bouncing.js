{

	let DRAW_QUADTREE = false;
	
	let hue = 20;
	let radius = 20;
	let ballCollection;

	class Ball {
		constructor(x, y) {
			this.x = x;
			this.y = y;
			this.radius = radius;
			this.mass = this.radius * 2;
			this.speedY = Utils.getRandomFloat(1, 5, 2);
			this.speedX = Utils.getRandomFloat(1, 5, 2);
		}

		draw = (ctx) => {
			let value = Utils.scale(Math.abs(this.speedX) + Math.abs(this.speedY), 0, 10, 0, 100);
			let color = `hsl(${hue}, ${100}%, ${value}%)`;

			let angle = Utils.angleBetweenTwoPoints(this.prevX, this.prevY, this.x, this.y);
			let distance = Utils.distanceBetweenTwoPoints(this.x, this.y, this.prevX, this.prevY);

			for (let index = 1; index < 5; index++) {

				let color2 = `hsl(${hue}, ${100}%, ${value}%, ${1.0 / index})`;

				let trailPoint = Utils.polarToCartesian(distance + ((index - 1) * 5), angle * RAD_CONST);

				Utils.drawCircle(ctx, this.x - trailPoint.x, this.y - trailPoint.y, this.radius * (1.0 - (index / 30)), color2, color2);
			}

			Utils.drawCircle(ctx, this.x, this.y, this.radius, color, color);
		}

		move() {
			this.prevX = this.x;
			this.prevY = this.y;
			this.x += this.speedX;
			this.y += this.speedY;
		}

		checkCollisionsBalls() {
			let returnObjects = [];

			ballCollection.quad.retrieve(returnObjects, this);

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
				}
			}


		}

		checkCollisionsWalls() {
			if ((this.getRight() > width)) {
				this.speedX = -Math.abs(this.speedX);
			}

			if (this.getLeft() < 0) {
				this.speedX = Math.abs(this.speedX);
			}

			if ((this.getBottom() > height)) {
				this.speedY = -Math.abs(this.speedY);
			}

			if ((this.getTop() < 0)) {
				this.speedY = Math.abs(this.speedY);
			}

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
			for (const ball of ballCollection.balls) {
				ball.move();
				ball.checkCollisionsBalls();
				ball.checkCollisionsWalls();
				ball.draw(ctx);
			}
		}

		addBall = (x, y) => {
			let ball = new Ball(x, y);

			ballCollection.balls.push(ball);
		}

		populateQuadTree = () => {
			this.quad.clear();
			for (const ball of ballCollection.balls) {
				this.quad.insert(ball);
			}
		}

		draw = (ctx) => {
			if (this.balls.length > 0) {
				if (DRAW_QUADTREE)
					this.quad.drawQuadtree(ctx, this.quad);
				this.drawBalls(ctx);
				this.populateQuadTree();
			}
		}
	}

	let init = () => {
		initCanvas();
		ballCollection = new BallCollection()
		randomize();
		addEvents();
		window.requestAnimationFrame(loop);
	}

	let addEvents = () => {
		canvas.addEventListener('click', e => {
			ballCollection.addBall(e.offsetX, e.offsetY);
		}, false);
	}

	let randomize = () => {
		hue = Utils.getRandomInt(0, 255);
		radius = Utils.getRandomInt(5, 25);
	}

	let draw = () => {
		drawBackground(ctx, canvas);
		ballCollection.draw(ctx);
	}

	let loop = (timestamp) => {
		let progress = timestamp - lastRender;

		draw();

		lastRender = timestamp;
		window.requestAnimationFrame(loop);
	}

	init();
}
