{
    const config = {
        randomize: true,
        randomSize: true,
        randomHue: true,
        hue: 20,
        radius: 20,
        gravity: 0.5,
        damping: 0.9,
        drawQuadtree: false,
        opacity: 1,
    };

    const globals = {
        random: null,
        balls: [],
        quad: null,
    }

    class Ball {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.radius = config.randomSize ? globals.random.nextInt(20, 50) : config.radius;
            this.hue = config.randomHue ? globals.random.nextInt(0, 255) : config.hue;
            this.dy =  (globals.random.next() - 0.5) * 5;
            this.dx =  (globals.random.next() - 0.5) * 5;
            this.mass = Math.pow(this.radius, 3) * Math.PI * 4 / 3;
        }

        draw = () => {
            let color = `hsl(${this.hue}, ${100}%, ${50}%)`;

			Drawing.drawCircle(ctx, this.x, this.y, this.radius, color, color);
        }

        checkCollisionsBalls = () => {
            let returnObjects = [];
        
            globals.quad.retrieve(returnObjects, this);
        
            for (const element of returnObjects) {
                let ball = element;
        
                if (ball == this)
                    continue;
        
                let catX = ball.x - this.x;
                let catY = ball.y - this.y;
                let distance = Math.sqrt(catX * catX + catY * catY);
                let minDistance = this.radius + ball.radius;
        
                if (distance < minDistance) {
                    let angle = Math.atan2(catY, catX);
                    let sin = Math.sin(angle);
                    let cos = Math.cos(angle);
        
                    let vx1 = this.dx * cos + this.dy * sin;
                    let vy1 = this.dy * cos - this.dx * sin;
                    let vx2 = ball.dx * cos + ball.dy * sin;
                    let vy2 = ball.dy * cos - ball.dx * sin;
        
                    let vx1Final = ((this.mass - ball.mass) * vx1 + 2 * ball.mass * vx2) / (this.mass + ball.mass);
                    let vx2Final = ((ball.mass - this.mass) * vx2 + 2 * this.mass * vx1) / (this.mass + ball.mass);
        
                    this.dx = vx1Final * cos - vy1 * sin;
                    this.dy = vy1 * cos + vx1Final * sin;
                    ball.dx = vx2Final * cos - vy2 * sin;
                    ball.dy = vy2 * cos + vx2Final * sin;
        
                    let overlap = minDistance - distance;
                    let correctionX = overlap * cos / 2;
                    let correctionY = overlap * sin / 2;
        
                    this.x -= correctionX;
                    this.y -= correctionY;
                    ball.x += correctionX;
                    ball.y += correctionY;

                    this.dx *= 0.9
                    this.dy *= 0.9
                    ball.dx *= 0.9
                    ball.dy *= 0.9
                }
            }
        }

        checkCollisionsWalls = () => {
            let collision = false;

            if (this.getRight() > width) {
                this.x = width - this.radius; 
                this.dx = -Math.abs(this.dx) * config.damping;    
        
                if (Math.abs(this.dx) < 1) {
                    this.dx = 0;
                }

                collision = true;
            }
        
            if (this.getLeft() < 0) {
                this.x = this.radius; 
                this.dx = Math.abs(this.dx) * config.damping;
        
                if (Math.abs(this.dx) < 1) {
                    this.dx = 0;
                }

                collision = true;
            }
        
            if (this.getBottom() > canvas.height) {
                this.y = canvas.height - this.radius; 
                this.dy = -this.dy * config.damping;
        
                if (Math.abs(this.dy) < 1) {
                    this.dy = 0;
                }

                collision = true;
            }
        
            if (this.getTop() < 0) {
                this.y = this.radius; 
                this.dy = Math.abs(this.dy) * config.damping;

                collision = true;
            }

            if (collision){
                this.dx *= 0.9
                this.dy *= 0.9
            }
        }

        move = () => {
            this.dy += config.gravity;
            this.y += this.dy;
            this.x += this.dx;

            this.dx *= config.damping;
            if (Math.abs(this.dx) < 0.15) this.dx = 0;
            if (Math.abs(this.dy) < 0.15) this.dy = 0;
        }

        getTop = () => this.y - this.radius;
        getBottom = () => this.y + this.radius;
        getLeft = () => this.x - this.radius;
        getRight = () => this.x + this.radius;
    }

    let init = () => {
        initCanvas();

        drawBackground(ctx, canvas, config.opacity);

        globals.quad = Quadtree.generateQuadtree(width, height);

		globals.random = Objects.getRandomObject();
        if (config.randomize) randomize();
        addEvents();
        window.requestAnimationFrame(loop);
    }

    let addBall = (x, y) => {
        let ball = new Ball(x, y);
        globals.balls.push(ball);

	    Sound.ping(100);
    }

    let populateQuadTree = () => {
        globals.quad.clear();
        for (const ball of globals.balls) {
            globals.quad.insert(ball);
        }
    }

    let draw = () => {
        drawBackground(ctx, canvas, config.opacity);
    }

    let addEvents = () => {
        canvas.addEventListener('click', e => {
            addBall(e.offsetX, e.offsetY);
        }, false);
    }

	let randomize = () => {
		config.randomSize = globals.random.nextBool();
		config.randomHue = globals.random.nextBool();
		config.hue = globals.random.nextInt(0, 255);
		config.radius = globals.random.nextInt(20, 50);
		config.opacity = globals.random.next(0.1, 1.0);
	}

    let loop = (timestamp) => {
        let progress = timestamp - lastRender;

        draw();

        populateQuadTree();
        
        if (config.drawQuadtree)
            globals.quad.drawQuadtree(ctx, globals.quad);

        for (const ball of globals.balls) {
            ball.move();

            ball.checkCollisionsBalls();
            ball.checkCollisionsWalls();

            ball.draw();
        }


        lastRender = timestamp;

        requestAnimationFrame(loop);
    }

    window.trackMouse = (xMouse, yMouse) => {
    }
    
	window.clearCanvas = () => {		
		globals.balls = [];
	}

	window.magic = () => {  
		Sound.error();
	}

    window.upload = () => {
		Sound.error();
    }

    init();
}
