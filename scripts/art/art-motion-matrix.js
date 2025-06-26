
{
    const config = {
        randomize: true,
        pixelMargin: 30,
        pixelPadding: 30,
        pixelDiameter: 20,
        growSpeed: 0.5,
        shrinkSpeed: 0.3,
        maxSize: 100,
        transparent: false,
        rotate: false,
        slowDown: false,
        stopOnBlur: false,
        hue: 100,
    };

    const globals = {
        mouseX: 0,
        mouseY: 0,
        clicking: false,
        mouseMoved: false,
        lastPosX: 0,
        lastPosY: 0,
        pixelRows: 50,
        pixelColumns: 50,
        pixelScreen: null,
        pixelRadius: config.pixelDiameter / 2,
        random: null
    };

    const Figures = Object.freeze({
        Square: Symbol("square"),
        Circle: Symbol("circle")
    });

    class PixelScreen {
        constructor() {
            this.pixels = [];
            this.generatePixels();
            let rand = globals.random.nextInt(0, Object.keys(Figures).length - 1);
            this.shape = Figures[Object.keys(Figures)[rand]];
        }

        generatePixels = () => {
            for (let x = 0; x <= globals.pixelColumns; x++) {
                this.pixels[x] = new Array(globals.pixelRows);
            }

            for (let x = 0; x <= globals.pixelColumns; x++) {
                for (let y = 0; y <= globals.pixelRows; y++) {
                    let pixel = new Pixel(x, y);
                    this.pixels[x][y] = pixel;
                }
            }
        }

        getPixelByMousePosition = (x, y) => {
            let col = Math.round((x - config.pixelMargin) / ((config.pixelDiameter) + config.pixelPadding));
            let row = Math.round((y - config.pixelMargin) / ((config.pixelDiameter) + config.pixelPadding));
            return { col: col, row: row };

        }

        isPixelClicked = (col, row) => {
            let pixelPos = this.getPixelByMousePosition(globals.mouseX, globals.mouseY);
            return (pixelPos.col == col && pixelPos.row == row && globals.clicking);
        }

        activatePixel = (x, y) => {
            let pixelPos = this.getPixelByMousePosition(x, y);
            this.pixels[pixelPos.col][pixelPos.row].growing = config.growSpeed;
            this.pixels[pixelPos.col][pixelPos.row].rotating = config.growSpeed;
        }

        movePixel = (col, row) => {        
            this.pixels[col][row].diameter += this.pixels[col][row].growing;
            this.pixels[col][row].radius = this.pixels[col][row].diameter / 2;
            this.pixels[col][row].angle += this.pixels[col][row].rotating;

            if ((!this.isPixelClicked(col, row) && config.stopOnBlur)    
                || (this.pixels[col][row].diameter > config.maxSize) && !config.stopOnBlur){
                this.pixels[col][row].growing = -config.shrinkSpeed;
                this.pixels[col][row].rotating = -config.shrinkSpeed      
            }else{
                if (config.slowDown){
                    this.pixels[col][row].growing -= 0.005;  
                    this.pixels[col][row].rotating -= 0.005;                      
                }
            }

            if (this.pixels[col][row].diameter <= config.pixelDiameter)
            {
                this.pixels[col][row].growing = 0;
                this.pixels[col][row].diameter = config.pixelDiameter;
            }

            if (this.pixels[col][row].angle <= 0){
                this.pixels[col][row].rotating = 0;                
                this.pixels[col][row].angle = 0;
            }
        }

        draw = (ctx) => {
            for (let x = 0; x <= globals.pixelColumns; x++) {
                for (let y = 0; y <= globals.pixelRows; y++) {
                    this.pixels[x][y].draw(ctx);
                }
            }
        }

        update = () => {
            for (let x = 0; x <= globals.pixelColumns; x++) {
                for (let y = 0; y <= globals.pixelRows; y++) {
                    this.movePixel(x, y);
                }
            }
        }
    }

    class Pixel {
        constructor(column, row) {
            this.diameter = config.pixelDiameter;
            this.radius = globals.pixelRadius;
            this.row = row;
            this.column = column;
            this.x = config.pixelMargin + column * config.pixelPadding + column * this.diameter;
            this.y = config.pixelMargin + row * config.pixelPadding + row * this.diameter;            
            this.hue = config.hue;
            this.growing = 0;
            this.angle = 0;
            this.rotating = 0;
        }

        getColor = (opacity = 1.0) => {
            return `hsl(${this.hue}, 100%, 50%, ${opacity})`;
        }

        draw = (ctx) => {
            let opacity = config.transparent ? this.diameter / config.maxSize : 1;
            switch (globals.pixelScreen.shape) {
                case Figures.Circle:
                    Drawing.drawCircle(ctx, this.x + globals.pixelRadius, this.y + globals.pixelRadius, this.radius, this.getColor(opacity), this.getColor(opacity));
                    break;
                case Figures.Square:
                    Drawing.drawSquare(ctx, this.x, this.y, this.diameter, config.rotate ? this.angle : 0, this.getColor(opacity), this.getColor(opacity));
                    break;
            }
        }
    }

    let init = () => {
        initCanvas();

        globals.random = Objects.getRandomObject();
        if (config.randomize) randomize();

        globals.pixelRows = Math.floor((height - config.pixelMargin) / (config.pixelDiameter + config.pixelPadding));
        globals.pixelColumns = Math.floor((width - config.pixelMargin) / (config.pixelDiameter + config.pixelPadding));
        globals.pixelScreen = new PixelScreen();

        addEvents();
        window.requestAnimationFrame(loop)
    }

    let addEvents = () => {
        canvas.addEventListener('mousemove', e => {
            globals.mouseMoved = true;
			trackMouse(e.offsetX, e.offsetY);
		}, false);

		canvas.addEventListener('touchstart', function (e) {
            globals.mouseMoved = false;
			globals.clicking = true;
			trackMouse(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
		});

		canvas.addEventListener('touchmove', function (e) {
			e.preventDefault();
            globals.mouseMoved = true;
			trackMouse(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
		});

		canvas.addEventListener('mousedown', e => {
			globals.clicking = true;
            globals.mouseMoved = false;
		}, false);

		canvas.addEventListener('mouseup', e => {
			globals.clicking = false;
		}, false);

		canvas.addEventListener('touchend', e => {
			globals.clicking = false;
		}, false);   
    }

    let trackMouse = (x, y) => {
        if (globals.lastPosX == 0) globals.lastPosX = x;
        if (globals.lastPosY == 0) globals.lastPosY = y;

        globals.mouseX = x;
        globals.mouseY = y;

        if (globals.clicking) {
            globals.pixelScreen.activatePixel(x, y);
        }

        globals.lastPosX = x;
        globals.lastPosY = y;
    }

    let randomize = () => {
        config.slowDown = globals.random.nextBool();
        config.stopOnBlur = globals.random.nextBool();
        config.transparent = globals.random.nextBool();
        config.pixelDiameter = globals.random.nextInt(5, 20);
        config.pixelPadding = globals.random.nextInt(0, 20);
        config.pixelMargin = config.pixelPadding;
        config.hue = globals.random.nextInt(0, 255);
        if (config.stopOnBlur)
            config.growSpeed = globals.random.nextRange(5.0, 10.0, 1)
        else
            config.growSpeed = globals.random.nextRange(0.5, 2.0, 1);
        config.shrinkSpeed = globals.random.nextRange(0.1, 2.0, 1);
        config.maxSize = globals.random.nextInt(config.pixelDiameter + 1, 255);
        config.rotate = globals.random.nextBool();
    }

    let draw = () => {
        drawBackground(ctx, canvas);
        globals.pixelScreen.draw(ctx);
    }

    let loop = (timestamp) => {
        let progress = timestamp - lastRender;

        globals.pixelScreen.update();

        draw();

        lastRender = timestamp;
        window.requestAnimationFrame(loop);
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
