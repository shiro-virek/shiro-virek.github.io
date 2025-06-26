{
    const globals = {
		random: null
    };

    let dotsRows = 50;
    let dotsColumns = 50;

    let dotMargin = 30;
    let dotPadding = 20;
    let dotRadio = 10;

    let hue = 150;

    let semitone;

    let radioFunctions = [];
    let colorFunctions = [];
    let xPositionFunctions = [];
    let yPositionFunctions = [];
    let angleFunctions = [];
    let alphaFunctions = [];
 

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
            for (let x = 0; x <= dotsColumns; x++) {
                this.dots[x] = new Array(dotsRows);
            }

            for (let x = 0; x <= dotsColumns; x++) {
                for (let y = 0; y <= dotsRows; y++) {
                    let dot = new Dot(x, y);
                    this.dots[x][y] = dot;
                }
            }
        }

        draw = (ctx) => {
            for (let x = 0; x <= dotsColumns; x++) {
                for (let y = 0; y <= dotsRows; y++) {
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
            return `hsla(${hue}, ${Numbers.scale(dist, 0, 500, 0, 100)}%, 50%, ${semitone.alphaFunction(dist, x, y, angle)})`;
        }

        static getColor2 = (dist, x, y, angle) => {
            return `hsla(${hue}, 100%, ${Numbers.scale(dist, 0, 500, 0, 100)}%, ${semitone.alphaFunction(dist, x, y, angle)})`;
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
            this.radio = dotRadio;
            this.row = row;
            this.column = column;
            this.x = dotMargin + column * dotPadding + column * this.radio;
            this.y = dotMargin + row * dotPadding + row * this.radio;
            this.on = true;
            this.color = `hsl(${0}, 0%, 50%)`;
        }

        draw = (ctx) => {
            if (this.on)
                switch(semitone.shape){
                    case Figures.Circle:
                        Drawing.drawCircle(ctx, this.x, this.y, this.radio, this.color, this.color);
                        break;
                    case Figures.Square:             
                        Drawing.drawSquare(ctx, this.x, this.y, this.radio, this.angle, this.color, this.color);
                        break; 
                    case Figures.Hexagon:                    
                        Drawing.drawPolygon(ctx, this.x, this.y, this.radio, 6, this.angle, this.color, this.color);
                        break;
                    case Figures.Triangle:                    
                        Drawing.drawPolygon(ctx, this.x, this.y, this.radio, 3, this.angle, this.color, this.color);
                        break;
                }                
        }

        update = (xMouse, yMouse) => {
            let xDot = dotMargin + this.column * dotPadding + this.column * dotRadio
            let yDot = dotMargin + this.row * dotPadding + this.row * dotRadio;

            let dist = Math.sqrt(Math.pow(xDot - xMouse, 2) + Math.pow(yDot - yMouse, 2));
            let angle = Trigonometry.angleBetweenTwoPoints(xDot, yDot, xMouse, yMouse);

            this.radio = semitone.radioFunction(dist, xDot, yDot, angle);
            this.color = semitone.colorFunction(dist, xDot, yDot, angle);

            this.x = semitone.xPositionFunction(dist, xDot, yDot, angle);
            this.y = semitone.yPositionFunction(dist, xDot, yDot, angle);

            this.angle = semitone.angleFunction(dist, xDot, yDot, angle);
        }
    }

    let init = () => {
        initCanvas();
        dotsRows = Math.floor(height / (dotRadio + dotPadding));
        dotsColumns = Math.floor(width / (dotRadio + dotPadding));
		globals.random = Objects.getRandomObject();
        semitone = new Semitone();
        addModifierFunctions();
        randomize();
        addEvents();
        window.requestAnimationFrame(loop)
    }

    let addModifierFunctions = () => {
        radioFunctions = [
            ModifierFunctions.getRadio1,
            ModifierFunctions.getRadio2
        ];

        colorFunctions = [
            ModifierFunctions.getColor1,
            ModifierFunctions.getColor2
        ];
        xPositionFunctions = [
            ModifierFunctions.getXPosition1,
            ModifierFunctions.getXPosition2,
            ModifierFunctions.getXPosition3,
            ModifierFunctions.getXPosition4,
            ModifierFunctions.getXPosition5,
            ModifierFunctions.getXPosition6,
        ];
        yPositionFunctions = [
            ModifierFunctions.getYPosition1,
            ModifierFunctions.getYPosition2,
            ModifierFunctions.getYPosition3,
            ModifierFunctions.getYPosition4,
            ModifierFunctions.getYPosition5,
            ModifierFunctions.getYPosition6,
        ];
        angleFunctions = [
            ModifierFunctions.getAngle1,
            ModifierFunctions.getAngle2
        ];
        alphaFunctions = [
            ModifierFunctions.getAlpha1,
            ModifierFunctions.getAlpha2, 
            ModifierFunctions.getAlpha3
        ];
    }

    let addEvents = () => {
        canvas.addEventListener('mousemove', e => {
			trackMouse(e.offsetX, e.offsetY);
		}, false);

		canvas.addEventListener('touchstart', function (e) {
			trackMouse(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
		});

		canvas.addEventListener('touchmove', function (e) {
			trackMouse(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
		});
    }

    let trackMouse = (xMouse, yMouse) => {
        if (clicking){
            if (lastPosX == 0) lastPosX = xMouse;
            if (lastPosY == 0) lastPosY = yMouse;
    
            let movX = lastPosX - xMouse;
            let movY = lastPosY - yMouse;
    
            for (let x = 0; x < dotsColumns; x++) {
                for (let y = 0; y < dotsRows; y++) {
                    semitone.dots[x][y].update(xMouse, yMouse);
                }
            }
    
            lastPosX = xMouse;
            lastPosY = yMouse;
        }
    }

    let randomize = () => {
        hue = globals.random.nextInt(0, 360);
        semitone.radioFunction = globals.random.getRandomFromArray(radioFunctions);
        semitone.colorFunction = globals.random.getRandomFromArray(colorFunctions);
        semitone.xPositionFunction = globals.random.getRandomFromArray(xPositionFunctions);  
        semitone.yPositionFunction = globals.random.getRandomFromArray(yPositionFunctions);          
        semitone.angleFunction = globals.random.getRandomFromArray(angleFunctions);        
        semitone.alphaFunction = globals.random.getRandomFromArray(alphaFunctions);
    }

    let draw = () => {
        drawBackground(ctx, canvas);
        semitone.draw(ctx);
    }

    let loop = (timestamp) => {
        let progress = timestamp - lastRender;

        draw();

        lastRender = timestamp;
        window.requestAnimationFrame(loop);
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
