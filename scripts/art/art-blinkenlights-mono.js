{
    const globals = {
        random: null
    };

    let cellRows = 50;
    let cellColumns = 50;

    let cellMargin = 0;
    let cellPadding = 0;
    let cellDiameter = 10;

    let extendedSize = 2;
    let circleRadius = 2;

    let cellScreen;

    let mutationCounter = 0;
            
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
            for (let x = 0; x <= cellColumns; x++) {
                this.cells[x] = new Array(cellRows);
                this.cellsBuffer[x] = new Array(cellRows);
            }

            for (let x = 0; x <= cellColumns; x++) {
                for (let y = 0; y <= cellRows; y++) {
                    let cell = new Cell(x, y);
                    this.cells[x][y] = cell;
                    let cellBuffer = new Cell(x, y);
                    this.cellsBuffer[x][y] = cellBuffer;
                }
            }
        }

        draw = (ctx) => {
            for (let x = 0; x <= cellColumns; x++) {
                for (let y = 0; y <= cellRows; y++) {
                    this.cellsBuffer[x][y].draw(ctx);
                }
            }
        }

        copyBuffer = () => {
            for (let x = 0; x <= cellColumns; x++) {
                for (let y = 0; y <= cellRows; y++) {
                    this.cells[x][y].alive = this.cellsBuffer[x][y].alive;
                }
            }    
        }
        
        isCellAliveSafe = (x, y) => {
            if (x < 0 || y < 0 || x >= cellColumns || y >= cellRows)
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
                    for(let h=x-extendedSize; h<=x+extendedSize; h++){
                        for(let v=y-extendedSize; v<=y+extendedSize; v++){
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
                    neighboursCount = this.getNeighboursCountCircunference(x, y, circleRadius);
                    break;
                case NeighborhoodType.Circle:
                    for (let i = 0; i < this.cells.length; i++) {
                        for (let j = 0; j < this.cells[i].length; j++) {
                            let squareDistance = (i - x) * 2 + (j - y) * 2;
                            
                            if (squareDistance <= circleRadius ** 2) {
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
            for (let x = 0; x <= cellColumns; x++) {
                for (let y = 0; y <= cellRows; y++) {
                    this.calculateCellStatus(x, y);
                }
            }                  
        }
    }

    class Cell {
        constructor(column, row) {
            this.diameter = cellDiameter;
            this.radius = cellDiameter / 2;
            this.row = row;
            this.column = column;
            this.x = cellMargin + column * cellPadding + column * this.diameter;
            this.y = cellMargin + row * cellPadding + row * this.diameter;            
            this.alive = false;
        }

        getColor = () => {
            return `hsl(${0}, ${100}%, ${this.alive ? 100 : 0}%)`;
        }

        draw = (ctx) => {
            Drawing.drawSquare(ctx, this.x, this.y, this.diameter, 0, this.getColor(), this.getColor())
        }
    }

    let init = () => {       
        initCanvas();
        
        randomize();

        addEvents();

        window.requestAnimationFrame(loop);
    }

    let addEvents = () => {  
		canvas.addEventListener('click', e => {
            randomize();
        });
    }

    let randomize = () => {
        globals.random = Objects.getRandomObject();

        cellDiameter = globals.random.nextInt(5, 15);        
        extendedSize = globals.random.nextInt(1, 3);
        circleRadius = globals.random.nextInt(1, 5);

        cellRows = Math.floor((height - cellMargin)/ (cellDiameter + cellPadding));
        cellColumns = Math.floor((width - cellMargin)/ (cellDiameter + cellPadding));
        cellScreen = new CellScreen();
        
        initializePatterns();
        
        setBalancedRules();
    }

    let initializePatterns = () => {
        for (let x = 0; x <= cellColumns; x += globals.random.nextInt(2, 5)) {
            for (let y = 0; y <= cellRows; y += globals.random.nextInt(2, 5)) {
                if (globals.random.nextBool()) {
                    for (let dx = 0; dx < 2; dx++) {
                        for (let dy = 0; dy < 2; dy++) {
                            if (x + dx <= cellColumns && y + dy <= cellRows) {
                                cellScreen.cells[x + dx][y + dy].alive = true;
                            }
                        }
                    }
                }
            }
        }

        for (let i = 0; i < 10; i++) {
            if (globals.random.nextBool()) {
                let y = globals.random.nextInt(0, cellRows);
                for (let x = 0; x <= cellColumns; x++) {
                    cellScreen.cells[x][y].alive = true;
                }
            } else {
                let x = globals.random.nextInt(0, cellColumns);
                for (let y = 0; y <= cellRows; y++) {
                    cellScreen.cells[x][y].alive = true;
                }
            }
        }
    }

    let setBalancedRules = () => {
        cellScreen.neighborhoods = [];

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
        
        cellScreen.neighborhoods.push(baseNeighborhood);

        if (globals.random.nextBool()) {
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
            
            cellScreen.neighborhoods.push(specialNeighborhood);
        }
    }

    let draw = () => {
        drawBackground(ctx, canvas);
        cellScreen.draw(ctx);
        cellScreen.copyBuffer();
    }

    let loop = (timestamp) => {
        let progress = timestamp - lastRender;

        cellScreen.update();
        draw();

        mutationCounter++;
        if (mutationCounter % 50 === 0) {
            setBalancedRules();
        }

        Browser.sleep(globals.random.nextInt(50, 200));

        lastRender = timestamp;
        window.requestAnimationFrame(loop);
    }

    window.trackMouse = (xMouse, yMouse) => {
    }
    
    window.clearCanvas = () => {  
        randomize();
    }

	window.magic = () => {  
		Sound.error();
	}

    window.upload = () => {
		Sound.error();
    }

    init();
}