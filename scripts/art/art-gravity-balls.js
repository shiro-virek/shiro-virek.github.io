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
            this.dx = 0;
            this.mass = Math.pow(this.radius, 3) * Math.PI * 4 / 3;
        }

        draw = () => {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#007bff';
            ctx.fill();
            ctx.closePath();
        }

        checkCollisionsBalls() {
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
                }
            }
        }

        checkCollisionsWalls() {
            if ((this.getRight() > width)) {
                this.dx = -Math.abs(this.dx) * config.damping;

                if (Math.abs(this.dx) < 1) {
                    this.dx = 0;
                }
            }

            if (this.getLeft() < 0) {
                this.dx = Math.abs(this.dx) * config.damping;

                if (Math.abs(this.dx) < 1) {
                    this.dx = 0;
                }
            }

            if (this.getBottom() > canvas.height) {
                this.y = canvas.height - this.radius;
                this.dy = -this.dy * config.damping;

                if (Math.abs(this.dy) < 1) {
                    this.dy = 0;
                }
            }

            if ((this.getTop() < 0)) {
                this.dy = Math.abs(this.dy) * config.damping;
            }

        }

        move = () => {
            this.dy += config.gravity;
            this.y += this.dy;
            this.x += this.dx;

            // Aplicar amortiguamiento en el eje X
            this.dx *= config.damping;
            if (Math.abs(this.dx) < 0.1) this.dx = 0;
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
        ball.dx = (Math.random() - 0.5) * 5; // Velocidad inicial en X
        ball.dy = (Math.random() - 0.5) * 5; // Velocidad inicial en Y
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
            ball.move();

            ball.checkCollisionsBalls();
            ball.checkCollisionsWalls();

            ball.draw();
        }

        populateQuadTree();

        lastRender = timestamp;

        requestAnimationFrame(loop);
    }

    init();
}