{
    let cellRows = 50;
    let cellColumns = 50;

    let cellMargin = 0;
    let cellPadding = 0;
    let cellDiameter = 20;

    let extendedSize = 3;
    let circleRadius = 3;

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
        Extended: Symbol("extended"),
        Diagonal: Symbol("diagonal"),
        Circle: Symbol("circle"),
        Circunference: Symbol("circunference"),
	});

    class Neighborhood {
        constructor(){
            this.rules = []; 
        }
    }

    class Rule {
        constructor(conditionNeighbours, valueNeighbours, value2Neighbours, newValueCell, aliveStatusRequired){
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
                            let squareDistance = (i - x) ** 2 + (j - y) ** 2;
                            
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

        cellDiameter = Utils.getRandomInt(3, 15);        

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
        //setRules();
    }

    let setRules = () => {
        //Conway rules
        
        let neighborhood = new Neighborhood();
        neighborhood.neighborhoodType = NeighborhoodType.VonNeumann;

        let rule1 = new Rule(Condition.Lower, 2, 0, false, true);
        let rule2 = new Rule(Condition.Between, 2, 3, true, true);
        let rule3 = new Rule(Condition.Greater, 3, 0, false, true);
        let rule4 = new Rule(Condition.Equal, 3, 0, true, false);

        neighborhood.rules.push(rule1);
        neighborhood.rules.push(rule2);
        neighborhood.rules.push(rule3);
        neighborhood.rules.push(rule4);

        cellScreen.neighborhoods.push(neighborhood);
    }

    let getRandomRule = (neighborhood) => {
        let randCondition = Utils.getRandomInt(0, Object.keys(Condition).length);
        let condition = Condition[Object.keys(Condition)[randCondition].toString()];            
        
        let valueNeighbours = 0;
        let value2Neighbours = 0;

        switch(neighborhood.neighborhoodType){
            case NeighborhoodType.Extended:
                valueNeighbours = Utils.getRandomInt(1, extendedSize * 2);  
                value2Neighbours = Utils.getRandomInt(valueNeighbours, Utils.getRandomInt(valueNeighbours, extendedSize * 2)); 
                break;
            case NeighborhoodType.Diagonal:
            case NeighborhoodType.Moore:
                valueNeighbours = Utils.getRandomInt(1, 4);  
                value2Neighbours = Utils.getRandomInt(valueNeighbours, Utils.getRandomInt(valueNeighbours, 4)); 
                break;
            case NeighborhoodType.VonNeumann:
                valueNeighbours = Utils.getRandomInt(1, 8);  
                value2Neighbours = Utils.getRandomInt(valueNeighbours, Utils.getRandomInt(valueNeighbours, 8)); 
                break;
            case NeighborhoodType.Circunference:
            case NeighborhoodType.Circle:
                valueNeighbours = Utils.getRandomInt(1, circleRadius * 2);  
                value2Neighbours = Utils.getRandomInt(valueNeighbours, Utils.getRandomInt(valueNeighbours, circleRadius * 2)); 
                break;
        } 

        let newValueCell = Utils.getRandomBool();  
        let alive = Utils.getRandomBool();

        return new Rule(condition, valueNeighbours, value2Neighbours, newValueCell, alive);
    }

    let setRandomRules = () => {
        let numberOfNeighborhoods = Utils.getRandomInt(1, 5);
        for(let j = 0; j < numberOfNeighborhoods; j++){
            let neighborhood = new Neighborhood();

            let randType = Utils.getRandomInt(0, Object.keys(NeighborhoodType).length);
            let type = NeighborhoodType[Object.keys(NeighborhoodType)[randType].toString()];            
            neighborhood.neighborhoodType = type;

            let numberOfRules = Utils.getRandomInt(1, 5);

            for(let i = 0; i < numberOfRules; i++){
                let rule = getRandomRule(neighborhood);    
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

        Utils.sleep(300);

        lastRender = timestamp;
        window.requestAnimationFrame(loop);
    }

    init();

	window.clearCanvas = () => {  
	}
}
