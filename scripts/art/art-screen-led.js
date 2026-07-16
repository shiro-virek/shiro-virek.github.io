{
    const globals = {
		random: null,
        ledScreen: null,
        canvasImg: document.getElementById('auxCanvas'),
        ctxImg: null,
        img: new Image(),
        imgData: null,
        world: null,
    };

    const config = { 
        randomize: true,
        ledRows: 50,
        ledColumns: 50,
        ledMargin: 30,
        ledPadding: 30,
        ledDiameter: 20,
        hue: 150,
        alternatePixel: false,
        FOV: 800,
    };
    
    class LedScreen {
        constructor() {
            this.leds = [];       
            this.generateLeds();          
			let rand = globals.random.nextInt(0, Object.keys(figureTypes).length - 1);  
			this.shape = figureTypes[Object.keys(figureTypes)[rand]];
        }

        clear = () => {
            for (let x = 0; x <= config.ledColumns; x++) {
                for (let y = 0; y <= config.ledRows; y++) {
                    this.leds[x][y].on = false;
                }
            }
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

        setPixel = (col, row) => {           
            if (col > config.ledColumns - 1 || row > config.ledRows - 1 || col < 0 || row < 0) return;
            this.leds[col][row].on = true;
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

        drawLine = (ctx, x1, y1, x2, y2, color) => {
            let points = Trigonometry.bresenhamLine(Math.floor(x1), Math.floor(y1), Math.floor(x2), Math.floor(y2));
            for (const p of points) {
                this.setPixel(p.x , p.y);
            }
        }

        drawPoint = (ctx, x, y, color) => {
            this.setPixel(Math.floor(x) , Math.floor(y));
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
            this.on = false;
        }

        draw = (ctx) => {
            if (this.on){
                Drawing.drawCircle(ctx, this.x + this.radius, this.y + this.radius, this.radius * 2, `hsla(${config.hue}, 100%, 50%, 0.05)`)
                Drawing.drawCircle(ctx, this.x + this.radius, this.y + this.radius, this.radius, `hsla(${config.hue}, 100%, 50%, 0.8)`)
                Drawing.drawCircle(ctx, this.x + this.radius, this.y + this.radius, this.radius / 2, `hsla(${config.hue}, 100%, 90%, 1.0)`)
            }else{ 
                Drawing.drawCircle(ctx, this.x + this.radius, this.y + this.radius, this.radius, `hsla(${config.hue}, 0%, 50%, 0.5)`)
                Drawing.drawCircle(ctx, this.x + this.radius, this.y + this.radius, this.radius / 2, `hsla(${config.hue}, 0%, 50%, 1.0)`)
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
                    let i = y * config.ledColumns + x;
                    const r = globals.imgData[i * 4 + 0];
                    const g = globals.imgData[i * 4 + 1];
                    const b = globals.imgData[i * 4 + 2];
                    const a = globals.imgData[i * 4 + 3];

                    let lightness = Color.getLightness = (r, g, b);
                    globals.ledScreen.leds[x][y].on = lightness > 120;
                }
            }
        };
    }

    let drawFace = () => {

    }

    let init = () => {
        initCanvas();
        globals.ctxImg = globals.canvasImg.getContext("2d", { willReadFrequently: true });
		globals.random = Objects.getRandomObject(); 
        config.ledDiameter = globals.random.nextInt(5, 20);        
        config.ledPadding = globals.random.nextInt(0, 20);
        config.ledMargin = config.ledPadding;       
        if (config.randomize) randomize();
        config.ledRows = Math.floor((height - config.ledMargin)/ (config.ledDiameter + config.ledPadding));
        config.ledColumns = Math.floor((width - config.ledMargin)/ (config.ledDiameter + config.ledPadding));
        globals.ledScreen = new LedScreen();
        
        addEvents();
        window.requestAnimationFrame(loop)

        globals.world = new ThreeDWorld(config.ledColumns, config.ledRows, globals.random, globals.ledScreen.drawLine, globals.ledScreen.drawPoint, drawFace);
        globals.world.addFigure(0, 0);
        globals.world.figures[0].scaleX(0.4);
        globals.world.figures[0].scaleY(0.4);
        globals.world.figures[0].scaleZ(0.4);
    }

    let addEvents = () => {        
    }

    let randomize = () => {               
        config.hue = globals.random.nextInt(0, 255);    
        config.alternatePixel = globals.random.nextBool();
    }

    window.trackMouse = (xMouse, yMouse) => {
        if (clicking){            
            let x1 = Numbers.scale(lastPosX, 0, width, 0, config.ledColumns);
            let y1 = Numbers.scale(lastPosY, 0, height, 0, config.ledRows);
            let x2 = Numbers.scale(xMouse, 0, width, 0, config.ledColumns);
            let y2 = Numbers.scale(yMouse, 0, height, 0, config.ledRows);
            globals.ledScreen.drawLine(ctx, x1, y1, x2, y2, null);
        }    
    }

    window.draw = (delta) => {
        globals.ledScreen.update();
        drawBackground(ctx, canvas);   
        globals.ledScreen.clear();
        if (globals.world.figures.length > 0)  {
            globals.world.figures[0].rotateY(1 * delta / FRAME_TIME);
            globals.world.figures[0].rotateZ(1 * delta / FRAME_TIME);
        }  
        globals.world.draw();
        globals.ledScreen.draw(ctx);
    }

	window.clearCanvas = () => {		
        globals.ledScreen.generateLeds();  
	}

    init();
}
