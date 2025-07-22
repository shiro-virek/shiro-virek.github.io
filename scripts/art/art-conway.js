{
    const globals = {
		random: null,
        cellScreen: null,
        canvasImg: document.getElementById('auxCanvas'),
        ctxImg: null,
        img: new Image(),
        imgData: null,
    };
    
    const config = {
        randomize: true,
        colorOff: "#222",
        cellRows: 50,
        cellColumns: 50,
        cellMargin: 30,
        cellPadding: 30,
        cellDiameter: 20,
        hue: 150,
    };
    
    const Figures = Object.freeze({
		Square: Symbol("square"),
		Circle: Symbol("circle")
	});

    class CellScreen {
        constructor() {            
            this.generateCells();     
			let rand = globals.random.nextInt(0, Object.keys(Figures).length - 1);
			this.shape = Figures[Object.keys(Figures)[rand]];     
        }

        generateCells = () => {
            this.cells = [];
            this.cellsBuffer = [];
            for (let x = 0; x < config.cellColumns; x++) {
                this.cells[x] = new Array(config.cellRows);
                this.cellsBuffer[x] = new Array(config.cellRows);
            }

            for (let x = 0; x < config.cellColumns; x++) {
                for (let y = 0; y < config.cellRows; y++) {
                    let cell = new Cell(x, y);
                    this.cells[x][y] = cell;
                    let cellBuffer = new Cell(x, y);
                    this.cellsBuffer[x][y] = cellBuffer;
                    this.cells[x][y].on =  globals.random.nextBool();
                }
            }  
        }

        setCell = (x, y) => {            
            let col = Math.round((x - config.cellMargin) / ((config.cellDiameter) + config.cellPadding));
            let row = Math.round((y - config.cellMargin) / ((config.cellDiameter) + config.cellPadding));
            this.cells[col][row].on = true;
            this.cellsBuffer[col][row].on = true;
        }

        draw = (ctx) => {
            for (let x = 0; x < config.cellColumns; x++) {
                for (let y = 0; y < config.cellRows; y++) {
                    this.cellsBuffer[x][y].draw(ctx);
                }
            }
        }

        copyBuffer = () => {
            for (let x = 0; x < config.cellColumns; x++) {
                for (let y = 0; y < config.cellRows; y++) {
                    this.cells[x][y].on =  this.cellsBuffer[x][y].on;
                }
            }    
        }

        getCellValueSafe = (x, y) => {
            if (x < 0 || y < 0 || x >= config.cellColumns || y >= config.cellRows)
                return false
            else
                return this.cells[x][y];
        }

        calculateCellStatus = (x, y) => {
            let value = false;
            let sum = 0;

            if (this.getCellValueSafe(x, y-1).on) sum++;
            if (this.getCellValueSafe(x, y+1).on) sum++;
            if (this.getCellValueSafe(x-1, y-1).on) sum++;
            if (this.getCellValueSafe(x+1, y-1).on) sum++;
            if (this.getCellValueSafe(x-1, y).on) sum++;
            if (this.getCellValueSafe(x+1, y).on) sum++;
            if (this.getCellValueSafe(x-1, y+1).on) sum++;
            if (this.getCellValueSafe(x+1, y+1).on) sum++;

            if (this.cells[x][y].on && (sum < 2 || sum > 3)) value = false;
            if (this.cells[x][y].on && sum >= 2 && sum <= 3) value = true;
            if (!this.cells[x][y].on && sum == 3) value = true;

            return value;
        }

        update = () => {            
            for (let x = 0; x < config.cellColumns; x++) {
                for (let y = 0; y < config.cellRows; y++) {
                    this.cellsBuffer[x][y].on =  this.calculateCellStatus(x, y);
                }
            }                  
        }
    }

    class Cell {
        constructor(column, row) {
            this.diameter = config.cellDiameter;
            this.radius = config.cellDiameter / 2;
            this.row = row;
            this.column = column;
            this.x = config.cellMargin + column * config.cellPadding + column * this.diameter;
            this.y = config.cellMargin + row * config.cellPadding + row * this.diameter;
            this.on = false;
            this.color = `hsl(${config.hue}, 100%, 50%)`;
        }

        draw = (ctx) => {
            let color = this.on ? this.color : config.colorOff;

            switch(globals.cellScreen.shape){
                case Figures.Circle:
                    Drawing.drawCircle(ctx, this.x + this.radius, this.y + this.radius, this.radius, color)
                    break;
                case Figures.Square:                    
                    Drawing.drawRectangle(ctx, this.x, this.y, this.diameter, this.diameter, color);
                    break;
            }
        }
    }

    let loadImage = (source = '../assets/Picture1.jpg') => {
        globals.img.src = source;

        globals.img.onload = function () {
            globals.canvasImg.width = config.cellColumns;
            globals.canvasImg.height = config.cellRows;

            const { newImgHeight, newImgWidth, newOriginX, newOriginY } = Screen.adaptImageToScreen(globals.img, globals.canvasImg);
            
            globals.ctxImg.drawImage(globals.img, newOriginX, newOriginY, newImgWidth, newImgHeight);

            globals.imgData = globals.ctxImg.getImageData(0, 0, config.cellColumns, config.cellRows).data;
            for (let y = 0; y < config.cellRows; y++) {
                for (let x = 0; x < config.cellColumns; x++) {
                    let i = y * config.cellColumns + x;
                    const r = globals.imgData[i * 4 + 0];
                    const g = globals.imgData[i * 4 + 1];
                    const b = globals.imgData[i * 4 + 2];
                    const a = globals.imgData[i * 4 + 3];

                    let lightness = Color.getLightness(r, g, b);
                    globals.cellScreen.cells[x][y].on = lightness > 120;
                }
            }
        };
    }

    let init = () => {
		initCanvas();
        globals.ctxImg = globals.canvasImg.getContext("2d", { willReadFrequently: true });
        globals.random = Objects.getRandomObject();
        config.cellDiameter = globals.random.nextInt(5, 20);        
        config.cellPadding = globals.random.nextInt(0, 20);
        config.cellMargin = config.cellPadding;

        config.cellRows = Math.floor((height - config.cellMargin)/ (config.cellDiameter + config.cellPadding));
        config.cellColumns = Math.floor((width - config.cellMargin)/ (config.cellDiameter + config.cellPadding));        
        globals.cellScreen = new CellScreen();
        
        if (config.randomize) randomize();

        addEvents();
        window.requestAnimationFrame(loop)
    }

    let addEvents = () => {        
		canvas.addEventListener('click', e => {
			globals.cellScreen.setCell(e.offsetX, e.offsetY);
		}, false);
    }

    let randomize = () => {        
        config.hue = globals.random.nextInt(0, 255); 
    }

    window.draw = () => {
        globals.cellScreen.update();
        
        drawBackground(ctx, canvas);
        globals.cellScreen.draw(ctx);
        globals.cellScreen.copyBuffer();

        Browser.sleep(200);
    }

    window.trackMouse = (xMouse, yMouse) => {
    }
    
	window.clearCanvas = () => {         
        globals.cellScreen.generateCells();  
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
