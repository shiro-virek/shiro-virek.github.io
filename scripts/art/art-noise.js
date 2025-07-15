{
    const globals = {
        random: null,
        pixelScreen: null,
        noise: null,
        time: 0
    };

    const config = {
        randomize: true,
        pixelRows: 50,
        pixelColumns: 50,
        pixelMargin: 0,
        pixelPadding: 30,
        pixelDiameter: 20,
        hue: 50,
        functionIndex: 3,
        alternatePixel: false,
        functions: [bars, squares, brightness, hues, semitone],
    };    

    const Figures = Object.freeze({
		Square: Symbol("square"),
		Circle: Symbol("circle"),
        Hexagon: Symbol("hexagon"),
    });

    class PixelScreen {
        constructor() {
            this.pixels = [];       
            this.generatePixels(); 
            let rand = globals.random.nextInt(0, Object.keys(Figures).length - 1);
			this.shape = Figures[Object.keys(Figures)[rand]];
        }

        generatePixels = () => {
            for (let x = 0; x <= config.pixelColumns; x++) {
                this.pixels[x] = new Array(config.pixelRows);
            }

            for (let x = 0; x <= config.pixelColumns; x++) {
                for (let y = 0; y <= config.pixelRows; y++) {
                    let pixel = new Pixel(x, y);
                    this.pixels[x][y] = pixel;
                }
            }
        }

        draw = (ctx) => {
            for (let x = 0; x <= config.pixelColumns; x++) {
                for (let y = 0; y <= config.pixelRows; y++) {
                    this.pixels[x][y].draw(ctx);
                }
            }
        }

        update = () => {                           
        }
    }

    class Pixel {
        constructor(column, row) {
            this.diameter = config.pixelDiameter;
            this.radius = config.pixelDiameter / 2;
            this.row = row;
            this.column = column;
            this.x = config.pixelMargin + column * config.pixelPadding + column * this.diameter;
            this.y = config.pixelMargin + row * config.pixelPadding + row * this.diameter;    
            if (config.alternatePixel)
                this.y = this.column % 2 == 0 ? this.y : this.y + this.radius;
            this.color = `hsl(${config.hue}, 100%, 50%)`;
        }

        draw = (ctx) => {
            let scale = 0.005; 
            let value = globals.noise.get(this.x * scale, this.y * scale, globals.time * 10);
        
            const modifierFunction = config.functions[config.functionIndex];
            modifierFunction(this, value);
        }

        static drawShape = (ctx, x, y, diameter, color) => {
            switch(globals.pixelScreen.shape){
                case Figures.Circle:
                    Drawing.drawCircle(ctx, x, y, diameter, color)
                    break;
                case Figures.Square:                    
                    Drawing.drawRectangle(ctx, x - diameter / 2, y - diameter / 2, diameter, diameter, color);
                    break;
                case Figures.Hexagon:
                    Drawing.drawPolygon(ctx, x, y, diameter, 6, 0, color);
                    break;
            }
        }
    }

    function bars(pixel, noiseValue){
        let angle = Numbers.scale(noiseValue, -1, 1, 0, 360);
        Drawing.drawRectangleRotated(ctx, pixel.x, pixel.y, pixel.diameter / 4, pixel.diameter, pixel.color, angle);   
    }

    function squares(pixel, noiseValue){
        let side = Numbers.scale(noiseValue, -1, 1, 0, pixel.diameter);
        Pixel.drawShape(ctx, pixel.x, pixel.y, side, pixel.color);  
    }

    function semitone(pixel, noiseValue){
        let radius = Numbers.scale(noiseValue, -1, 1, 0, pixel.diameter);
        Pixel.drawShape(ctx, pixel.x, pixel.y, radius, pixel.color); 
    }

    function brightness(pixel, noiseValue){
        let bright = Numbers.scale(noiseValue, -1, 1, 0, 50);
        let color = `hsl(${config.hue}, 100%, ${bright}%)`;
        Pixel.drawShape(ctx, pixel.x, pixel.y, pixel.radius, color); 
    }

    function hues(pixel, noiseValue){
        let newHue = Numbers.scale(noiseValue, -1, 1, 0, 360);
        let color = `hsl(${newHue}, 100%, 50%)`;
        Pixel.drawShape(ctx, pixel.x, pixel.y, pixel.radius, color); 
    }

    let init = () => {
		globals.random = Objects.getRandomObject();
        globals.noise = new Noise(globals.random);
        if (config.randomize) randomize();
        initCanvas();
        config.pixelDiameter = globals.random.nextInt(5, 25);        
        config.pixelPadding = globals.random.nextInt(0, 5);
        config.pixelMargin = config.pixelPadding;

        config.pixelRows = Math.floor((height - config.pixelMargin)/ (config.pixelDiameter + config.pixelPadding));
        config.pixelColumns = Math.floor((width - config.pixelMargin)/ (config.pixelDiameter + config.pixelPadding));
        globals.pixelScreen = new PixelScreen();
        
        addEvents();
        window.requestAnimationFrame(loop);
    }

    let addEvents = () => {
    }

    let randomize = () => {
        config.hue = globals.random.nextInt(0, 255);
        config.functionIndex = globals.random.nextInt(0, config.functions.length - 1);
        config.alternatePixel = globals.random.nextBool();
    }
    
    window.draw = () => {
        drawBackground(ctx, canvas);
        globals.pixelScreen.draw(ctx);
        globals.time += 0.005;
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