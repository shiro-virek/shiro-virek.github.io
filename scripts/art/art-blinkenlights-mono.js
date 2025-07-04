{
    const globals = {
        random: null,
        cellScreen: null,
        mutationCounter: 0,
        canvasImg: document.getElementById('auxCanvas'),
        ctxImg: null,
        img: new Image(),
        imgData: null,
    };

    const config = {
        cellRows: 50,
        cellColumns: 50,
        cellMargin: 0,
        cellPadding: 0,
        cellDiameter: 20,
        extendedSize: 2,
        circleRadius: 2,
    };
        
    const Condition = Object.freeze({
        Lower: Symbol("lower"),        
        Greater: Symbol("greater"),
        Between: Symbol("between"),
        Equal: Symbol("equal")
    });

    const NeighborhoodType = Object.freeze({
        VonNeumann: Symbol("vonneumann"),        
        Moore: Symbol("moore"),
        Extended: Symbol("extended"),
        Diagonal: Symbol("diagonal"),
        Circle: Symbol("circle"),
        Circunference: Symbol("circunference"),
    });

    class Neighborhood {
        constructor(){
            this.rules = []; 
            this.neighborhoodType = NeighborhoodType.Moore;
        }
    }

    class Rule {
        constructor(aliveStatusRequired, conditionNeighbours, valueNeighbours, value2Neighbours, newValueCell){
            this.valueNeighbours = valueNeighbours;
            this.value2Neighbours = value2Neighbours;
            this.conditionNeighbours = conditionNeighbours;
            this.newValueCell = newValueCell;
            this.aliveStatusRequired = aliveStatusRequired;
        }
    }

    class CellScreen {
        constructor() {
            this.cells = [];
            this.cellsBuffer = [];         
            this.neighborhoods = [];   
            this.generateCells();
        }

        generateCells = () => {
            for (let x = 0; x <= config.cellColumns; x++) {
                this.cells[x] = new Array(config.cellRows);
                this.cellsBuffer[x] = new Array(config.cellRows);
            }

            for (let x = 0; x <= config.cellColumns; x++) {
                for (let y = 0; y <= config.cellRows; y++) {
                    let cell = new Cell(x, y);
                    this.cells[x][y] = cell;
                    let cellBuffer = new Cell(x, y);
                    this.cellsBuffer[x][y] = cellBuffer;
                }
            }
        }

        draw = (ctx) => {
            for (let x = 0; x <= config.cellColumns; x++) {
                for (let y = 0; y <= config.cellRows; y++) {
                    this.cellsBuffer[x][y].draw(ctx);
                }
            }
        }

        copyBuffer = () => {
            for (let x = 0; x <= config.cellColumns; x++) {
                for (let y = 0; y <= config.cellRows; y++) {
                    this.cells[x][y].alive = this.cellsBuffer[x][y].alive;
                }
            }    
        }
        
        isCellAliveSafe = (x, y) => {
            if (x < 0 || y < 0 || x >= config.cellColumns || y >= config.cellRows)
                return 0
            else
                return this.cells[x][y].alive;
        }

        getNeighboursCountCircunference = (x, y, radius) => {
            let neighboursCount = 0;
            let i = 0;
            let j = radius;
            let d = 3 - 2 * radius; //Bresenham
        
            while (i <= j) {
                const points = [
                    [x + i, y + j],
                    [x + j, y + i],
                    [x - i, y + j],
                    [x - j, y + i],
                    [x + i, y - j],
                    [x + j, y - i],
                    [x - i, y - j],
                    [x - j, y - i],
                ];
            
                points.forEach(([px, py]) => {
                    if (px >= 0 && px < this.cells.length && py >= 0 && py < this.cells[0].length) {
                        if (this.isCellAliveSafe(px, py)) neighboursCount++;
                    }
                });
        
                if (d < 0) {
                    d = d + 4 * i + 6;
                } else {
                    d = d + 4 * (i - j) + 10;
                    j--;
                }
                i++;
            }

            return neighboursCount;
        }

        getNeighboursCount = (neighborhood, x, y) => {
            let neighboursCount = 0;

            switch(neighborhood.neighborhoodType){
                case NeighborhoodType.Extended:
                    for(let h=x-config.extendedSize; h<=x+config.extendedSize; h++){
                        for(let v=y-config.extendedSize; v<=y+config.extendedSize; v++){
                            if ((h!=x || v!=y) && (this.isCellAliveSafe(h, v))) neighboursCount++;
                        }
                    }
                    break;
                case NeighborhoodType.Moore:
                    if (this.isCellAliveSafe(x, y-1)) neighboursCount++;
                    if (this.isCellAliveSafe(x, y+1)) neighboursCount++;
                    if (this.isCellAliveSafe(x-1, y)) neighboursCount++;
                    if (this.isCellAliveSafe(x+1, y)) neighboursCount++;
                    break;
                case NeighborhoodType.VonNeumann:
                    if (this.isCellAliveSafe(x, y-1)) neighboursCount++;
                    if (this.isCellAliveSafe(x, y+1)) neighboursCount++;
                    if (this.isCellAliveSafe(x-1, y-1)) neighboursCount++;
                    if (this.isCellAliveSafe(x+1, y-1)) neighboursCount++;
                    if (this.isCellAliveSafe(x-1, y)) neighboursCount++;
                    if (this.isCellAliveSafe(x+1, y)) neighboursCount++;
                    if (this.isCellAliveSafe(x-1, y+1)) neighboursCount++;
                    if (this.isCellAliveSafe(x+1, y+1)) neighboursCount++;
                    break;
                case NeighborhoodType.Circunference:
                    neighboursCount = this.getNeighboursCountCircunference(x, y, config.circleRadius);
                    break;
                case NeighborhoodType.Circle:
                    for (let i = 0; i < this.cells.length; i++) {
                        for (let j = 0; j < this.cells[i].length; j++) {
                            let squareDistance = (i - x) * 2 + (j - y) * 2;
                            
                            if (squareDistance <= config.circleRadius ** 2) {
                                if (this.isCellAliveSafe(i, j)) neighboursCount++;
                            }
                        }
                    }
                    break;
                case NeighborhoodType.Diagonal:
                    if (this.isCellAliveSafe(x-1, y-1)) neighboursCount++;
                    if (this.isCellAliveSafe(x-1, y+1)) neighboursCount++;
                    if (this.isCellAliveSafe(x+1, y-1)) neighboursCount++;
                    if (this.isCellAliveSafe(x+1, y+1)) neighboursCount++;
                    break;
            }

            return neighboursCount;
        }

        ruleFulfilcell = (rule, neighboursCount, cellValue) => {
            let result = false;
            switch(rule.conditionNeighbours){
                case Condition.Lower:
                    result = (neighboursCount < rule.valueNeighbours);
                    break;
                case Condition.Greater:
                    result = (neighboursCount > rule.valueNeighbours);
                    break;        
                case Condition.Between:
                    result = (neighboursCount >= rule.valueNeighbours && neighboursCount <= rule.value2Neighbours);
                    break;        
                case Condition.Equal:
                    result = (neighboursCount == rule.valueNeighbours);
                    break;    
            }

            result = result && (rule.aliveStatusRequired == cellValue);

            return result;
        }

        calculateCellStatus = (x, y) => {  
            let cellStatus = this.isCellAliveSafe(x, y);
            
            let cellFinalStatus = false;
            
            this.neighborhoods.forEach(neighborhood => {
                neighborhood.rules.forEach(rule => {
                    let neighboursCount = 0;

                    neighboursCount = this.getNeighboursCount(neighborhood, x, y);

                    if (this.ruleFulfilcell(rule, neighboursCount, cellStatus)) {
                        cellFinalStatus = cellFinalStatus || rule.newValueCell;
                    }
                });
            });   

            this.cellsBuffer[x][y].alive = cellFinalStatus;
        }

        update = () => {            
            for (let x = 0; x <= config.cellColumns; x++) {
                for (let y = 0; y <= config.cellRows; y++) {
                    this.calculateCellStatus(x, y);
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
            this.alive = false;
        }

        getColor = () => {
            return `hsl(${0}, ${100}%, ${this.alive ? 100 : 0}%)`;
        }

        draw = (ctx) => {
            Drawing.drawSquare(ctx, this.x, this.y, this.diameter, 0, this.getColor())
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
                    globals.cellScreen.cells[x][y].alive = lightness > 120;
                }
            }
        };
    }

    let init = () => {       
        initCanvas();
        
        globals.ctxImg = globals.canvasImg.getContext("2d", { willReadFrequently: true });
        
        randomize();

        addEvents();

        window.requestAnimationFrame(loop);
    }

    let addEvents = () => {  
    }

    let randomize = () => {
        globals.random = Objects.getRandomObject();

        config.cellDiameter = globals.random.nextInt(5, 15);        
        config.extendedSize = globals.random.nextInt(1, 3);
        config.circleRadius = globals.random.nextInt(1, 5);

        config.cellRows = Math.floor((height - config.cellMargin)/ (config.cellDiameter + config.cellPadding));
        config.cellColumns = Math.floor((width - config.cellMargin)/ (config.cellDiameter + config.cellPadding));
        
        globals.cellScreen = new CellScreen();
        
        initializePatterns();
        
        setBalancedRules();
    }

    let initializePatterns = () => {
        for (let x = 0; x <= config.cellColumns; x += globals.random.nextInt(2, 5)) {
            for (let y = 0; y <= config.cellRows; y += globals.random.nextInt(2, 5)) {
                if (globals.random.nextBool()) {
                    for (let dx = 0; dx < 2; dx++) {
                        for (let dy = 0; dy < 2; dy++) {
                            if (x + dx <= config.cellColumns && y + dy <= config.cellRows) {
                                globals.cellScreen.cells[x + dx][y + dy].alive = true;
                            }
                        }
                    }
                }
            }
        }

        for (let i = 0; i < 10; i++) {
            if (globals.random.nextBool()) {
                let y = globals.random.nextInt(0, config.cellRows);
                for (let x = 0; x <= config.cellColumns; x++) {
                    globals.cellScreen.cells[x][y].alive = true;
                }
            } else {
                let x = globals.random.nextInt(0, config.cellColumns);
                for (let y = 0; y <= config.cellRows; y++) {
                    globals.cellScreen.cells[x][y].alive = true;
                }
            }
        }
    }

    let setBalancedRules = () => {
        globals.cellScreen.neighborhoods = [];

        let baseNeighborhood = new Neighborhood();
        baseNeighborhood.neighborhoodType = NeighborhoodType.Moore;
        
        baseNeighborhood.rules.push(new Rule(
            false, 
            Condition.Equal,
            3,
            0,
            true
        ));
        
        baseNeighborhood.rules.push(new Rule(
            true,
            Condition.Between,
            2,
            3,
            true
        ));
        
        globals.cellScreen.neighborhoods.push(baseNeighborhood);

        let specialNeighborhood = new Neighborhood();
        let types = [NeighborhoodType.Diagonal, NeighborhoodType.Circunference, NeighborhoodType.Extended];
        specialNeighborhood.neighborhoodType = types[globals.random.nextInt(0, types.length - 1)];
        
        let conditionTypes = [Condition.Lower, Condition.Greater, Condition.Between];
        let condition = conditionTypes[globals.random.nextInt(0, conditionTypes.length - 1)];
        
        let min = globals.random.nextInt(1, 3);
        let max = globals.random.nextInt(min, min + 2);
        
        specialNeighborhood.rules.push(new Rule(
            globals.random.nextBool(),
            condition,
            min,
            max,
            globals.random.nextBool()
        ));
        
        globals.cellScreen.neighborhoods.push(specialNeighborhood);    
    }

    window.draw = () => {
        globals.cellScreen.update();
        drawBackground(ctx, canvas);
        globals.cellScreen.draw(ctx);
        globals.cellScreen.copyBuffer();

        config.mutationCounter++;
        if (config.mutationCounter % 50 === 0) {
            setBalancedRules();
        }

        Browser.sleep(globals.random.nextInt(50, 200));
    }

    window.trackMouse = (xMouse, yMouse) => {
    }
    
    window.clearCanvas = () => {          
		Sound.error();
    }

	window.magic = () => {  
		setBalancedRules();
        Sound.tada();
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