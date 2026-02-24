{
    const globals = {
        random: null,
        mesh: null,
    };

    const config = {
        randomize: true,
        dotsRows: 50,
        dotsColumns : 50,
        dotMargin : 30,
        dotPadding : 20,
        dotRadio : 10,
        hue : 150,
        maxRadius: 100,
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
			let rand = globals.random.nextInt(0, Object.keys(Figures).length - 1);  
			this.shape = Figures[Object.keys(Figures)[rand]];
            this.generateDots();
        }

        generateDots = () => {
            for (let x = 0; x <= config.dotsColumns; x++) {
                this.dots[x] = new Array(config.dotsRows);
            }

            for (let x = 0; x <= config.dotsColumns; x++) {
                for (let y = 0; y <= config.dotsRows; y++) {
                    let dot = new Dot(x, y);
                    this.dots[x][y] = dot;
                }
            }
        }

        draw = (ctx) => {
            for (let x = 0; x <= config.dotsColumns; x++) {
                for (let y = 0; y <= config.dotsRows; y++) {
                    this.dots[x][y].draw(ctx);
                }
            }
        }
    }

    class Dot {
        constructor(column, row) {
            this.radio = config.dotRadio;
            this.row = row;
            this.column = column;
            this.x = config.dotMargin + column * config.dotPadding + column * this.radio;
            this.y = config.dotMargin + row * config.dotPadding + row * this.radio;
            this.on = true;
            this.color = `hsl(${0}, 0%, 50%)`;
            this.velX = 0;
            this.velY = 0;
            this.targetX = 0;
            this.targetY = 0; 
            this.originX = this.x;
            this.originY = this.y;
        }

        draw = (ctx) => {
            switch(globals.mesh.shape){ 
                case Figures.Circle:
                    Drawing.drawCircle(ctx, this.x, this.y, this.radio, this.color);
                    break;
                case Figures.Square:             
                    Drawing.drawSquare(ctx, this.x, this.y, this.radio, this.angle, this.color);
                    break; 
                case Figures.Hexagon:                    
                    Drawing.drawPolygon(ctx, this.x, this.y, this.radio, 6, this.angle, this.color);
                    break;
                case Figures.Triangle:                    
                    Drawing.drawPolygon(ctx, this.x, this.y, this.radio, 3, this.angle, this.color);
                    break;
            }
        }

        update = (xMouse, yMouse) => {

            let deltaX = xMouse - this.originX; 
            let deltaY = yMouse - this.originY;

            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const angle = Math.atan2(deltaY, deltaX);

            /*
            if (distance > config.maxRadius) {                
                deltaX = Math.cos(angle) * config.maxRadius;
                deltaY = Math.sin(angle) * config.maxRadius;
            }
                */
                
            this.x = xMouse + deltaX * distance * 0.01;
            this.y = yMouse + deltaY * distance * 0.01;

            this.velX = 0;
            this.velY = 0;

        }
/*
        physicsLoop = () => {
            const distanceX = this.targetX - this.x;
            const distanceY = this.targetY - this.y;

            const forceX = distanceX * stiffness;
            const forceY = distanceY * stiffness;

            this.velX += forceX;
            this.velY += forceY;

            this.velX *= friction;
            this.velY *= friction;

            this.x += velX;
            this.y += velY;

            //updateVisuals();

            if (Math.abs(velX) < 0.01 && Math.abs(velY) < 0.01 && Math.abs(distanceX) < 0.1) {
                //animating = false; 
                this.x = 0; 
                this.y = 0; 
                //updateVisuals();
            } else {
                //dragFrame = requestAnimationFrame(physicsLoop);
            }
        }
*/
        stopDrag = () => {
            this.targetX = 0; 
            this.targetY = 0;

            this.deltaX = 0;
            this.deltaY = 0;
            this.force = 0;
            this.angle = 0;
            
            //if (!animating) {
                //animating = true;
                physicsLoop();
            //}
        };
    }


    let init = () => {
        config.dotsRows = Math.floor(height / (config.dotRadio + config.dotPadding));
        config.dotsColumns = Math.floor(width / (config.dotRadio + config.dotPadding));
		globals.random = Objects.getRandomObject();
        globals.mesh = new Mesh();
        if (config.randomize) randomize();
        initCanvas();
        addEvents();
        window.requestAnimationFrame(loop);
    }

    let addEvents = () => {
    }

    let randomize = () => {
        config.hue = globals.random.nextInt(0, 360);
    }
    
    window.draw = () => {
        drawBackground(ctx, canvas);
        globals.mesh.draw(ctx);
    }

    window.trackMouse = (x, y) => {
        if (clicking){   
            for (let xi = 0; xi < config.dotsColumns; xi++) {
                for (let yi = 0; yi < config.dotsRows; yi++) {
                    globals.mesh.dots[xi][yi].update(x, y);
                }
            }
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