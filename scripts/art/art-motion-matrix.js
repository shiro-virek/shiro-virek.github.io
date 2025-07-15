
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
        pixelRows: 50,
        pixelColumns: 50,
        animateNeighbors: true,
        alternatePixel: false,
    };

    const globals = {
        random: null,
        pixelScreen: null,
        canvasImg: document.getElementById('auxCanvas'),
        ctxImg: null,
        img: new Image(),
        imgData: null,
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

        getPixelByMousePosition = (x, y) => {
            let col = Math.round((x - config.pixelMargin) / ((config.pixelDiameter) + config.pixelPadding));
            let row = Math.round((y - config.pixelMargin) / ((config.pixelDiameter) + config.pixelPadding));
            return { col: col, row: row };

        }

        isPixelClicked = (col, row) => {
            let pixelPos = this.getPixelByMousePosition(mouseX, mouseY);
            return (pixelPos.col == col && pixelPos.row == row && clicking);
        }

        activatePixel = (x, y) => {
            if (x >= 0 && y >= 0 && x <= config.pixelColumns && y <= config.pixelRows){
                this.pixels[x][y].growing = config.growSpeed;
                this.pixels[x][y].rotating = config.growSpeed;
            }
        }

        activatePixelAndNeighbours = (x, y) => {
            let pixelPos = this.getPixelByMousePosition(x, y);
            this.activatePixel(pixelPos.col, pixelPos.row);

            if (config.animateNeighbors){
                this.activatePixel(pixelPos.col-1, pixelPos.row-1);
                this.activatePixel(pixelPos.col-1, pixelPos.row);
                this.activatePixel(pixelPos.col, pixelPos.row-1);
                this.activatePixel(pixelPos.col+1, pixelPos.row+1);
                this.activatePixel(pixelPos.col, pixelPos.row+1);
                this.activatePixel(pixelPos.col+1, pixelPos.row);
                this.activatePixel(pixelPos.col+1, pixelPos.row-1);
                this.activatePixel(pixelPos.col-1, pixelPos.row+1);
            }
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

            if (this.pixels[col][row].diameter <= this.pixels[col][row].initialDiameter)
            {
                this.pixels[col][row].growing = 0;
                this.pixels[col][row].diameter = this.pixels[col][row].initialDiameter;
            }

            if (this.pixels[col][row].angle <= this.pixels[col][row].initialAngle){
                this.pixels[col][row].rotating = 0;                
                this.pixels[col][row].angle = this.pixels[col][row].initialAngle;
            }
        }

        draw = (ctx) => {
            const flatList = this.pixels.flat();
            flatList.sort((a, b) => {
                if (isNaN(a.diameter) || isNaN(b.diameter)) {
                    return 0; 
                }
                return a.diameter - b.diameter;
            });	

            flatList.forEach(pixel => {          
                pixel.draw(ctx);     
            });
        }

        update = () => {
            for (let x = 0; x <= config.pixelColumns; x++) {
                for (let y = 0; y <= config.pixelRows; y++) {
                    this.movePixel(x, y);
                }
            }
        }
    }

    class Pixel {
        constructor(column, row) {
            this.diameter = config.pixelDiameter;
            this.initialDiameter = this.diameter;
            this.radius = config.pixelDiameter / 2;
            this.row = row;
            this.column = column;
            this.x = config.pixelMargin + column * config.pixelPadding + column * this.diameter;
            this.y = config.pixelMargin + row * config.pixelPadding + row * this.diameter;          
            if (config.alternatePixel)
                this.y = this.x % 2 == 0 ? this.y : this.y + this.radius;
            this.hue = config.hue;
            this.saturation = 100;
            this.lightness = 50;
            this.growing = 0;
            this.angle = 0;
            this.initialAngle = 0;
            this.rotating = 0;
        }

        getColor = (opacity = 1.0) => {
            return `hsl(${this.hue}, ${this.saturation}%, ${this.lightness}%, ${opacity})`;
        }

        draw = (ctx) => {
            let opacity = config.transparent ? this.diameter / config.maxSize : 1;
            switch (globals.pixelScreen.shape) {
                case Figures.Circle:
                    Drawing.drawCircle(ctx, this.x, this.y, this.diameter / 2, this.getColor(opacity));
                    break;
                case Figures.Square:
                    Drawing.drawSquare(ctx, this.x, this.y, this.diameter, this.angle, this.getColor(opacity));
                    break;
                case Figures.Hexagon:
                    Drawing.drawPolygon(ctx, this.x, this.y, this.diameter / 2, 6, this.angle, this.getColor(opacity));
                    break;
            }
        }
    }

    let init = () => {
        initCanvas();

        globals.ctxImg = globals.canvasImg.getContext("2d", { willReadFrequently: true });

        globals.random = Objects.getRandomObject();
        if (config.randomize) randomize();

        config.pixelRows = Math.floor((height - config.pixelMargin) / (config.pixelDiameter + config.pixelPadding));
        config.pixelColumns = Math.floor((width - config.pixelMargin) / (config.pixelDiameter + config.pixelPadding));
        globals.pixelScreen = new PixelScreen();

        addEvents();
        window.requestAnimationFrame(loop)
    }

    let addEvents = () => {
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
        config.animateNeighbors = globals.random.nextBool();        
        config.alternatePixel = globals.random.nextBool();
    }

    let loadImage = (source = '../assets/Picture1.jpg') => {
        globals.img.src = source;

        globals.img.onload = function () {
            globals.canvasImg.width = config.pixelColumns;
            globals.canvasImg.height = config.pixelRows;

            const { newImgHeight, newImgWidth, newOriginX, newOriginY } = Screen.adaptImageToScreen(globals.img, globals.canvasImg);
            
            globals.ctxImg.drawImage(globals.img, newOriginX, newOriginY, newImgWidth, newImgHeight);

            globals.imgData = globals.ctxImg.getImageData(0, 0, config.pixelColumns, config.pixelRows).data;
            for (let y = 0; y < config.pixelRows; y++) {
                for (let x = 0; x < config.pixelColumns; x++) {
                    let i = y * config.pixelColumns + x;
                    const r = globals.imgData[i * 4 + 0];
                    const g = globals.imgData[i * 4 + 1];
                    const b = globals.imgData[i * 4 + 2];
                    const a = globals.imgData[i * 4 + 3];

                    const { h: hue, s: saturation, l: lightness } = Color.rgbToHsl(r, g, b);
                    globals.pixelScreen.pixels[x][y].hue = hue;
                    globals.pixelScreen.pixels[x][y].saturation = saturation;
                    globals.pixelScreen.pixels[x][y].lightness = lightness;
                }
            }
        };
    }

    window.draw = () => {
        globals.pixelScreen.update();

        drawBackground(ctx, canvas);
        globals.pixelScreen.draw(ctx);
    }

    window.trackMouse = (x, y) => {
        if (clicking) {
            globals.pixelScreen.activatePixelAndNeighbours(x, y);
        }
    }

	window.clearCanvas = () => {
		Sound.error();
	}

	window.magic = () => {  
		const cx = (config.pixelColumns - 1) / 2;
        const cy = (config.pixelRows - 1) / 2;

        for (let y = 0; y <= config.pixelRows; y++) {
            for (let x = 0; x <= config.pixelColumns; x++) {
                
                const distance = Math.sqrt((x - cx)**2 + (y - cy)**2);
                let maxDistance = config.pixelColumns > config.pixelRows ? config.pixelColumns / 2 : config.pixelRows / 2;

                let angle = Numbers.scale(distance, 0, maxDistance, 0, 360);
                globals.pixelScreen.pixels[x][y].angle = angle;
                globals.pixelScreen.pixels[x][y].initialAngle = angle;

                let size = Numbers.scale(distance, 0, maxDistance, config.pixelDiameter, config.pixelDiameter / 3);
                globals.pixelScreen.pixels[x][y].diameter = size;
                globals.pixelScreen.pixels[x][y].initialDiameter = size;
            }
        }
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
