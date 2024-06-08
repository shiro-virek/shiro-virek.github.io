{
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

    class Semitone {
        constructor() {
            this.dots = [];
            this.generateDots();
        }

        generateDots = () => {
            for (let x = 0; x < dotsColumns; x++) {
                this.dots[x] = new Array(dotsRows);
            }

            for (let x = 0; x < dotsColumns; x++) {
                for (let y = 0; y < dotsRows; y++) {
                    let dot = new Dot(x, y);
                    this.dots[x][y] = dot;
                }
            }
        }

        draw = (ctx) => {
            for (let x = 0; x < dotsColumns; x++) {
                for (let y = 0; y < dotsRows; y++) {
                    this.dots[x][y].draw(ctx);
                }
            }
        }
    }

    class ModifierFunctions {
        static getRadio1 = (dist) => {
            return Utils.scale(dist, 0, 500, 5, 15);
        }

        static getRadio2 = (dist) => {
            let decrement = Utils.scale(dist, 0, 500, 5, 15);
            return decrement < 20 ? 20 - decrement : 1;
        }

        static getColor1 = (dist) => {
            return `hsl(${hue}, ${Utils.scale(dist, 0, 500, 0, 100)}%, 50%)`;
        }

        static getColor2 = (dist) => {
            return `hsl(${hue}, 100%, ${Utils.scale(dist, 0, 500, 0, 100)}%)`;
        }

        static getXPosition1 = (dist, x, y, angle) => {
            return x - Utils.scale(dist, 0, 500, -50, 50);
        }

        static getYPosition1 = (dist, x, y, angle) => {
            return y - Utils.scale(dist, 0, 500, -50, 50);
        }

        static getXPosition2 = (dist, x, y, angle) => {
            return x + Math.cos((angle + 180) * RAD_CONST) * 50;
        }

        static getYPosition2 = (dist, x, y, angle) => {
            return y + Math.sin((angle + 180) * RAD_CONST) * 50;
        }

        static getXPosition3 = (dist, x, y, angle) => {
            return x;
        }

        static getYPosition3 = (dist, x, y, angle) => {
            return y;
        }
        
        static getXPosition4 = (dist, x, y, angle) => {
            return x + Math.cos((angle + 90) * RAD_CONST) * 100;
        }

        static getYPosition4 = (dist, x, y, angle) => {
            return y + Math.sin((angle + 90) * RAD_CONST) * 100;
        }

        static getXPosition5 = (dist, x, y, angle) => {
            return x + Math.cos((angle + dist) * RAD_CONST) * 100;
        }

        static getYPosition5 = (dist, x, y, angle) => {
            return y + Math.sin((angle + dist) * RAD_CONST) * 100;
        }
            
        static getXPosition6 = (dist, x, y, angle) => {
            return x + Math.cos((angle + dist) * RAD_CONST) * dist;
        }

        static getYPosition6 = (dist, x, y, angle) => {
            return y + Math.sin((angle + dist) * RAD_CONST) * dist;
        }
                    
        static getXPosition7 = (dist, x, y, angle) => {
            return x + Math.cos((angle + dist) * RAD_CONST) * (angle + dist);
        }

        static getYPosition7 = (dist, x, y, angle) => {
            return y + Math.sin((angle + dist) * RAD_CONST) * (angle + dist);
        }
                            
        static getXPosition8 = (dist, x, y, angle) => {
            return x + Math.cos((angle + dist) * RAD_CONST) * (y);
        }

        static getYPosition8 = (dist, x, y, angle) => {
            return y + Math.sin((angle + dist) * RAD_CONST) * (x);
        }
                                    
        static getXPosition9 = (dist, x, y, angle) => {
            return x + Math.cos((angle) * RAD_CONST) * (y);
        }

        static getYPosition9 = (dist, x, y, angle) => {
            return y + Math.sin((angle) * RAD_CONST) * (x);
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
                Utils.drawCircle(ctx, this.x, this.y, this.radio, this.color, this.color)
        }

        update = (xMouse, yMouse) => {
            let xDot = dotMargin + this.column * dotPadding + this.column * dotRadio
            let yDot = dotMargin + this.row * dotPadding + this.row * dotRadio;

            let dist = Math.sqrt(Math.pow(xDot - xMouse, 2) + Math.pow(yDot - yMouse, 2));
            let angle = Utils.angleBetweenTwoPoints(xDot, yDot, xMouse, yMouse);

            this.radio = semitone.radioFunction(dist);
            this.color = semitone.colorFunction(dist);

            this.x = semitone.xPositionFunction(dist, xDot, yDot, angle);
            this.y = semitone.yPositionFunction(dist, xDot, yDot, angle);
        }
    }

    let init = () => {
        dotsRows = Math.floor(height / (dotRadio + dotPadding));
        dotsColumns = Math.floor(width / (dotRadio + dotPadding));
        semitone = new Semitone();
        addModifierFunctions();
        randomize();
        addEvents();
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
            ModifierFunctions.getXPosition7,
            ModifierFunctions.getXPosition8,            
            ModifierFunctions.getXPosition9,
        ];
        yPositionFunctions = [
            ModifierFunctions.getYPosition1,
            ModifierFunctions.getYPosition2,
            ModifierFunctions.getYPosition3,
            ModifierFunctions.getYPosition4,
            ModifierFunctions.getYPosition5,
            ModifierFunctions.getYPosition6,
            ModifierFunctions.getYPosition7,
            ModifierFunctions.getYPosition8,
            ModifierFunctions.getYPosition9,
        ];
    }

    let addEvents = () => {
        canvas.addEventListener('mousemove', e => {
            trackMouse(e.offsetX, e.offsetY);
        }, false);

        canvas.addEventListener('touchmove', function (e) {
            e.preventDefault();
            trackMouse(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
        });
    }

    let trackMouse = (xMouse, yMouse) => {
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

    let randomize = () => {
        hue = Utils.getRandomInt(0, 360);
        semitone.radioFunction = Utils.getRandomFromArray(radioFunctions);
        semitone.colorFunction = Utils.getRandomFromArray(colorFunctions);
        semitone.xPositionFunction = Utils.getRandomFromArray(xPositionFunctions);  
        semitone.yPositionFunction = Utils.getRandomFromArray(yPositionFunctions);
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

    init();

    window.requestAnimationFrame(loop);
}
