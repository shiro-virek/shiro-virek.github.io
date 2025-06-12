{
    const globals = {
        random: null,
        framesCounter: 0,
        ledScreen: null
    };

    const config = {
        randomize: true,
        clicking: false,
        mouseMoved: false, 
        ledRows: 50,
        ledColumns: 50,
        ledMargin: 0,
        ledPadding: 30,
        ledDiameter: 20,
        hue: 50,
    };    

    class LedScreen {
        constructor() {
            this.leds = [];       
            this.generateLeds();
        }

        generateLeds = () => {
            for (let x = 0; x <= config.ledColumns; x++) {
                this.leds[x] = new Array(config.ledRows);
            }

            for (let x = 0; x <= config.ledColumns; x++) {
                for (let y = 0; y <= config.ledRows; y++) {
                    let led = new Led(x, y);
                    this.leds[x][y] = led;
                }
            }
        }

        draw = (ctx) => {
            for (let x = 0; x <= config.ledColumns; x++) {
                for (let y = 0; y <= config.ledRows; y++) {
                    this.leds[x][y].draw(ctx);
                }
            }
        }

        update = () => {                           
        }
    }

    class Led {
        constructor(column, row) {
            this.diameter = config.ledDiameter;
            this.radius = config.ledDiameter / 2;
            this.row = row;
            this.column = column;
            this.x = config.ledMargin + column * config.ledPadding + column * this.diameter;
            this.y = config.ledMargin + row * config.ledPadding + row * this.diameter;
            this.color = `hsl(${config.hue}, 100%, 50%)`;
        }

        draw = (ctx) => {
            let noiseValue = Noise.simplexNoise(this.x, this.y, globals.framesCounter);
            let angle = Numbers.scale(noiseValue, -1, 1, 0, 360) ;
            Drawing.drawRectangleR(ctx, this.x, this.y, this.diameter / 4, this.diameter, this.color, this.color, angle);
        }
    }

    let init = () => {
		globals.random = Objects.getRandomObject();
        if (config.randomize) randomize();
        initCanvas();
        config.ledDiameter = globals.random.nextInt(5, 20);        
        config.ledPadding = globals.random.nextInt(0, 5);
        config.ledMargin = config.ledPadding;

        randomize();

        config.ledRows = Math.floor((height - config.ledMargin)/ (config.ledDiameter + config.ledPadding));
        config.ledColumns = Math.floor((width - config.ledMargin)/ (config.ledDiameter + config.ledPadding));
        globals.ledScreen = new LedScreen();
        
        addEvents();
        window.requestAnimationFrame(loop);
    }

    let addEvents = () => {
        canvas.addEventListener('click', e => {
            
        }, false);

        canvas.addEventListener('mousemove', e => {
            config.mouseMoved = true;
			trackMouse(e.offsetX, e.offsetY);
		}, false);

		canvas.addEventListener('touchmove', function (e) {
			e.preventDefault();
            config.mouseMoved = true;
			trackMouse(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
		});

		canvas.addEventListener('touchstart', function (e) {
            config.mouseMoved = false;            
			trackMouse(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
			config.clicking = true;
		});

		canvas.addEventListener('mousedown', e => {
            config.mouseMoved = false;
			config.clicking = true;
		}, false);

		canvas.addEventListener('mouseup', e => {
			config.clicking = false;
		}, false);

		canvas.addEventListener('touchend', e => {
			config.clicking = false;
		}, false);  
    }

    let randomize = () => {
        config.hue = globals.random.nextInt(0, 255);
    }

    let trackMouse = (x, y) => {
        if (lastPosX == 0) lastPosX = x;
        if (lastPosY == 0) lastPosY = y;

        if (config.clicking) {  

        }

        lastPosX = x;
        lastPosY = y;
    }
    
    let draw = () => {
        drawBackground(ctx, canvas);
        globals.ledScreen.draw(ctx);
    }

    let loop = (timestamp) => {
        let progress = timestamp - lastRender;

        draw();
        
        Browser.sleep(200);
        globals.framesCounter += 0.05;

        lastRender = timestamp;
        window.requestAnimationFrame(loop);
    }

    init();

	window.clearCanvas = () => {  
	}
}