{
    const globals = {
        mouseX: 0,
        mouseY: 0,
        clicking: false,
        mouseMoved: false,
        lastPosX: 0,
        lastPosY: 0
    };

    let pixelRows = 50;
    let pixelColumns = 50;

    let pixelMargin = 30;
    let pixelPadding = 30;
    let pixelDiameter = 20;
    let pixelRadius = pixelDiameter / 2;

    let growSpeed = 0.5;
    let shrinkSpeed = 0.3;
    let maxSize = 100;

    let transparent = false;
    let rotate = false;
    let slowDown = false;
    let stopOnBlur = false

    let hue = 100;

    let pixelScreen;

    let clicking = false;

    const Figures = Object.freeze({
        Square: Symbol("square"),
        Circle: Symbol("circle")
    });

    class PixelScreen {
        constructor() {
            this.pixels = [];
            this.generatePixels();
            let rand = Utils.getRandomInt(0, Object.keys(Figures).length - 1);
            this.shape = Figures[Object.keys(Figures)[rand]];
        }

        generatePixels = () => {
            for (let x = 0; x <= pixelColumns; x++) {
                this.pixels[x] = new Array(pixelRows);
            }

            for (let x = 0; x <= pixelColumns; x++) {
                for (let y = 0; y <= pixelRows; y++) {
                    let pixel = new Pixel(x, y);
                    this.pixels[x][y] = pixel;
                }
            }
        }

        getPixelByMousePosition = (x, y) => {
            let col = Math.round((x - pixelMargin) / ((pixelDiameter) + pixelPadding));
            let row = Math.round((y - pixelMargin) / ((pixelDiameter) + pixelPadding));
            return { col: col, row: row };

        }

        isPixelClicked = (col, row) => {
            let pixelPos = this.getPixelByMousePosition(globals.mouseX, globals.mouseY);
            return (pixelPos.col == col && pixelPos.row == row && globals.clicking);
        }

        activatePixel = (x, y) => {
            let pixelPos = this.getPixelByMousePosition(x, y);
            this.pixels[pixelPos.col][pixelPos.row].growing = growSpeed;
            this.pixels[pixelPos.col][pixelPos.row].rotating = growSpeed;
        }

        movePixel = (col, row) => {        
            this.pixels[col][row].diameter += this.pixels[col][row].growing;
            this.pixels[col][row].radius = this.pixels[col][row].diameter / 2;
            this.pixels[col][row].angle += this.pixels[col][row].rotating;

            if ((!this.isPixelClicked(col, row) && stopOnBlur)    
                || (this.pixels[col][row].diameter > maxSize) && !stopOnBlur){
                this.pixels[col][row].growing = -shrinkSpeed;
                this.pixels[col][row].rotating = -shrinkSpeed      
            }else{
                if (slowDown){
                    this.pixels[col][row].growing -= 0.005;  
                    this.pixels[col][row].rotating -= 0.005;                      
                }
            }

            if (this.pixels[col][row].diameter <= pixelDiameter)
            {
                this.pixels[col][row].growing = 0;
                this.pixels[col][row].diameter = pixelDiameter;
            }

            if (this.pixels[col][row].angle <= 0){
                this.pixels[col][row].rotating = 0;                
                this.pixels[col][row].angle = 0;
            }
        }

        draw = (ctx) => {
            for (let x = 0; x <= pixelColumns; x++) {
                for (let y = 0; y <= pixelRows; y++) {
                    this.pixels[x][y].draw(ctx);
                }
            }
        }

        update = () => {
            for (let x = 0; x <= pixelColumns; x++) {
                for (let y = 0; y <= pixelRows; y++) {
                    this.movePixel(x, y);
                }
            }
        }
    }

    class Pixel {
        constructor(column, row) {
            this.diameter = pixelDiameter;
            this.radius = pixelRadius;
            this.row = row;
            this.column = column;
            this.x = pixelMargin + column * pixelPadding + column * this.diameter;
            this.y = pixelMargin + row * pixelPadding + row * this.diameter;            
            this.hue = hue;
            this.growing = 0;
            this.angle = 0;
            this.rotating = 0;
        }

        getColor = (opacity = 1.0) => {
            return `hsl(${this.hue}, 100%, 50%, ${opacity})`;
        }

        draw = (ctx) => {
            let opacity = transparent ? this.diameter / maxSize : 1;
            switch (pixelScreen.shape) {
                case Figures.Circle:
                    Utils.drawCircle(ctx, this.x + pixelRadius, this.y + pixelRadius, this.radius, this.getColor(opacity), this.getColor(opacity));
                    break;
                case Figures.Square:
                    Utils.drawSquare(ctx, this.x, this.y, this.diameter, rotate ? this.angle : 0, this.getColor(opacity), this.getColor(opacity));
                    break;
            }
        }
    }

    let init = () => {
        initCanvas();
        randomize();

        pixelRows = Math.floor((height - pixelMargin) / (pixelDiameter + pixelPadding));
        pixelColumns = Math.floor((width - pixelMargin) / (pixelDiameter + pixelPadding));
        pixelScreen = new PixelScreen();

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
            pixelScreen.activatePixel(x, y);
        }

        globals.lastPosX = x;
        globals.lastPosY = y;
    }

    let randomize = () => {
        slowDown = Utils.getRandomBool();
        stopOnBlur = Utils.getRandomBool();
        transparent = Utils.getRandomBool();
        pixelDiameter = Utils.getRandomInt(5, 20);
        pixelPadding = Utils.getRandomInt(0, 20);
        pixelMargin = pixelPadding;
        hue = Utils.getRandomInt(0, 255);
        if (stopOnBlur)
            growSpeed = Utils.getRandomFloat(5.0, 10.0, 1)
        else
            growSpeed = Utils.getRandomFloat(0.5, 2.0, 1);
        shrinkSpeed = Utils.getRandomFloat(0.1, 2.0, 1);
        maxSize = Utils.getRandomInt(pixelDiameter + 1, 255);
        rotate = Utils.getRandomBool();
    }

    let draw = () => {
        drawBackground(ctx, canvas);
        pixelScreen.draw(ctx);
    }

    let loop = (timestamp) => {
        let progress = timestamp - lastRender;

        pixelScreen.update();

        draw();

        lastRender = timestamp;
        window.requestAnimationFrame(loop);
    }

    init();
    
	window.clearCanvas = () => {
	}
}
