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
        ball: null,
	}

    function drawBall() {
        ctx.beginPath();
        ctx.arc(globals.ball.x, globals.ball.y, config.ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#007bff';
        ctx.fill();
        ctx.closePath();
    }

	let init = () => {
		initCanvas();

        globals.ball = {
            x: canvas.width / 2,
            y: config.ballRadius,
            dy: 0
        };
        
		window.requestAnimationFrame(loop);
	}

    let draw = () => {
        drawBackground(ctx, canvas);
        drawBall();
    }

	let loop = (timestamp) => {
		let progress = timestamp - lastRender;

        globals.ball.dy += config.gravity;
        globals.ball.y += globals.ball.dy;

        if (globals.ball.y + config.ballRadius > canvas.height) {
            globals.ball.y = canvas.height - config.ballRadius;
            globals.ball.dy = -globals.ball.dy * config.damping; 

            if (Math.abs(globals.ball.dy) < 1) {
                globals.ball.dy = 0;
            }
        }

        draw();

		lastRender = timestamp;
		
        if (globals.ball.dy !== 0) {
            requestAnimationFrame(loop);
        }
	}

	init();

}