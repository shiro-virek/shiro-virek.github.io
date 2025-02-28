{
	const config = {
        randomize: true,
		randomSize: true,	
		randomHue: true,		
		drawTrail: true,
		hue: 20,
		radius: 20,        
        gravity: 0.5,
        damping: 0.7, 
        ballRadius: 20, 
		drawQuadtree: true,
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
			this.radius = config.radius;
            this.dy = 0;

		}

        draw = () => {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#007bff';
            ctx.fill();
            ctx.closePath();
        }

        getTop = () => this.y - this.radius;
		getBottom = () => this.y + this.radius;
		getLeft = () => this.x - this.radius;
		getRight = () => this.x + this.radius;
    }

	let init = () => {
		initCanvas();

        globals.quad = Quadtree.generateQuadtree(width, height);

        let ball = new Ball(canvas.width / 2, config.ballRadius);
        globals.balls.push(ball);     

        addEvents();
		window.requestAnimationFrame(loop);
	}

    let addBall = (x, y) => {
        let ball = new Ball(x, y);

        globals.balls.push(ball);
    }

    let populateQuadTree = () => {
        globals.quad.clear();
        for (const ball of globals.balls) {
            globals.quad.insert(ball);
        }
    }

    let draw = () => {
        drawBackground(ctx, canvas);
    }

	let addEvents = () => {
		canvas.addEventListener('click', e => {
			addBall(e.offsetX, e.offsetY);
		}, false);
	}

	let loop = (timestamp) => {
		let progress = timestamp - lastRender;

        draw();

        if (config.drawQuadtree)
            globals.quad.drawQuadtree(ctx, globals.quad);

        for (const ball of globals.balls) {
            ball.dy += config.gravity;
            ball.y += ball.dy;
    
            if (ball.y + ball.radius > canvas.height) {
                ball.y = canvas.height - ball.radius;
                ball.dy = -ball.dy * config.damping; 
    
                if (Math.abs(ball.dy) < 1) {
                    ball.dy = 0;
                }
            }

            ball.draw();
        }
        
		populateQuadTree();

		lastRender = timestamp;
		
        requestAnimationFrame(loop);
	}

	init();

}