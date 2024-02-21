{
    let CANVAS_ID = "myCanvas"
    let RAD_CONST = 0.0175;

    let COLOR_OFF = "#222";

    let ledRows = 50;
    let ledColumns = 50;

    let ledMargin = 30;
    let ledPadding = 30;
    let ledDiameter = 20;

    let width = 0;
    let height = 0;

    let lastRender = 0;

    let hue = 150;

    let lastPosY = null;
    let lastPosX = null;

    let canvas;
    let ctx;

    let ledScreen;

    class LedScreen {
        constructor() {
            this.leds = [];
            this.ledsBuffer = [];            
            this.generateLeds();
        }

        generateLeds = () => {
            for (let x = 0; x < ledColumns; x++) {
                this.leds[x] = new Array(ledRows);
                this.ledsBuffer[x] = new Array(ledRows);
            }

            for (let x = 0; x < ledColumns; x++) {
                for (let y = 0; y < ledRows; y++) {
                    let led = new Led(x, y);
                    this.leds[x][y] = led;
                    let ledBuffer = new Led(x, y);
                    this.ledsBuffer[x][y] = ledBuffer;
                }
            }
        }

        setPixel = (x, y) => {            
            let col = Math.round((x - ledMargin) / ((ledDiameter) + ledPadding));
            let row = Math.round((y - ledMargin) / ((ledDiameter) + ledPadding));
            this.leds[col][row].on = true;
            this.ledsBuffer[col][row].on = true;
        }

        draw = (ctx) => {
            for (let x = 0; x < ledColumns; x++) {
                for (let y = 0; y < ledRows; y++) {
                    this.ledsBuffer[x][y].draw(ctx);
                }
            }
        }

        copyBuffer = () => {
            for (let x = 0; x < ledColumns; x++) {
                for (let y = 0; y < ledRows; y++) {
                    this.leds[x][y].on =  this.ledsBuffer[x][y].on;
                }
            }    
        }

        getLedValueSafe = (x, y) => {
            if (x < 0 || y < 0 || x >= ledColumns || y >= ledRows)
                return false
            else
                return this.leds[x][y];
        }

        calculateLedStatus = (x, y) => {
            let value = false;
            let sum = 0;

            if (this.getLedValueSafe(x, y-1).on) sum++;
            if (this.getLedValueSafe(x, y+1).on) sum++;
            if (this.getLedValueSafe(x-1, y-1).on) sum++;
            if (this.getLedValueSafe(x+1, y-1).on) sum++;
            if (this.getLedValueSafe(x-1, y).on) sum++;
            if (this.getLedValueSafe(x+1, y).on) sum++;
            if (this.getLedValueSafe(x-1, y+1).on) sum++;
            if (this.getLedValueSafe(x+1, y+1).on) sum++;

            if (this.leds[x][y].on && (sum < 2 || sum > 3)) value = false;
            if (this.leds[x][y].on && sum >= 2 && sum <= 3) value = true;
            if (!this.leds[x][y].on && sum == 3) value = true;

            return value;
        }

        update = () => {            
            for (let x = 0; x < ledColumns; x++) {
                for (let y = 0; y < ledRows; y++) {
                    this.ledsBuffer[x][y].on =  this.calculateLedStatus(x, y);
                }
            }                  
        }
    }

    class Led {
        constructor(column, row) {
            this.diameter = ledDiameter;
            this.row = row;
            this.column = column;
            this.x = ledMargin + column * ledPadding + column * this.diameter;
            this.y = ledMargin + row * ledPadding + row * this.diameter;
            this.on = false;
            this.color = `hsl(${hue}, 100%, 50%)`;
        }

        draw = (ctx) => {
            if (this.on)
                Utils.drawCircle(ctx, this.x, this.y, this.diameter / 2, this.color, this.color)
            else            
                Utils.drawCircle(ctx, this.x, this.y, this.diameter / 2, COLOR_OFF, COLOR_OFF)

        }
    }

    class Utils {
        static scale = (number, inMin, inMax, outMin, outMax) => {
            return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
        }

        static sleep(ms){
            let waitUntil = new Date().getTime() + ms;
            while(new Date().getTime() < waitUntil) continue;
        };

        static angleBetweenTwoPoints(x1, y1, x2, y2) {
            let angle = Math.atan2(y2 - y1, x2 - x1);
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

        static drawCircle = (ctx, x, y, radius, color = '#00FF00', fillColor = '#00FF00') => {
            ctx.strokeStyle = color;
            ctx.fillStyle = fillColor;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
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

        ledDiameter = Utils.getRandomInt(5, 20);        
        ledPadding = Utils.getRandomInt(0, 20);
        ledMargin = ledPadding;

        ledRows = Math.floor((height - ledMargin)/ (ledDiameter + ledPadding));
        ledColumns = Math.floor((width - ledMargin)/ (ledDiameter + ledPadding));
        ledScreen = new LedScreen();
        
        addEvents();

        randomize();
    }

    let addEvents = () => {        
		canvas.addEventListener('click', e => {
			ledScreen.setPixel(e.offsetX, e.offsetY);
		}, false);
    }

    let randomize = () => {
        for (let x = 0; x < ledColumns; x++) {
            for (let y = 0; y < ledRows; y++) {
                ledScreen.leds[x][y].on =  Utils.getRandomBool();
            }
        }    
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
        ledScreen.draw(ctx);
        ledScreen.copyBuffer();
    }

    let loop = (timestamp) => {
        let progress = timestamp - lastRender;

        ledScreen.update();

        draw();

        Utils.sleep(200);

        lastRender = timestamp;
        window.requestAnimationFrame(loop);
    }

    init();

    window.requestAnimationFrame(loop);
}
