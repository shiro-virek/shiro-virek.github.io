{
    const globals = {
		random: null,
        ledScreen: null,
        canvasImg: document.getElementById('auxCanvas'),
        ctxImg: null,
        img: new Image(),
        imgData: null,
    };

    const config = { 
        randomize: true,
        colorOff: "#222",
        ledRows: 50,
        ledColumns: 50,
        ledMargin: 30,
        ledPadding: 30,
        ledDiameter: 20,
        hue: 150,
    };
    
    const Figures = Object.freeze({
		Square: Symbol("square"),
		Circle: Symbol("circle"),
        Hexagon: Symbol("hexagon"),
    });
    class LedScreen {
        constructor() {
            this.leds = [];       
            this.generateLeds();          
			let rand = globals.random.nextInt(0, Object.keys(Figures).length - 1);  
			this.shape = Figures[Object.keys(Figures)[rand]];
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

        setPixel = (x, y) => {            
            let col = Math.round((x - config.ledMargin) / ((config.ledDiameter) + config.ledPadding));
            let row = Math.round((y - config.ledMargin) / ((config.ledDiameter) + config.ledPadding));
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
    }

    class Led {
        constructor(column, row) {
            this.diameter = config.ledDiameter;
            this.radius = config.ledDiameter / 2;
            this.row = row;
            this.column = column;
            this.x = config.ledMargin + column * config.ledPadding + column * this.diameter;
            this.y = config.ledMargin + row * config.ledPadding + row * this.diameter;
            this.on = false;
            this.color = `hsl(${config.hue}, 100%, 50%)`;
        }

        draw = (ctx) => {
            let color = this.on ? this.color : config.colorOff;

            switch(globals.ledScreen.shape){
                case Figures.Circle:
                    Drawing.drawCircle(ctx, this.x + this.radius, this.y + this.radius, this.radius, color)
                    break;
                case Figures.Square:                    
                    Drawing.drawRectangle(ctx, this.x, this.y, this.diameter, this.diameter, color);
                    break;
                case Figures.Hexagon:
                    let y = this.x % 2 == 0 ? this.y : this.y + this.radius;
                    Drawing.drawPolygon(ctx, this.x, y, this.radius, 6, 0, color);
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
    }

    let addEvents = () => {        
    }

    let randomize = () => {               
        config.hue = globals.random.nextInt(0, 255);
    }

    window.trackMouse = (xMouse, yMouse) => {
        if (clicking){            
            let points = Trigonometry.bresenhamLine(Math.floor(lastPosX), Math.floor(lastPosY), Math.floor(xMouse), Math.floor(yMouse));
            for (const p of points) {                
                globals.ledScreen.setPixel(p.x, p.y);
            }                
        }    
    }

    window.draw = () => {
        globals.ledScreen.update();
        drawBackground(ctx, canvas);     
        globals.ledScreen.draw(ctx);
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
