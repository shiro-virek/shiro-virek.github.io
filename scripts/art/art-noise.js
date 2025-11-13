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
        pixelPadding: 0,
        pixelDiameter: 20,
        hue: 50,
        functionIndex: 3,
        alternatePixel: false,
        functions: [size, brightness, hue, semitone, ascii, emoji, ansi, character, bar, crt, sin, gameboy],
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

    function size(pixel, noiseValue){
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

    function hue(pixel, noiseValue){
        let newHue = Numbers.scale(noiseValue, -1, 1, 0, 360);
        let color = `hsl(${newHue}, 100%, 50%)`;
        Pixel.drawShape(ctx, pixel.x, pixel.y, pixel.radius, color); 
    }

    function ascii(pixel, noiseValue){
        let value = Numbers.scale(noiseValue, -1, 1, 0, 100);
        SpecialPixels.drawAscii(ctx, pixel.x, pixel.y, value);
    }

    function emoji(pixel, noiseValue){
        let value = Numbers.scale(noiseValue, -1, 1, 0, 100);
        SpecialPixels.drawEmoji(ctx, pixel.x, pixel.y, value, "#FFF", 10);
    }

    function ansi(pixel, noiseValue){
        let value = Numbers.scale(noiseValue, -1, 1, 0, 100);
        SpecialPixels.drawAnsi(ctx, pixel.x, pixel.y, value);
    }

    function bar(pixel, noiseValue){
        let angle = Numbers.scale(noiseValue, -1, 1, 0, 360);
        let color = `hsl(${config.hue}, 100%, 50%)`;
        SpecialPixels.drawBar(ctx, pixel.x, pixel.y, pixel.diameter, angle, color); 
    }

    function character(pixel, noiseValue){
        let value = Numbers.scale(noiseValue, -1, 1, 5, 40);
        SpecialPixels.drawCharacter(ctx, pixel.x, pixel.y, value);
    }  

    function gameboy(pixel, noiseValue){
        let value = Numbers.scale(noiseValue, -1, 1, 0, 100);
        SpecialPixels.drawGameboy(ctx, pixel.x, pixel.y, pixel.diameter, value);
    }
    
    function crt(pixel, noiseValue){
        const { r: red, g: green, b: blue } = Color.hslToRgb(Numbers.scale(noiseValue, -1, 1, 0, 360), 100, 50);
        SpecialPixels.drawCRT(ctx, pixel.x, pixel.y, pixel.diameter, red, green, blue);
    }
    
    function sin(pixel, noiseValue){
        let amplitude = Numbers.scale(noiseValue, -1, 1, 0, pixel.diameter);
        Drawing.drawSin(ctx, pixel.x, pixel.y, pixel.diameter, amplitude);
    }

    let init = () => {
		globals.random = Objects.getRandomObject();
        globals.noise = new Noise(globals.random);
        if (config.randomize) randomize();
        initCanvas();
        config.pixelDiameter = globals.random.nextInt(5, 25);   
        if (config.functionIndex != 9 && config.functionIndex != 10 &&  config.functionIndex != 11)     
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
        if (config.functionIndex != 10 && config.functionIndex != 11)
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
