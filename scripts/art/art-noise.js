{
    const globals = {
        random: null,
        ledScreen: null,
        noise: null,
        time: 0
    };

    const config = {
        randomize: true,
        ledRows: 50,
        ledColumns: 50,
        ledMargin: 0,
        ledPadding: 30,
        ledDiameter: 20,
        hue: 50,
        functionIndex: 3,
        functions: [bars, squares, brightness, hues] 
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
            let scale = 0.005; 
            let value = globals.noise.get(this.x * scale, this.y * scale, globals.time * 10);
        
            const modifierFunction = config.functions[config.functionIndex];
            modifierFunction(this, value);
        }
    }

    function bars(led, noiseValue){
        let angle = Numbers.scale(noiseValue, -1, 1, 0, 360);
        Drawing.drawRectangleR(ctx, led.x, led.y, led.diameter / 4, led.diameter, led.color, led.color, angle);   
    }

    function squares(led, noiseValue){
        let side = Numbers.scale(noiseValue, -1, 1, 0, led.diameter);
        Drawing.drawSquare(ctx, led.x, led.y, side, 0, led.color, led.color);  
    }

    function brightness(led, noiseValue){
        let bright = Numbers.scale(noiseValue, -1, 1, 0, 50);
        let color = `hsl(${config.hue}, 100%, ${bright}%)`;
        Drawing.drawCircle(ctx, led.x, led.y, led.radius, color, color); 
    }

    function hues(led, noiseValue){
        let newHue = Numbers.scale(noiseValue, -1, 1, 0, 360);
        let color = `hsl(${newHue}, 100%, 50%)`;
        Drawing.drawCircle(ctx, led.x, led.y, led.radius, color, color); 
    }

    let init = () => {
		globals.random = Objects.getRandomObject();
        globals.noise = new Noise(globals.random);
        if (config.randomize) randomize();
        initCanvas();
        config.ledDiameter = globals.random.nextInt(5, 20);        
        config.ledPadding = globals.random.nextInt(0, 5);
        config.ledMargin = config.ledPadding;

        config.ledRows = Math.floor((height - config.ledMargin)/ (config.ledDiameter + config.ledPadding));
        config.ledColumns = Math.floor((width - config.ledMargin)/ (config.ledDiameter + config.ledPadding));
        globals.ledScreen = new LedScreen();
        
        addEvents();
        window.requestAnimationFrame(loop);
    }

    let addEvents = () => {
    }

    let randomize = () => {
        config.hue = globals.random.nextInt(0, 255);
        config.functionIndex = globals.random.nextInt(0, config.functions.length);
    }
    
    let draw = () => {
        drawBackground(ctx, canvas);
        globals.ledScreen.draw(ctx);
    }

    let loop = (timestamp) => {
        let progress = timestamp - lastRender;

        draw();
        
        globals.time += 0.005;
        lastRender = timestamp;
        window.requestAnimationFrame(loop);
    }

    window.trackMouse = (xMouse, yMouse) => {
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