{
    let CANVAS_ID = "myCanvas"
    let RAD_CONST = 0.0175;

    let dotsRows = 50;
    let dotsColumns = 50;

    let dotMargin = 30;
    let dotPadding = 20;
    let dotRadio = 10;

    let width = 0;
    let height = 0;

    let lastRender = 0;

    let hue = 150;

    let lastPosY = null;
    let lastPosX = null;

    let canvas;
    let ctx;

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

    class Utils {
        static scale = (number, inMin, inMax, outMin, outMax) => {
            return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
        }

        static angleBetweenTwoPoints(x1, y1, x2, y2) {
            var angle = Math.atan2(y2 - y1, x2 - x1);
            angle *= 180 / Math.PI;
            if (angle < 0) angle = 360 + angle;
            return angle;
        }

        static getRandomFromArray = (array) => {
            return array[(Math.floor(Math.random() * array.length))];
        }

        static shuffleArray = (array) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }
        }

        static getRandomInt = (min, max) => {
            return Math.floor(Math.random() * max) + min;
        }

        static getRandomFloat = (min, max, decimals) => {
            const str = (Math.random() * (max - min) + min).toFixed(
                decimals,
            );

            return parseFloat(str);
        }

        static getRandomBool = () => {
            return Math.random() < 0.5;
        }

        static nextCharacter = (c) => {
            return String.fromCharCode(c.charCodeAt(0) + 1);
        }

        static drawCircle = (ctx, x, y, radio, color = '#00FF00', fillColor = '#00FF00') => {
            ctx.strokeStyle = color;
            ctx.fillStyle = fillColor;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(x, y, radio, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
        }

        static drawRectangle = (ctx, x, y, width, height, color = '#FFF', fillColor = '#00FF00') => {
            ctx.strokeStyle = color;
            ctx.fillStyle = fillColor;
            ctx.beginPath();
            ctx.rect(x, y, width, height);
            ctx.fill();
            ctx.stroke();
        }

        static drawLine = (ctx, x1, y1, x2, y2, color = '#FFF') => {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineWidth = "2"
            ctx.strokeStyle = color;
            ctx.stroke();
        }

        static drawDot = (ctx, x, y, color = '#FFF') => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, 2 * Math.PI, false);
            ctx.fill();
        }
    }

    let init = () => {
        width = window.innerWidth;
        height = window.innerHeight;

        canvas = document.getElementById(CANVAS_ID);
        if (canvas.getContext)
            ctx = canvas.getContext('2d');

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

    let drawBackground = (ctx, canvas) => {
        canvas.width = width;
        canvas.height = height;
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#000000';
        ctx.strokeRect(0, 0, width, height);
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
