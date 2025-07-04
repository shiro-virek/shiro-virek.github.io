{
    const globals = {
		random: null,
        semitone: null,
        radioFunctions:  [],
        colorFunctions : [],
        xPositionFunctions : [],
        yPositionFunctions : [],
        angleFunctions : [],
        alphaFunctions : [],
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

    class Semitone {
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

    class ModifierFunctions {
        static getRadio1 = (dist, x, y, angle) => {
            return Numbers.scale(dist, 0, 500, 5, 15);
        }

        static getRadio2 = (dist, x, y, angle) => {
            let decrement = Numbers.scale(dist, 0, 500, 5, 15);
            return decrement < 20 ? 20 - decrement : 1;
        }

        static getColor1 = (dist, x, y, angle) => {
            return `hsla(${config.hue}, ${Numbers.scale(dist, 0, 500, 0, 100)}%, 50%, ${globals.semitone.alphaFunction(dist, x, y, angle)})`;
        }

        static getColor2 = (dist, x, y, angle) => {
            return `hsla(${config.hue}, 100%, ${Numbers.scale(dist, 0, 500, 0, 100)}%, ${globals.semitone.alphaFunction(dist, x, y, angle)})`;
        }

        static getXPosition1 = (dist, x, y, angle) => {
            return x - Numbers.scale(dist, 0, 500, -50, 50);
        }

        static getYPosition1 = (dist, x, y, angle) => {
            return y - Numbers.scale(dist, 0, 500, -50, 50);
        }

        static getXPosition2 = (dist, x, y, angle) => {
            return x + Math.cos((angle + 180) * Trigonometry.RAD_CONST) * 50;
        }

        static getYPosition2 = (dist, x, y, angle) => {
            return y + Math.sin((angle + 180) * Trigonometry.RAD_CONST) * 50;
        }

        static getXPosition3 = (dist, x, y, angle) => {
            return x;
        }

        static getYPosition3 = (dist, x, y, angle) => {
            return y;
        }
        
        static getXPosition4 = (dist, x, y, angle) => {
            return x + Math.cos((angle + 90) * Trigonometry.RAD_CONST) * 100;
        }

        static getYPosition4 = (dist, x, y, angle) => {
            return y + Math.sin((angle + 90) * Trigonometry.RAD_CONST) * 100;
        }

        static getXPosition5 = (dist, x, y, angle) => {
            return x + Math.cos((angle + dist) * Trigonometry.RAD_CONST) * 100;
        }

        static getYPosition5 = (dist, x, y, angle) => {
            return y + Math.sin((angle + dist) * Trigonometry.RAD_CONST) * 100;
        }
            
        static getXPosition6 = (dist, x, y, angle) => {
            return x + Math.cos((angle + dist) * Trigonometry.RAD_CONST) * dist;
        }

        static getYPosition6 = (dist, x, y, angle) => {
            return y + Math.sin((angle + dist) * Trigonometry.RAD_CONST) * dist;
        }
            
        static getAngle1 = (dist, x, y, angle) => {
            return 0;
        }

        static getAngle2 = (dist, x, y, angle) => {
            return angle;
        }

        static getAlpha1 = (dist, x, y, angle) => {
            return 1;
        }

        static getAlpha2 = (dist, x, y, angle) => {
            return Numbers.scale(dist, 0, 500, 0, 1);
        }

        static getAlpha3 = (dist, x, y, angle) => {
            return Numbers.scale(dist, 0, 500, 1, 0);
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
            if (this.on)
                switch(globals.semitone.shape){
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

            this.radio = globals.semitone.radioFunction(dist, xDot, yDot, angle);
            this.color = globals.semitone.colorFunction(dist, xDot, yDot, angle);

            this.x = globals.semitone.xPositionFunction(dist, xDot, yDot, angle);
            this.y = globals.semitone.yPositionFunction(dist, xDot, yDot, angle);

            this.angle = globals.semitone.angleFunction(dist, xDot, yDot, angle);
        }
    }

    let init = () => {
        initCanvas();
        config.dotsRows = Math.floor(height / (config.dotRadio + config.dotPadding));
        config.dotsColumns = Math.floor(width / (config.dotRadio + config.dotPadding));
		globals.random = Objects.getRandomObject();
        globals.semitone = new Semitone();
        addModifierFunctions();
        if (config.randomize) randomize();
        addEvents();
        window.requestAnimationFrame(loop)
    }

    let addModifierFunctions = () => {
        globals.radioFunctions = [
            ModifierFunctions.getRadio1,
            ModifierFunctions.getRadio2
        ];

        globals.colorFunctions = [
            ModifierFunctions.getColor1,
            ModifierFunctions.getColor2
        ];
        globals.xPositionFunctions = [
            ModifierFunctions.getXPosition1,
            ModifierFunctions.getXPosition2,
            ModifierFunctions.getXPosition3,
            ModifierFunctions.getXPosition4,
            ModifierFunctions.getXPosition5,
            ModifierFunctions.getXPosition6,
        ];
        globals.yPositionFunctions = [
            ModifierFunctions.getYPosition1,
            ModifierFunctions.getYPosition2,
            ModifierFunctions.getYPosition3,
            ModifierFunctions.getYPosition4,
            ModifierFunctions.getYPosition5,
            ModifierFunctions.getYPosition6,
        ];
        globals.angleFunctions = [
            ModifierFunctions.getAngle1,
            ModifierFunctions.getAngle2
        ];
        globals.alphaFunctions = [
            ModifierFunctions.getAlpha1,
            ModifierFunctions.getAlpha2, 
            ModifierFunctions.getAlpha3
        ];
    }

    let addEvents = () => {
    }

    let randomize = () => {
        config.hue = globals.random.nextInt(0, 360);
        globals.semitone.radioFunction = globals.random.getRandomFromArray(globals.radioFunctions);
        globals.semitone.colorFunction = globals.random.getRandomFromArray(globals.colorFunctions);
        globals.semitone.xPositionFunction = globals.random.getRandomFromArray(globals.xPositionFunctions);  
        globals.semitone.yPositionFunction = globals.random.getRandomFromArray(globals.yPositionFunctions);          
        globals.semitone.angleFunction = globals.random.getRandomFromArray(globals.angleFunctions);        
        globals.semitone.alphaFunction = globals.random.getRandomFromArray(globals.alphaFunctions);
    }

    window.trackMouse = (xMouse, yMouse) => {
        if (clicking){   
            for (let x = 0; x < config.dotsColumns; x++) {
                for (let y = 0; y < config.dotsRows; y++) {
                    globals.semitone.dots[x][y].update(xMouse, yMouse);
                }
            }
        }
    }

    window.draw = () => {
        drawBackground(ctx, canvas);
        globals.semitone.draw(ctx);
    }

	window.clearCanvas = () => {
		Sound.error();
	}

	window.magic = () => {  
		Sound.error();
	}

    window.upload = () => {
		Sound.error();
    }

    init();
}
