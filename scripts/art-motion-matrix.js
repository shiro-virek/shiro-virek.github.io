{
    let ledRows = 50;
    let ledColumns = 50;

    let ledMargin = 30;
    let ledPadding = 30;
    let ledDiameter = 20;
    let ledRadius = ledDiameter / 2;

    let growSpeed = 0.5;
    let shrinkSpeed = 0.3;
    let maxSize = 100;

    let transparent = false;
    let rotate = false;

    let hue = 100;

    let ledScreen;

    let clicking = false;

    const Figures = Object.freeze({
        Square: Symbol("square"),
        Circle: Symbol("circle")
    });

    class LedScreen {
        constructor() {
            this.leds = [];
            this.generateLeds();
            let rand = Utils.getRandomInt(0, Object.keys(Figures).length - 1);
            this.shape = Figures[Object.keys(Figures)[rand]];
        }

        generateLeds = () => {
            for (let x = 0; x <= ledColumns; x++) {
                this.leds[x] = new Array(ledRows);
            }

            for (let x = 0; x <= ledColumns; x++) {
                for (let y = 0; y <= ledRows; y++) {
                    let led = new Led(x, y);
                    this.leds[x][y] = led;
                }
            }
        }

        activatePixel = (x, y) => {
            let col = Math.round((x - ledMargin) / ((ledDiameter) + ledPadding));
            let row = Math.round((y - ledMargin) / ((ledDiameter) + ledPadding));
            this.leds[col][row].growing = growSpeed;
            this.leds[col][row].rotating = growSpeed;
        }

        movePixel = (col, row) => {
            this.leds[col][row].diameter += this.leds[col][row].growing;
            this.leds[col][row].radius = this.leds[col][row].diameter / 2;
            this.leds[col][row].angle += this.leds[col][row].rotating;

            if (this.leds[col][row].diameter > maxSize){
                this.leds[col][row].growing = -shrinkSpeed;
                this.leds[col][row].rotating = -shrinkSpeed;
            }

            if (this.leds[col][row].diameter <= ledDiameter)
                this.leds[col][row].growing = 0;

            if (this.leds[col][row].angle <= 0)
                this.leds[col][row].rotating = 0;

        }

        draw = (ctx) => {
            for (let x = 0; x <= ledColumns; x++) {
                for (let y = 0; y <= ledRows; y++) {
                    this.leds[x][y].draw(ctx);
                }
            }
        }

        update = () => {
            for (let x = 0; x <= ledColumns; x++) {
                for (let y = 0; y <= ledRows; y++) {
                    this.movePixel(x, y);
                }
            }
        }
    }

    class Led {
        constructor(column, row) {
            this.diameter = ledDiameter;
            this.radius = ledRadius;
            this.row = row;
            this.column = column;
            this.x = ledMargin + column * ledPadding + column * this.diameter;
            this.y = ledMargin + row * ledPadding + row * this.diameter;            
            this.hue = hue;
            this.growing = 0;
            this.angle = 0;
            this.rotating = 0;
        }

        getColor = (opacity = 1.0) => {
            return `hsl(${this.hue}, 100%, 50%, ${opacity})`;
        }

        draw = (ctx) => {
            let opacity = transparent ? this.diameter / maxSize : 1;
            switch (ledScreen.shape) {
                case Figures.Circle:
                    Utils.drawCircle(ctx, this.x + ledRadius, this.y + ledRadius, this.radius, this.getColor(opacity), this.getColor(opacity));
                    break;
                case Figures.Square:
                    Utils.drawSquare(ctx, this.x, this.y, this.diameter, rotate ? this.angle : 0, this.getColor(opacity), this.getColor(opacity));
                    break;
            }
        }
    }

    let init = () => {
        initCanvas();
        randomize();

        ledRows = Math.floor((height - ledMargin) / (ledDiameter + ledPadding));
        ledColumns = Math.floor((width - ledMargin) / (ledDiameter + ledPadding));
        ledScreen = new LedScreen();

        addEvents();
        window.requestAnimationFrame(loop)
    }

    let addEvents = () => {
        canvas.addEventListener('mousemove', e => {
			trackMouse(e.offsetX, e.offsetY);
		}, false);

		canvas.addEventListener('touchstart', function (e) {
			clicking = true;
			trackMouse(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
		});

		canvas.addEventListener('touchmove', function (e) {
			e.preventDefault();
			trackMouse(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
		});

		canvas.addEventListener('mousedown', e => {
			clicking = true;
		}, false);

		canvas.addEventListener('mouseup', e => {
			clicking = false;
		}, false);

		canvas.addEventListener('touchend', e => {
			clicking = false;
		}, false);   
    }

    let trackMouse = (xMouse, yMouse) => {
        if (clicking) 
            ledScreen.activatePixel(xMouse, yMouse);
    }

    let randomize = () => {
        transparent = Utils.getRandomBool();
        ledDiameter = Utils.getRandomInt(5, 20);
        ledPadding = Utils.getRandomInt(0, 20);
        ledMargin = ledPadding;
        hue = Utils.getRandomInt(0, 255);
        growSpeed = Utils.getRandomFloat(0.1, 2.0, 1);
        shrinkSpeed = Utils.getRandomFloat(0.1, 2.0, 1);
        maxSize = Utils.getRandomInt(ledDiameter + 1, 255);
        rotate = Utils.getRandomBool();
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
    
	window.clearCanvas = () => {
	}
}
