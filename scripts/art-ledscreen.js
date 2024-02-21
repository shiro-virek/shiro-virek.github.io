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
            this.generateLeds();
        }

        generateLeds = () => {
            for (let x = 0; x < ledColumns; x++) {
                this.leds[x] = new Array(ledRows);
            }

            for (let x = 0; x < ledColumns; x++) {
                for (let y = 0; y < ledRows; y++) {
                    let led = new Led(x, y);
                    this.leds[x][y] = led;
                }
            }
        }

        setPixel = (x, y) => {            
            let col = Math.round((x - ledMargin) / ((ledDiameter) + ledPadding));
            let row = Math.round((y - ledMargin) / ((ledDiameter) + ledPadding));
            this.leds[col][row].on = true;
        }

        draw = (ctx) => {
            for (let x = 0; x < ledColumns; x++) {
                for (let y = 0; y < ledRows; y++) {
                    this.leds[x][y].draw(ctx);
                }
            }
        }

        update = () => {                           
        }
    }

    class Led {
        constructor(column, row) {
            this.diameter = ledDiameter;
            this.radius = ledDiameter / 2;
            this.row = row;
            this.column = column;
            this.x = ledMargin + column * ledPadding + column * this.diameter;
            this.y = ledMargin + row * ledPadding + row * this.diameter;
            this.on = false;
            this.color = `hsl(${hue}, 100%, 50%)`;
        }

        draw = (ctx) => {
            if (this.on)
                Utils.drawCircle(ctx, this.x + this.radius, this.y + this.radius, this.radius, this.color, this.color)
            else            
                Utils.drawCircle(ctx, this.x + this.radius, this.y + this.radius, this.radius, COLOR_OFF, COLOR_OFF)

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
        
		canvas.addEventListener('mousemove', e => {
			ledScreen.setPixel(e.offsetX, e.offsetY);
		}, false);

		canvas.addEventListener('touchstart', function(e){
			ledScreen.setPixel(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
		});

		canvas.addEventListener('touchmove', function(e){
			e.preventDefault();
			ledScreen.setPixel(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
		});	
    }


    let randomize = () => {
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
    }

    let loop = (timestamp) => {
        let progress = timestamp - lastRender;

        ledScreen.update();

        draw();

        lastRender = timestamp;
        window.requestAnimationFrame(loop);
    }

    init();

    window.requestAnimationFrame(loop);
}
