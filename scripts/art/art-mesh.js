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
            let xDot = config.dotMargin + this.column * config.dotPadding + this.column * config.dotRadio
            let yDot = config.dotMargin + this.row * config.dotPadding + this.row * config.dotRadio;

            let dist = Math.sqrt(Math.pow(xDot - xMouse, 2) + Math.pow(yDot - yMouse, 2));
            let angle = Trigonometry.angleBetweenTwoPoints(xDot, yDot, xMouse, yMouse);
        }
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
            for (let x = 0; x < config.dotsColumns; x++) {
                for (let y = 0; y < config.dotsRows; y++) {
                    globals.mesh.dots[x][y].update(x, y);
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