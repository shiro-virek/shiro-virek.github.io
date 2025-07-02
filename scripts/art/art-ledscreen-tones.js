{    
    const globals = {
        random: null,
        ledScreen: null,
    };

    const config = { 
        randomize: true,
        ledRows: 50,
        ledColumns: 50,
        ledMargin: 30,
        ledPadding: 30,
        ledDiameter: 20,
        hue: 150,
        valueIncrement: 1,
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

        setPixel = (x, y) => {            
            let col = Math.round((x - config.ledMargin) / ((config.ledDiameter) + config.ledPadding));
            let row = Math.round((y - config.ledMargin) / ((config.ledDiameter) + config.ledPadding));
            if (col > config.ledColumns - 1 || row > config.ledRows - 1 || col < 0 || row < 0) return;
            this.leds[col][row].value += config.valueIncrement;
            if (this.leds[col][row].value > 255) 
                this.leds[col][row].value = 0;
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
            this.value = 0;
        }

        draw = (ctx) => {
            let color = `hsl(${config.hue}, 100%, ${this.value}%)`;

            switch(globals.ledScreen.shape){
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
        if (config.randomize) randomize();
        config.ledRows = Math.floor((height - config.ledMargin)/ (config.ledDiameter + config.ledPadding));
        config.ledColumns = Math.floor((width - config.ledMargin)/ (config.ledDiameter + config.ledPadding));
        globals.ledScreen = new LedScreen();
        
        addEvents();
        window.requestAnimationFrame(loop)
    }

    let addEvents = () => {   
    }

    let randomize = () => {            
		globals.random = Objects.getRandomObject();
        
        config.ledDiameter = globals.random.nextInt(5, 20);        
        config.ledPadding = globals.random.nextInt(0, 20);
        config.ledMargin = config.ledPadding;  
        config.hue = globals.random.nextInt(0, 255);
    }

    window.draw = () => {
        globals.ledScreen.update();
        drawBackground(ctx, canvas);
        if (clicking){            
            let points = Trigonometry.bresenhamLine(lastPosX, lastPosY, mouseX, mouseY);
            for (const p of points) {                
                globals.ledScreen.setPixel(p.x, p.y);
            }                
        }   
        globals.ledScreen.draw(ctx);
    }

    window.trackMouse = (xMouse, yMouse) => {
    
    }

	window.clearCanvas = () => {		
        globals.ledScreen.generateLeds();  
	}

	window.magic = () => {  
		Sound.error();
	}

    window.upload = () => {
		Sound.error();
    }

    init();
}
