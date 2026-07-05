{
    const globals = {
        random: null,
        mesh: null,
    };

    const config = {
        randomize: true,
        dotsRows: 10,
        dotsColumns : 10,
        dotMargin : 30,
        dotPadding : 50,
        dotradius : 2,
        hue : 150,
		drawQuadtree: false,
        movementFunctions: [movementFunction1],
        reactionFunctions: [reactionFunction1],
    };

    const Figures = Object.freeze({
        Square: Symbol("square"),
        Circle: Symbol("circle"),
        Hexagon: Symbol("hexagon"),
        Triangle: Symbol("triangle")
    });

    class Mesh {
        constructor() {
            this.dots = [];
			this.quad = Quadtree.generateQuadtree(width, height);
            let rand = globals.random.nextInt(0, Object.keys(Figures).length - 1);
            this.shape = Figures[Object.keys(Figures)[rand]];
            this.generateDots();

        }

        generateDots = () => {
            for (let x = 0; x < config.dotsColumns; x++) {
                this.dots[x] = new Array(config.dotsRows);
            }

            for (let x = 0; x < config.dotsColumns; x++) {
                for (let y = 0; y < config.dotsRows; y++) {
                    let dot = new Dot(x, y);
                    this.dots[x][y] = dot;
                }
            }
        }

        draw = (ctx) => {
            for (let x = 0; x < config.dotsColumns; x++) {
                for (let y = 0; y < config.dotsRows; y++) {

			        let returnObjects = [];

			        globals.mesh.quad.retrieve(returnObjects, this.dots[x][y]);

                    for (const element of returnObjects) {
                    
                        let catX = Math.abs(this.dots[x][y].x - element.x);
                        let catY = Math.abs(this.dots[x][y].y - element.y);
                        let distance = Math.sqrt(catX * catX + catY * catY);

                        if (distance < 50) {
                            let opacity = Numbers.scale(distance, 50, 0, 0, 100);
                            let color = `hsl(${config.hue}, 50%, ${opacity}%)`
                            Drawing.drawLine(ctx, this.dots[x][y].x, this.dots[x][y].y,
                                             element.x, element.y, 1, color)
                        }
                    }

                    this.dots[x][y].draw(ctx);
                }
            }
        }

        populateQuadTree = () => {
			this.quad.clear();
			for (let x = 0; x < config.dotsColumns; x++) {
				for (let y = 0; y < config.dotsRows; y++) {
					this.quad.insert(this.dots[x][y]);
				}
			}
		}
    }

    class Dot {
        constructor(column, row) {
            this.radius = config.dotradius;
            this.x = config.dotMargin + column * config.dotPadding + column * this.radius;
            this.y = config.dotMargin + row * config.dotPadding + row * this.radius;
            this.on = true;
            this.angle = globals.random.nextInt(0, 359);
            this.color = `hsl(${config.hue}, 100%, 50%)`;        
            this.velX = 0;
            this.velY = 0;
            this.originX = this.x;
            this.originY = this.y;
        }

        draw = (ctx) => {
            switch(globals.mesh.shape){
                case Figures.Circle:
                    Drawing.drawCircle(ctx, this.x, this.y, this.radius, this.color);
                    break;
                case Figures.Square:
                    Drawing.drawSquare(ctx, this.x, this.y, this.radius, this.angle, this.color);
                    break;
                case Figures.Hexagon:
                    Drawing.drawPolygon(ctx, this.x, this.y, this.radius, 6, this.angle, this.color);
                    break;
                case Figures.Triangle:
                    Drawing.drawPolygon(ctx, this.x, this.y, this.radius, 3, this.angle, this.color);
                    break;
            }
        }

        checkWallCollisionBounce() {
            if (this.x - this.radius <= 0){
                this.x = this.radius + 10;
                this.angle += 3.14;

            }
            if (this.x + this.radius >= width) {
                this.x = width - this.radius - 10;
                this.angle += 3.14;

            }
            if (this.y - this.radius <= 0) {
                this.y = this.radius + 10;
                this.angle += 3.14;

            }
            if (this.y + this.radius >= height) {
                this.y = height - this.radius - 10;
                this.angle += 3.14;
            }
        
        }

        update = (xMouse, yMouse) => {
            const movementFunction = config.movementFunctions[config.movementFunctionIndex];
        
            let result = movementFunction(xMouse, yMouse, this.x, this.y, this.angle);

            this.x = result.newX;
            this.y = result.newY;

            this.checkWallCollisionBounce();
        }

        getTop = () => this.y - this.radius;
        getBottom = () => this.y + this.radius;
        getLeft = () => this.x - this.radius;
        getRight = () => this.x + this.radius;
    }

    function movementFunction1(xMouse, yMouse, originX, originY, angle) {
        angle += globals.random.nextBool()? 0.1 : -0.1;
        let distance = 1;
                
        return {
            newX: originX + Math.cos(angle) * distance,
            newY: originY + Math.sin(angle) * distance
        };
    }


    function reactionFunction1(xMouse, yMouse, originX, originY) {
        let deltaX = xMouse - originX; 
        let deltaY = yMouse - originY;

        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const angle = Math.atan2(deltaY, deltaX);
            
        return {
            newX: originX + Numbers.scale(Math.cos((originX + xMouse) * Trigonometry.RAD_CONST), -1, 1, -config.maxRadius, config.maxRadius),
            newY: originY + Numbers.scale(Math.sin((originY + yMouse) * Trigonometry.RAD_CONST), -1, 1, -config.maxRadius, config.maxRadius)
        };
    }


    let init = () => {
        config.dotsRows = Math.floor(height / (config.dotradius + config.dotPadding));
        config.dotsColumns = Math.floor(width / (config.dotradius + config.dotPadding));
		globals.random = Objects.getRandomObject();
        if (config.randomize) randomize();
        globals.mesh = new Mesh();
        initCanvas();
        addEvents();
        window.requestAnimationFrame(loop);
    }

    let addEvents = () => {
    }

    let randomize = () => {
        config.movementFunctionIndex = globals.random.nextInt(0, config.movementFunctions.length - 1);
        config.reactionFunctionIndex = globals.random.nextInt(0, config.reactionFunctions.length - 1);
        config.hue = globals.random.nextInt(0, 360);
    }
    
    window.draw = () => {
        drawBackground(ctx, canvas);

        globals.mesh.populateQuadTree();

        if (config.drawQuadtree)
            globals.mesh.quad.drawQuadtree(ctx, globals.mesh.quad);

        for (let xi = 0; xi < config.dotsColumns; xi++) {
            for (let yi = 0; yi < config.dotsRows; yi++) {
                globals.mesh.dots[xi][yi].update(mouseX, mouseY);
            }
        }       

        globals.mesh.draw(ctx);
    }

    window.trackMouse = (x, y) => {
        if (clicking) {  

        }
    }
    
    window.clearCanvas = () => {
		Sound.error();
    }

	window.magic = () => {  
		Sound.error();
	}

    window.upload = (e) => {
		Sound.error();        
    }

    init();
}
