{
	const config = {
        randomize: true,
		randomSize: true,	
		randomHue: true,		
		drawTrail: true,
		hue: 20,
		radius: 20,
		drawQuadtree: false,
        ball: null,
    };

	const globals = {
		random: null,
		ballCollection: null,
	}

    const gravity = 0.5;
    const damping = 0.7; 
    const ballRadius = 20; 

    function drawBall() {
        ctx.beginPath();
        ctx.arc(globals.ball.x, globals.ball.y, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#007bff';
        ctx.fill();
        ctx.closePath();
    }

	let init = () => {
		initCanvas();

        globals.ball = {
            x: canvas.width / 2,
            y: ballRadius,
            dy: 0 // Velocidad vertical
        };

        loop();
	}

    let draw = () => {
        drawBackground(ctx, canvas);
        drawBall();
    }


	let loop = (timestamp) => {
		let progress = timestamp - lastRender;

        globals.ball.dy += gravity;
        globals.ball.y += globals.ball.dy;

        if (globals.ball.y + ballRadius > canvas.height) {
            globals.ball.y = canvas.height - ballRadius;
            globals.ball.dy = -globals.ball.dy * damping; 

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