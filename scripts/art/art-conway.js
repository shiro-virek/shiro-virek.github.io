{
    let COLOR_OFF = "#222";

    let ledRows = 50;
    let ledColumns = 50;
    let ledMargin = 30;
    let ledPadding = 30;
    let ledDiameter = 20;
    let hue = 150;
    let ledScreen;

    const Figures = Object.freeze({
		Square: Symbol("square"),
		Circle: Symbol("circle")
	});

    class LedScreen {
        constructor() {            
            this.generateLeds();     
			let rand = Utils.getRandomInt(0, Object.keys(Figures).length - 1);
			this.shape = Figures[Object.keys(Figures)[rand]];     
        }

        generateLeds = () => {
            this.leds = [];
            this.ledsBuffer = [];
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
                    this.leds[x][y].on =  Utils.getRandomBool();
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
            this.radius = ledDiameter / 2;
            this.row = row;
            this.column = column;
            this.x = ledMargin + column * ledPadding + column * this.diameter;
            this.y = ledMargin + row * ledPadding + row * this.diameter;
            this.on = false;
            this.color = `hsl(${hue}, 100%, 50%)`;
        }

        draw = (ctx) => {
            let color = this.on ? this.color : COLOR_OFF;

            switch(ledScreen.shape){
                case Figures.Circle:
                    Utils.drawCircle(ctx, this.x + this.radius, this.y + this.radius, this.radius, color, color)
                    break;
                case Figures.Square:                    
                    Utils.drawRectangle(ctx, this.x, this.y, this.diameter, this.diameter, color, color);
                    break;
            }
        }
    }

    let init = () => {
		initCanvas();
        ledDiameter = Utils.getRandomInt(5, 20);        
        ledPadding = Utils.getRandomInt(0, 20);
        ledMargin = ledPadding;

        ledRows = Math.floor((height - ledMargin)/ (ledDiameter + ledPadding));
        ledColumns = Math.floor((width - ledMargin)/ (ledDiameter + ledPadding));        
        
        randomize();

        addEvents();
        window.requestAnimationFrame(loop)
    }

    let addEvents = () => {        
		canvas.addEventListener('click', e => {
			ledScreen.setPixel(e.offsetX, e.offsetY);
		}, false);
    }

    let randomize = () => {        
        hue = Utils.getRandomInt(0, 255); 
        ledScreen = new LedScreen();
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
    
	window.clearCanvas = () => {         
        ledScreen.generateLeds();  
	}
}
