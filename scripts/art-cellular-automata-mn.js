{
    let cellRows = 50;
    let cellColumns = 50;

    let cellMargin = 0;
    let cellPadding = 0;
    let cellDiameter = 20;

    let cellScreen;
            
	const Condition = Object.freeze({
		Lower: Symbol("lower"),		
		Greater: Symbol("greater"),
        Between: Symbol("between"),
        Equal: Symbol("equal")
	});

	const NeighborhoodType = Object.freeze({
		VonNeumann: Symbol("vonneumann"),		
		Moore: Symbol("moore"),
        Extended: Symbol("extended")
	});

    class Neighborhood {
        constructor(){
            this.rules = []; 
        }
    }

    class Rule {
        constructor(conditionNeighbours, valueNeighbours, value2Neighbours, newValueCell, alive){
            this.valueNeighbours = valueNeighbours;
            this.value2Neighbours = value2Neighbours;
            this.conditionNeighbours = conditionNeighbours;
    
            this.newValueCell = newValueCell;

            this.alive = alive;
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
            for (let x = 0; x < cellColumns; x++) {
                this.cells[x] = new Array(cellRows);
                this.cellsBuffer[x] = new Array(cellRows);
            }

            for (let x = 0; x < cellColumns; x++) {
                for (let y = 0; y < cellRows; y++) {
                    let cell = new Cell(x, y);
                    this.cells[x][y] = cell;
                    let cellBuffer = new Cell(x, y);
                    this.cellsBuffer[x][y] = cellBuffer;
                }
            }
        }

        draw = (ctx) => {
            for (let x = 0; x < cellColumns; x++) {
                for (let y = 0; y < cellRows; y++) {
                    this.cellsBuffer[x][y].draw(ctx);
                }
            }
        }

        copyBuffer = () => {
            for (let x = 0; x < cellColumns; x++) {
                for (let y = 0; y < cellRows; y++) {
                    this.cells[x][y].alive =  this.cellsBuffer[x][y].alive;
                }
            }    
        }
        getCellValue
        isCellAliveSafe = (x, y) => {
            if (x < 0 || y < 0 || x >= cellColumns || y >= cellRows)
                return 0
            else
                return this.cells[x][y].alive;
        }

        getNeighboursCount = (neighborhood, x, y) => {
            let neighboursCount = 0;
            let size = 2;

            switch(neighborhood.neighborhoodType){
                case NeighborhoodType.Extended:
                    for(let h=-size; h<=size; h++){
                        for(let v=-size; v<=size; v++){
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

            result = result && (rule.alive == cellValue);

            return result;
        }

        calculateCellStatus = (x, y) => {         
            this.neighborhoods.forEach(neighborhood => {
                neighborhood.rules.forEach(rule => {
                    let neighboursCount = 0;
    
                    neighboursCount = this.getNeighboursCount(neighborhood, x, y);
                    let cellAlive = this.isCellAliveSafe(x, y);

                    if (this.ruleFulfilcell(rule, neighboursCount, cellAlive)) {
                        this.cellsBuffer[x][y].alive = rule.newValueCell;
                    }
                });
            });   
        }

        update = () => {            
            for (let x = 0; x < cellColumns; x++) {
                for (let y = 0; y < cellRows; y++) {
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
        }

        getColor = () => {
            return `hsl(${0}, ${100}%, ${this.alive ? 100 : 0}%)`;
        }

        draw = (ctx) => {
            Utils.drawSquare(ctx, this.x, this.y, this.diameter, 0, this.getColor(), this.getColor())
        }
    }

    let init = () => {       
		initCanvas();

        cellDiameter = Utils.getRandomInt(5, 15);        

        cellRows = Math.floor((height - cellMargin)/ (cellDiameter + cellPadding));
        cellColumns = Math.floor((width - cellMargin)/ (cellDiameter + cellPadding));
        cellScreen = new CellScreen();
        
        randomize();

        addEvents();

        window.requestAnimationFrame(loop);
    }

    let addEvents = () => {      
    }

    let randomize = () => {
        for (let x = 0; x < cellColumns; x++) {
            for (let y = 0; y < cellRows; y++) {
                cellScreen.cells[x][y].alive = Utils.getRandomBool();            
            }
        }    
        setRandomRules();
    }

    let getRandomRule = () => {
        let randCondition = Utils.getRandomInt(0, Object.keys(Condition).length);
        let condition = Condition[Object.keys(Condition)[randCondition].toString()];            
        
        let valueNeighbours = 0;
        let value2Neighbours = 0;

        valueNeighbours = Utils.getRandomInt(1, 8);  
        value2Neighbours = Utils.getRandomInt(valueNeighbours, Utils.getRandomInt(valueNeighbours, 8));  

        let newValueCell = Utils.getRandomBool();  
        let alive = Utils.getRandomBool();

        return new Rule(condition, valueNeighbours, value2Neighbours, newValueCell, alive);
    }

    let setRandomRules = () => {
        let numberOfNeighborhoods = Utils.getRandomInt(1, 10);
        for(let j = 0; j < numberOfNeighborhoods; j++){
            let neighborhood = new Neighborhood();

            let randType = Utils.getRandomInt(0, Object.keys(NeighborhoodType).length);
            let type = NeighborhoodType[Object.keys(NeighborhoodType)[randType].toString()];            
            neighborhood.neighborhoodType = type;

            let numberOfRules = Utils.getRandomInt(10, 20);

            for(let i = 0; i < numberOfRules; i++){
                let rule = getRandomRule();    
                neighborhood.rules.push(rule);
            }

            cellScreen.neighborhoods.push(neighborhood);
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

        Utils.sleep(200);

        lastRender = timestamp;
        window.requestAnimationFrame(loop);
    }

    init();

	window.clearCanvas = () => {  
	}
}
