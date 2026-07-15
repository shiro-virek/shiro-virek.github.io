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
        dotRadius : 2,
        maxRadius: 20,
        distanceTreshold: 50,
        opacity: 1,
        hue : 150,
		drawQuadtree: false,
        movementFunctions: [movementFunction1, movementFunction2, movementFunction3, movementFunction4, movementFunction5, movementFunction6],
        reactionFunctions: [reactionFunction1, reactionFunction2, reactionFunction3, reactionFunction4],
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

        draw = (ctx, delta) => {
            for (let x = 0; x < config.dotsColumns; x++) {
                for (let y = 0; y < config.dotsRows; y++) {

			        let returnObjects = [];

			        globals.mesh.quad.retrieve(returnObjects, this.dots[x][y]);

                    for (const element of returnObjects) {
                    
                        let catX = Math.abs(this.dots[x][y].x - element.x);
                        let catY = Math.abs(this.dots[x][y].y - element.y);
                        let distance = Math.sqrt(catX * catX + catY * catY);

                        if (distance < config.distanceTreshold) {
                            const reactionFunction = config.reactionFunctions[config.reactionFunctionIndex];
                                
                            reactionFunction(mouseX, mouseY, this.dots[x][y], element, distance, delta);
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
            this.radius = config.dotRadius;
            this.x = config.dotMargin + column * config.dotPadding + column * this.radius;
            this.y = config.dotMargin + row * config.dotPadding + row * this.radius;
            this.on = true;
            this.angle = globals.random.nextInt(0, 359);
            this.opacity = config.opacity;
            this.hue = config.hue;    
            this.velX = 0;
            this.velY = 0;
            this.originX = this.x;
            this.originY = this.y;            
        }

        draw = (ctx) => {
            let color = `hsla(${this.hue}, 100%, 50%, ${this.opacity})`;    

            switch(globals.mesh.shape){
                case Figures.Circle:
                    Drawing.drawCircle(ctx, this.x, this.y, this.radius, color);
                    break;
                case Figures.Square:
                    Drawing.drawSquare(ctx, this.x, this.y, this.radius, this.angle, color);
                    break;
                case Figures.Hexagon:
                    Drawing.drawPolygon(ctx, this.x, this.y, this.radius, 6, this.angle, color);
                    break;
                case Figures.Triangle:
                    Drawing.drawPolygon(ctx, this.x, this.y, this.radius, 3, this.angle, color);
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

        update = (xMouse, yMouse, delta) => {
            const movementFunction = config.movementFunctions[config.movementFunctionIndex];
        
            let result = movementFunction(xMouse, yMouse, this.x, this.y, this.angle, delta);

            this.x = result.newX;
            this.y = result.newY;

            this.checkWallCollisionBounce();
        }

        getTop = () => this.y - this.radius;
        getBottom = () => this.y + this.radius;
        getLeft = () => this.x - this.radius;
        getRight = () => this.x + this.radius;
    }

    function movementFunction1(xMouse, yMouse, originX, originY, angle, delta) {
        let factor = delta / FRAME_TIME;
        angle += (globals.random.nextBool()? 0.1 : -0.1) * factor;
        let distance = 1 * factor;
                
        return {
            newX: originX + Math.cos(angle) * distance,
            newY: originY + Math.sin(angle) * distance
        };
    }

    function movementFunction2(xMouse, yMouse, originX, originY, angle, delta) {              
        let factor = delta / FRAME_TIME;
        return {
            newX: originX + globals.random.nextRange(2, -2) * factor,
            newY: originY + globals.random.nextRange(2, -2) * factor
        };
    }

    function movementFunction3(xMouse, yMouse, originX, originY, angle, delta) {              
        let distance = 1 * (delta / FRAME_TIME);
                
        return {
            newX: originX + Math.cos(angle) * distance,
            newY: originY + Math.sin(angle) * distance
        };
    }

    function movementFunction4(xMouse, yMouse, originX, originY, angle) {              
        let distance = Trigonometry.distanceBetweenTwoPoints(xMouse, yMouse, originX, originY) * 0.005;
                
        return {
            newX: originX + Math.cos(angle) * distance,
            newY: originY + Math.sin(angle) * distance
        };
    }

    function movementFunction5(xMouse, yMouse, originX, originY, angle) {              
        let distance = Numbers.scale(Trigonometry.angleBetweenTwoPoints(xMouse, yMouse, originX, originY), 0, 359, 0.1, 4);
                
        return {
            newX: originX + Math.cos(angle) * distance,
            newY: originY + Math.sin(angle) * distance
        };
    }

    function movementFunction6(xMouse, yMouse, originX, originY, angle, delta) {   
        let factor = delta / FRAME_TIME;
        let newAngle = Trigonometry.angleBetweenTwoPoints(xMouse, yMouse, originX, originY);
        let distance = Numbers.scale(newAngle, 0, 359, 0.1, -1) * factor;           
        angle +=  Numbers.scale(newAngle, 0, 359, -3, 3) * factor;
                
        return {
            newX: originX + Math.cos(angle) * distance,
            newY: originY + Math.sin(angle) * distance
        };
    }

    function reactionFunction1(xMouse, yMouse, dot1, dot2, distance) {
        let opacity = Numbers.scale(distance, 50, 0, 0, 100);
        let color = `hsl(${config.hue}, 50%, ${opacity}%)`
        Drawing.drawLine(ctx, dot1.x, dot1.y,
                            dot2.x, dot2.y, 1, color)
    }

    function reactionFunction2 (xMouse, yMouse, dot1, dot2, distance) {
        let opacity = Numbers.scale(distance, config.distanceTreshold, 0, 1, 0.1);
        dot1.opacity = opacity;
    }

    function reactionFunction3 (xMouse, yMouse, dot1, dot2, distance) {
        dot1.radius = config.dotRadius * Numbers.scale(distance, 0, config.distanceTreshold, 0.1, 2.5);
    }

    function reactionFunction4 (xMouse, yMouse, dot1, dot2, distance, delta) {
        dot1.hue += Numbers.scale(distance, 0, config.distanceTreshold, -1, 1) * (delta / FRAME_TIME);
        if (dot1.hue < 0) dot1.hue = 359;
        if (dot1.hue > 359) dot1.hue = 0;

    }

    let init = () => {
		globals.random = Objects.getRandomObject();
        if (config.randomize) randomize();
        config.dotsRadius = globals.random.nextInt(2, config.maxRadius);
        config.dotPadding = globals.random.nextInt(30, 120)
        config.dotsRows = Math.floor(height / (config.dotRadius + config.dotPadding));
        config.dotsColumns = Math.floor(width / (config.dotRadius + config.dotPadding));
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
    
    window.draw = (delta) => {
        drawBackground(ctx, canvas);

        globals.mesh.populateQuadTree();

        if (config.drawQuadtree)
            globals.mesh.quad.drawQuadtree(ctx, globals.mesh.quad);

        for (let xi = 0; xi < config.dotsColumns; xi++) {
            for (let yi = 0; yi < config.dotsRows; yi++) {
                globals.mesh.dots[xi][yi].update(mouseX, mouseY, delta);
            }
        }       

        globals.mesh.draw(ctx, delta);
    }

    window.trackMouse = (x, y) => {
        if (clicking) {  

        }
    }
    
    window.clearCanvas = () => {
		Sound.error();
    }

    init();
}
