{
    const globals = {
		random: null,
        ledScreen: null,
    };
    
    const config = {
        randomize: true,
        colorOff: "#222",
        ledRows: 50,
        ledColumns: 50,
        ledMargin: 30,
        ledPadding: 30,
        ledDiameter: 20,
        hue: 150,
    };
    
    const Figures = Object.freeze({
		Square: Symbol("square"),
		Circle: Symbol("circle")
	});

    class LedScreen {
        constructor() {            
            this.generateLeds();     
			let rand = globals.random.nextInt(0, Object.keys(Figures).length - 1);
			this.shape = Figures[Object.keys(Figures)[rand]];     
        }

        generateLeds = () => {
            this.leds = [];
            this.ledsBuffer = [];
            for (let x = 0; x < config.ledColumns; x++) {
                this.leds[x] = new Array(config.ledRows);
                this.ledsBuffer[x] = new Array(config.ledRows);
            }

            for (let x = 0; x < config.ledColumns; x++) {
                for (let y = 0; y < config.ledRows; y++) {
                    let led = new Led(x, y);
                    this.leds[x][y] = led;
                    let ledBuffer = new Led(x, y);
                    this.ledsBuffer[x][y] = ledBuffer;
                    this.leds[x][y].on =  globals.random.nextBool();
                }
            }  
        }

        setPixel = (x, y) => {            
            let col = Math.round((x - config.ledMargin) / ((config.ledDiameter) + config.ledPadding));
            let row = Math.round((y - config.ledMargin) / ((config.ledDiameter) + config.ledPadding));
            this.leds[col][row].on = true;
            this.ledsBuffer[col][row].on = true;
        }

        draw = (ctx) => {
            for (let x = 0; x < config.ledColumns; x++) {
                for (let y = 0; y < config.ledRows; y++) {
                    this.ledsBuffer[x][y].draw(ctx);
                }
            }
        }

        copyBuffer = () => {
            for (let x = 0; x < config.ledColumns; x++) {
                for (let y = 0; y < config.ledRows; y++) {
                    this.leds[x][y].on =  this.ledsBuffer[x][y].on;
                }
            }    
        }

        getLedValueSafe = (x, y) => {
            if (x < 0 || y < 0 || x >= config.ledColumns || y >= config.ledRows)
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
            for (let x = 0; x < config.ledColumns; x++) {
                for (let y = 0; y < config.ledRows; y++) {
                    this.ledsBuffer[x][y].on =  this.calculateLedStatus(x, y);
                }
            }                  
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
            this.on = false;
            this.color = `hsl(${config.hue}, 100%, 50%)`;
        }

        draw = (ctx) => {
            let color = this.on ? this.color : config.colorOff;

            switch(ledScreen.shape){
                case Figures.Circle:
                    Drawing.drawCircle(ctx, this.x + this.radius, this.y + this.radius, this.radius, color, color)
                    break;
                case Figures.Square:                    
                    Drawing.drawRectangle(ctx, this.x, this.y, this.diameter, this.diameter, color, color);
                    break;
            }
        }
    }

    let init = () => {
		initCanvas();
        globals.random = Objects.getRandomObject();
        config.ledDiameter = globals.random.nextInt(5, 20);        
        config.ledPadding = globals.random.nextInt(0, 20);
        config.ledMargin = config.ledPadding;

        config.ledRows = Math.floor((height - config.ledMargin)/ (config.ledDiameter + config.ledPadding));
        config.ledColumns = Math.floor((width - config.ledMargin)/ (config.ledDiameter + config.ledPadding));        
        
        if (config.randomize) randomize();

        addEvents();
        window.requestAnimationFrame(loop)
    }

    let addEvents = () => {        
		canvas.addEventListener('click', e => {
			ledScreen.setPixel(e.offsetX, e.offsetY);
		}, false);
    }

    let randomize = () => {        
        config.hue = globals.random.nextInt(0, 255); 
        ledScreen = new LedScreen();
    }

    window.draw = () => {
        ledScreen.update();
        
        drawBackground(ctx, canvas);
        ledScreen.draw(ctx);
        ledScreen.copyBuffer();

        Browser.sleep(200);
    }

    window.trackMouse = (xMouse, yMouse) => {
    }
    
	window.clearCanvas = () => {         
        ledScreen.generateLeds();  
	}
    
	window.magic = () => {  
		Sound.error();
	}

    window.upload = () => {
		Sound.error();
    }

    init();    
}
