{
	const config = {
        randomize: true,
		randomSize: true,	
		randomHue: true,		
		drawTrail: true,
		hue: 20,
		radius: 20,
		drawQuadtree: false,        
        gravity: 0.5,
        damping: 0.7, 
        ballRadius: 20, 
    };

	const globals = {
		random: null,
        balls: [],
	}

    class Ball {
        constructor(x, y) {
			this.x = x;
			this.y = y;
			this.radius = 20;
            this.dy = 0;

		}

        draw = () => {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#007bff';
            ctx.fill();
            ctx.closePath();
        }
    }

  

	let init = () => {
		initCanvas();

        let ball = new Ball(canvas.width / 2, config.ballRadius);

        globals.balls.push(ball);     
        
		window.requestAnimationFrame(loop);
	}

    let draw = () => {
        drawBackground(ctx, canvas);
    }

	let loop = (timestamp) => {
		let progress = timestamp - lastRender;

        draw();

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
        
		lastRender = timestamp;
		
        requestAnimationFrame(loop);
	}

	init();

}