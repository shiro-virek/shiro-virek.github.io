{
    const globals = {
        random: null,
        canvasImg: document.getElementById('auxCanvas'),
        ctxImg: null,
        img: new Image(),
        imgData: null,
        radialScreen
    };

    const config = {
        randomize: true,
    };    


    class RadialScreen {
        constructor() {      
            this.generatePixels();          
        }

        generatePixels = () => {
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
            if (this.leds[col][row].r < 255){
                this.leds[col][row].r += config.valueIncrement;
                this.leds[col][row].g += config.valueIncrement;
                this.leds[col][row].b += config.valueIncrement;
                this.leds[col][row].lightness += config.valueIncrement;
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

    class RadialPixel {
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
            this.r = 0;
            this.g = 0;
            this.b = 0;
        }

        draw = (ctx) => {
            let colour =  "";
            let size = null;
            let value = 0;
            switch(config.shape){                
                case Figures.CircleSize:
                    size = Numbers.scale(this.lightness, 0, 100, 0, config.ledDiameter + config.ledMargin);
                    colour = `hsl(${config.hue}, 100%, 50%)`;
                    Drawing.drawCircle(ctx, this.x, this.y, size, colour)
                    break;
                case Figures.SquareSize:        
                    size = Numbers.scale(this.lightness, 0, 100, 0, config.ledDiameter + config.ledMargin);
                    colour = `hsl(${config.hue}, 100%, 50%)`;            
                    Drawing.drawRectangle(ctx, this.x - size, this.y - size, size * 2, size * 2, colour);
                    break;
                case Figures.HexagonSize:
                    size = Numbers.scale(this.lightness, 0, 100, 0, config.ledDiameter + config.ledMargin);
                    colour = `hsl(${config.hue}, 100%, 50%)`;
                    Drawing.drawPolygon(ctx, this.x, this.y, size, 6, 0, colour);
                    break;
                case Figures.CircleLightness:
                    colour = `hsl(${config.hue}, 100%, ${this.lightness}%)`
                    size = this.radius;
                    Drawing.drawCircle(ctx, this.x, this.y, size, colour);
                    break;
                case Figures.SquareLightness:     
                    colour = `hsl(${config.hue}, 100%, ${this.lightness}%)`
                    size = this.radius;               
                    Drawing.drawRectangle(ctx, this.x - size, this.y - size, size * 2, size * 2, colour);
                    break;
                case Figures.HexagonLightness:
                    colour = `hsl(${config.hue}, 100%, ${this.lightness}%)`;
                    size = this.radius;
                    Drawing.drawPolygon(ctx, this.x, this.y, size, 6, 0, colour);
                    break;
                case Figures.Emoji:
                    SpecialPixels.drawEmoji(ctx, this.x, this.y, 100 - this.lightness);
                    break;
                case Figures.Ascii:             
                    SpecialPixels.drawAscii(ctx, this.x, this.y, 100 - this.lightness);
                    break;
                case Figures.Ansi:    
                    SpecialPixels.drawAnsi(ctx, this.x, this.y, this.lightness);
                    break;
                case Figures.Gameboy:    
                    SpecialPixels.drawGameboy(ctx, this.x, this.y, config.ledDiameter, this.lightness);
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
                    SpecialPixels.drawCRT(ctx, this.x, this.y, config.ledDiameter, this.r, this.g, this.b);
                    break;
                case Figures.Sin:
                    let amplitude = Numbers.scale(this.lightness, 0, 100, 0, config.ledDiameter / 2);
                    let color = `hsl(${config.hue}, 100%, 50%)`;
                    Drawing.drawSin(ctx, this.x, this.y, config.ledDiameter,  amplitude, 1, color, 2);
                    break;
            }
        }
    }

    let loadImage = (source = '../assets/Picture1.jpg') => {
        globals.img.src = source;

        globals.img.onload = function () {
            /*
            globals.canvasImg.width = config.ledColumns;
            globals.canvasImg.height = config.ledRows;

            const { newImgHeight, newImgWidth, newOriginX, newOriginY } = Screen.adaptImageToScreen(globals.img, globals.canvasImg);
            
            globals.ctxImg.drawImage(globals.img, newOriginX, newOriginY, newImgWidth, newImgHeight);

            globals.imgData = globals.ctxImg.getImageData(0, 0, config.ledColumns, config.ledRows).data;

            
            for (let y = 0; y < config.ledRows; y++) {
                for (let x = 0; x < config.ledColumns; x++) {
                    let index = (y * config.ledColumns + x) * 4;
                    globals.ledScreen.leds[x][y].r = globals.imgData[index];
                    globals.ledScreen.leds[x][y].g = globals.imgData[index + 1];
                    globals.ledScreen.leds[x][y].b = globals.imgData[index + 2];
                    globals.ledScreen.leds[x][y].lightness = Numbers.scale(Color.getLightness(globals.imgData[index], globals.imgData[index+1], globals.imgData[index+2]), 0, 250, 0, 100);
                }
            }
            */
        };
    }

    let init = () => {
		globals.random = Objects.getRandomObject();
        if (config.randomize) randomize();
        initCanvas();
        globals.ctxImg = globals.canvasImg.getContext("2d", { willReadFrequently: true });
        config.ledRows = Math.floor((height - config.ledMargin)/ (config.ledDiameter + config.ledPadding));
        config.ledColumns = Math.floor((width - config.ledMargin)/ (config.ledDiameter + config.ledPadding));
        globals.ledScreen = new LedScreen();
        addEvents();
        window.requestAnimationFrame(loop);

        addSpecialControls();
    }

    let addSpecialControls = () => {
        let uploader = document.getElementById('uploader');        

        let handleClick = () => {
            uploader.click();
        }       
        
        Browser.addButton("btnUploadPicture", "🖼️", handleClick);

        uploader.addEventListener('change', function(e) {
            Upload.uploadPicture(e, globals.img, loadImage);
        });
    }

    let addEvents = () => {
    }

    let randomize = () => {
    }
    
    window.draw = (delta) => {                
        globals.radialScreen.update();
        drawBackground(ctx, canvas);
        globals.radialScreen.draw(ctx);

        radialPixel(200, 200, 20, 5, 0, 100, "rgba(255,0,0,1)");
        radialPixel(200, 200, 20, 5, 100, 190, "rgba(255,255,0,1)");
        radialPixel(200, 200, 20, 5, 190, 360, "rgba(0,255,255,1)");

        radialPixel(200, 200, 15, 5, 0, 100, "rgba(255,0,255,1)");
        radialPixel(200, 200, 15, 5, 100, 190, "rgba(0,255,0,1)");
        radialPixel(200, 200, 15, 5, 190, 360, "rgba(255,255,255,1)");

        radialPixel(200, 200, 10, 5, 0, 100, "rgba(255,0,0,1)");
        radialPixel(200, 200, 10, 5, 100, 190, "rgba(255,255,0,1)");
        radialPixel(200, 200, 10, 5, 190, 360, "rgba(0,255,255,1)");

        radialPixel(200, 200, 5, 5, 0, 100, "rgba(255,0,255,1)");
        radialPixel(200, 200, 5, 5, 100, 190, "rgba(0,255,0,1)");
        radialPixel(200, 200, 5, 5, 190, 360, "rgba(255,255,255,1)");

    }

    let getArcEndPoint = (c1,c2,radius,angle) => {
        return [c1+Math.cos(angle)*radius,c2+Math.sin(angle)*radius];
    }

    let radialPixel = (x, y, radius, wideness, startAngle, endAngle, color) => {
        ctx.fillStyle = color;  

        ctx.beginPath();
        startAngle *= Trigonometry.RAD_CONST;
        endAngle *= Trigonometry.RAD_CONST; 
  
        ctx.arc(x, y, radius, startAngle, endAngle, 0);
        ctx.arc(x, y, radius - wideness, endAngle, startAngle, 1);

        ctx.fill();
    }

    window.trackMouse = (x, y) => {
        if (clicking) {  

        }
    }
    
    window.clearCanvas = () => {
		Sound.error();
    }

    init();
}