{    
    const globals = {
        random: null,
        ledScreen: null,
        canvasImg: document.getElementById('auxCanvas'),
        ctxImg: null,
        img: new Image(),
        imgData: null,
    };

    const Figures = Object.freeze({
        SquareSize: Symbol("squareSize"),
		SquareLightness: Symbol("squareLightness"),
		CircleSize: Symbol("circleSize"),
		CircleLightness: Symbol("circleLightness"),
        HexagonLightness: Symbol("hexagonLightness"),
        HexagonLightness: Symbol("hexagonLightness"),
        Emoji: Symbol("Emoji"),
        Ascii: Symbol("Ascii"),
        Ansi: Symbol("Ansi"),
        Gameboy: Symbol("Gameboy"),
        Character: Symbol("Character"),
        Bar: Symbol("Bar"),
        CRT: Symbol("CRT"),
        Sin: Symbol("Sin"),
	});

    const config = { 
        randomize: true,
        ledRows: 50,
        ledColumns: 50,
        ledMargin: 0,
        ledPadding: 0,
        ledDiameter: 20,
        hue: 150,
        valueIncrement: 1,
        alternatePixel: false,
        shape: Figures.SquareLightness,
    };
    
    class LedScreen {
        constructor() {      
            this.generateLeds();          
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
            if (this.leds[col][row].lightness < 100) this.leds[col][row].lightness += config.valueIncrement;
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
            if (config.alternatePixel)
                this.y = this.column % 2 == 0 ? this.y : this.y + this.radius;
            this.lightness = 0;
        }

        draw = (ctx) => {
            let color = null;
            let size = null;
            let value = 0;
            switch(config.shape){                
                case Figures.CircleSize:
                    size = Numbers.scale(this.lightness, 0, 100, 0, config.ledDiameter + config.ledMargin);
                    color = `hsl(${config.hue}, 100%, 50%)`;
                    Drawing.drawCircle(ctx, this.x, this.y, size, color)
                    break;
                case Figures.SquareSize:        
                    size = Numbers.scale(this.lightness, 0, 100, 0, config.ledDiameter + config.ledMargin);
                    color = `hsl(${config.hue}, 100%, 50%)`;            
                    Drawing.drawRectangle(ctx, this.x - size, this.y - size, size * 2, size * 2, color);
                    break;
                case Figures.HexagonSize:
                    size = Numbers.scale(this.lightness, 0, 100, 0, config.ledDiameter + config.ledMargin);
                    color = `hsl(${config.hue}, 100%, 50%)`;
                    Drawing.drawPolygon(ctx, this.x, this.y, size, 6, 0, color);
                    break;
                case Figures.CircleLightness:
                    color = `hsl(${config.hue}, 100%, ${this.lightness}%)`
                    size = this.radius;
                    Drawing.drawCircle(ctx, this.x, this.y, size, color)
                    break;
                case Figures.SquareLightness:     
                    color = `hsl(${config.hue}, 100%, ${this.lightness}%)`
                    size = this.radius;               
                    Drawing.drawRectangle(ctx, this.x - size, this.y - size, size * 2, size * 2, color);
                    break;
                case Figures.HexagonLightness:
                    color = `hsl(${config.hue}, 100%, ${this.lightness}%)`
                    size = this.radius;
                    Drawing.drawPolygon(ctx, this.x, this.y, size, 6, 0, color);
                    break;
                case Figures.Emoji:
                    SpecialPixels.drawEmoji(ctx, this.x, this.y, 100 - this.lightness);
                    break;
                case Figures.Ascii:             
                    SpecialPixels.drawAscii(ctx, this.x, this.y, 100 - this.lightness);
                    break;
                case Figures.Ansi:    
                    SpecialPixels.drawAnsi(ctx, this.x, this.y, 100 - this.lightness);
                    break;
                case Figures.Gameboy:    
                    SpecialPixels.drawGameboy(ctx, this.x, this.y, config.ledDiameter, 100 - this.lightness);
                    break;
                case Figures.Character:    
                    value = Numbers.scale(this.lightness, 0, 100, 5, 40);
                    SpecialPixels.drawCharacter(ctx, this.x, this.y, value);
                    break;
                case Figures.Bar:    
                    let angle = Numbers.scale(this.lightness, 0, 100, 0, 360);
                    SpecialPixels.drawBar(ctx, this.x, this.y, config.ledDiameter, angle);
                    break;
                case Figures.CRT:
                    const { r: red, g: green, b: blue } = Color.hslToRgb(100, 100, 100 - this.lightness);
                    SpecialPixels.drawCRT(ctx, this.x, this.y, config.ledDiameter, red, green, blue);
                    break;
                case Figures.Sin:
                    let amplitude = Numbers.scale(this.lightness, 0, 100, 0, config.ledDiameter / 2);
                    Drawing.drawSin(ctx, this.x, this.y, config.ledDiameter, amplitude);
                    break;
            }
        }
    }

    let loadImage = (source = '../assets/Picture1.jpg') => {
        globals.img.src = source;

        globals.img.onload = function () {
            globals.canvasImg.width = config.ledColumns;
            globals.canvasImg.height = config.ledRows;

            const { newImgHeight, newImgWidth, newOriginX, newOriginY } = Screen.adaptImageToScreen(globals.img, globals.canvasImg);
            
            globals.ctxImg.drawImage(globals.img, newOriginX, newOriginY, newImgWidth, newImgHeight);

            globals.imgData = globals.ctxImg.getImageData(0, 0, config.ledColumns, config.ledRows).data;

            for (let y = 0; y < config.ledRows; y++) {
                for (let x = 0; x < config.ledColumns; x++) {
                    let index = y * config.ledColumns + x;
                    globals.ledScreen.leds[x][y].r = globals.imgData[index];
                    globals.ledScreen.leds[x][y].g = globals.imgData[index + 1];
                    globals.ledScreen.leds[x][y].b = globals.imgData[index + 2];
                    globals.ledScreen.leds[x][y].lightness =  Numbers.scale(Color.getLightness(globals.imgData[index], globals.imgData[index+1], globals.imgData[index+2]), 0, 250, 0, 100);
                }
            }
        };
    }

    let init = () => {
        initCanvas();
        globals.ctxImg = globals.canvasImg.getContext("2d", { willReadFrequently: true });
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
		let rand = globals.random.nextInt(0, Object.keys(Figures).length - 1);   
		config.shape = Figures[Object.keys(Figures)[rand]];  
        if (config.shape != Figures.Gameboy && config.shape != Figures.Sin)
            config.alternatePixel = globals.random.nextBool();        
        if (config.shape != Figures.CRT && config.shape != Figures.Gameboy && config.shape != Figures.Sin)        
            config.ledPadding = globals.random.nextInt(0, 10);
        config.ledMargin = config.ledPadding;   
        config.hue = globals.random.nextInt(0, 255);    
    }

    window.draw = () => {
        globals.ledScreen.update();
        drawBackground(ctx, canvas);
        globals.ledScreen.draw(ctx);
    }

    window.trackMouse = (xMouse, yMouse) => {    
        if (clicking){            
            let points = Trigonometry.bresenhamLine(Math.floor(lastPosX), Math.floor(lastPosY), Math.floor(xMouse), Math.floor(yMouse));
            for (const p of points) {                
                globals.ledScreen.setPixel(p.x, p.y);
            }                
        }   
    }

	window.clearCanvas = () => {		
        globals.ledScreen.generateLeds();  
	}

	window.magic = () => {  
		Sound.error();
	}

    window.upload = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            if (!file.type.match('image.*')) {
                alert('Please select an image file');
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = function(event) {                    
                globals.img.onerror = function() {
                    alert('Error loading image');
                };
            
                loadImage(event.target.result);
            };
            
            reader.onerror = function() {
                alert('Error reading file');
            };
            
            reader.readAsDataURL(file);
        }
    }

    init();
}
