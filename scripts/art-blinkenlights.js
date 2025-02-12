{
    let cellRows = 50;
    let cellColumns = 50;

    let cellMargin = 0;
    let cellPadding = 0;
    let cellDiameter = 20;

    let extendedSize = 2;
    let circleRadius = 2;

    let cellScreen;
    
	const Attribute = Object.freeze({
		Hue: Symbol("hue"),		
		Saturation: Symbol("saturation"),
		Lightness: Symbol("lightness")		
	});
        
	const Condition = Object.freeze({
		Lower: Symbol("lower"),		
		Greater: Symbol("greater"),
        Between: Symbol("between")
	});

	const NeighbourhoodType = Object.freeze({
		VonNeumann: Symbol("vonneumann"),		
		Moore: Symbol("moore"),
        Extended: Symbol("extended"),
        Diagonal: Symbol("diagonal"),
        Circle: Symbol("circle"),
        Circunference: Symbol("circunference"),
	});

    class Rule {
        constructor(conditionNeighbours, valueNeighbours, value2Neighbours, attribute, conditionCell, valueCell, value2Cell, amount, neighbourhoodType){
            this.valueNeighbours = valueNeighbours;
            this.value2Neighbours = value2Neighbours;
            this.conditionNeighbours = conditionNeighbours;
            
            this.attribute = attribute;

            this.valueCell = valueCell;
            this.value2Cell = value2Cell;
            this.conditionCell = conditionCell;

            this.amount = amount;

            this.neighbourhoodType = neighbourhoodType;
        }
    }

    class CellScreen {
        constructor() {
            this.cells = [];
            this.cellsBuffer = [];         
            this.rules = [];   
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
                    this.cells[x][y].diameter =  this.cellsBuffer[x][y].diameter;
                    this.cells[x][y].hue =  this.cellsBuffer[x][y].hue;
                    this.cells[x][y].saturation =  this.cellsBuffer[x][y].saturation;
                    this.cells[x][y].lightness =  this.cellsBuffer[x][y].lightness;
                }
            }    
        }

        getCellValueSafe = (x, y, rule) => {
            if (x < 0 || y < 0 || x >= cellColumns || y >= cellRows)
                return 0
            else
                switch(rule.attribute){
                    case Attribute.Hue:
                        return this.cells[x][y].hue;
                    case Attribute.Saturation:
                        return this.cells[x][y].saturation;
                    case Attribute.Lightness:
                        return this.cells[x][y].lightness;
                }
        }

        ruleFulfilcell = (rule, neighboursValue, cellValue) => {
            let result = false;
            switch(rule.conditionNeighbours){
				case Condition.Lower:
					result = (neighboursValue < rule.valueNeighbours);
					break;
				case Condition.Greater:
					result = (neighboursValue > rule.valueNeighbours);
					break;		
                case Condition.Between:
                    result = (neighboursValue >= rule.valueNeighbours && neighboursValue <= rule.value2Neighbours);
                    break;		
			}

            switch(rule.conditionCell){
				case Condition.Lower:
					result &= (cellValue < rule.valueCell);
					break;
				case Condition.Greater:
					result &= (cellValue > rule.valueCell);
					break;		
                case Condition.Between:
                    result &= (cellValue >= rule.valueCell && cellValue <= rule.value2Cell);
                    break;		
			}

            return result;
        }

        applyRule = (rule, cell) => {            
			switch(rule.attribute){
				case Attribute.Hue:
					cell.hue *= rule.amount;
					break;
				case Attribute.Saturation:
					cell.saturation *= rule.amount;
					break;					
                case Attribute.Lightness:
					cell.lightness *= rule.amount;
					break;				
			}

            return cell;
        }

        getNeighboursResultCircunference = (x, y, radius, rule) => {
            let neighboursResult = 0;
            let i = 0;
            let j = radius;
            let d = 3 - 2 * radius; //Bresenham
            let neighboursCount = 0;
        
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
                        neighboursResult += (this.getCellValueSafe(px, py, rule));
                        neighboursCount++;
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

            return neighboursResult / neighboursCount;
        }

        calculateCellStatus = (x, y) => {  
            this.rules.forEach(rule => {
                let neighboursResult = 0;

                this.cellsBuffer[x][y].diameter = this.cells[x][y].diameter; 
                this.cellsBuffer[x][y].radius = this.cells[x][y].radius; 
                this.cellsBuffer[x][y].hue = this.cells[x][y].hue; 
                this.cellsBuffer[x][y].saturation = this.cells[x][y].saturation; 
                this.cellsBuffer[x][y].lightness = this.cells[x][y].lightness; 

                let circleCount = 0;

                switch(rule.NeighbourhoodType){
                    case NeighbourhoodType.Extended:
                        for(let h=x-extendedSize; h<=x+extendedSize; h++){
                            for(let v=y-extendedSize; v<=y+extendedSize; v++){
                                if (h!=x || v!=y) neighboursResult += (this.getCellValueSafe(h, v, rule));
                            }
                        }

                        neighboursResult /= (extendedSize * extendedSize) - 1;
                        break;
                    case NeighbourhoodType.Moore:
                        neighboursResult += (this.getCellValueSafe(x, y-1, rule));
                        neighboursResult += (this.getCellValueSafe(x, y+1, rule));
                        neighboursResult += (this.getCellValueSafe(x-1, y, rule));
                        neighboursResult += (this.getCellValueSafe(x+1, y, rule));

                        neighboursResult /= 4;
                        break;
                    case NeighbourhoodType.VonNeumann:
                        neighboursResult += (this.getCellValueSafe(x, y-1, rule));
                        neighboursResult += (this.getCellValueSafe(x, y+1, rule));
                        neighboursResult += (this.getCellValueSafe(x-1, y-1, rule));
                        neighboursResult += (this.getCellValueSafe(x+1, y-1, rule));
                        neighboursResult += (this.getCellValueSafe(x-1, y, rule));
                        neighboursResult += (this.getCellValueSafe(x+1, y, rule));
                        neighboursResult += (this.getCellValueSafe(x-1, y+1, rule));
                        neighboursResult += (this.getCellValueSafe(x+1, y+1, rule));

                        neighboursResult /= 8;
                        break;
                    case NeighbourhoodType.Circunference:
                        neighboursResult = this.getNeighboursResultCircunference(x, y, circleRadius, rule);
                        break;
                    case NeighbourhoodType.Circle:                        
                        for (let i = 0; i < this.cells.length; i++) {
                            for (let j = 0; j < this.cells[i].length; j++) {
                                let squareDistance = (i - x) ** 2 + (j - y) ** 2;
                                
                                if (squareDistance <= circleRadius ** 2) {
                                    circleCount++;
                                    neighboursResult += (this.getCellValueSafe(i, j, rule));
                                }
                            }
                        }
                        neighboursResult /= circleCount;
                        break;
                    case NeighbourhoodType.Diagonal:
                        neighboursResult += (this.getCellValueSafe(x-1, y-1, rule));
                        neighboursResult += (this.getCellValueSafe(x-1, y+1, rule));
                        neighboursResult += (this.getCellValueSafe(x+1, y-1, rule));
                        neighboursResult += (this.getCellValueSafe(x+1, y+1, rule));

                        neighboursResult /= 4;
                        break;
                }


                if (this.ruleFulfilcell(rule, neighboursResult, this.getCellValueSafe(x, y, rule))) {
                    this.cellsBuffer[x][y] = this.applyRule(rule, this.cells[x][y]);
                }
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
            return `hsl(${this.hue}, ${this.saturation}%, ${this.lightness}%)`;
        }

        draw = (ctx) => {
            Utils.drawSquare(ctx, this.x, this.y, this.diameter, 0, this.getColor(), this.getColor())
        }
    }

    let init = () => {       
		initCanvas();

        cellDiameter = Utils.getRandomInt(5, 20);        

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
                cellScreen.cells[x][y].hue = Utils.getRandomInt(0, 255);
                cellScreen.cells[x][y].saturation =  Utils.getRandomInt(0, 100);
                cellScreen.cells[x][y].lightness =  Utils.getRandomInt(0, 100);            
            }
        }    

        setRandomRules();
    }

    let getRandomRule = () => {
        let randCondition = Utils.getRandomInt(0, Object.keys(Condition).length);
        let condition = Condition[Object.keys(Condition)[randCondition].toString()];            
        
        let randAttribute = Utils.getRandomInt(0, Object.keys(Attribute).length);
        let attribute = Attribute[Object.keys(Attribute)[randAttribute].toString()];

        let valueNeighbours = 0;
        let value2Neighbours = 0;
        switch(attribute){
            case Attribute.Hue:
                valueNeighbours = Utils.getRandomInt(0, 255);  
                value2Neighbours = Utils.getRandomInt(valueNeighbours, Utils.getRandomInt(valueNeighbours, 255));  
                break;
            case Attribute.Saturation:
            case Attribute.Lightness:
                valueNeighbours = Utils.getRandomInt(0, 100);  
                value2Neighbours = Utils.getRandomInt(valueNeighbours, Utils.getRandomInt(valueNeighbours, 100));  
                break;
        }            
        
        let amount = Utils.getRandomFloat(0.01, 1.99, 2);

        let randCellCondition = Utils.getRandomInt(0, Object.keys(Condition).length);
        let cellCondition = Condition[Object.keys(Condition)[randCellCondition].toString()];

        let randCellAttribute = Utils.getRandomInt(0, Object.keys(Attribute).length);
        let cellAttribute = Attribute[Object.keys(Attribute)[randCellAttribute].toString()];

        let valueCell = 0;
        let value2Cell = 0;
        switch(cellAttribute){
            case Attribute.Hue:
                valueCell = Utils.getRandomInt(0, 255);  
                value2Cell = Utils.getRandomInt(valueCell, Utils.getRandomInt(valueCell, 255));  
                break;
            case Attribute.Saturation:
            case Attribute.Lightness:
                valueCell = Utils.getRandomInt(0, 100);  
                value2Cell = Utils.getRandomInt(valueCell, Utils.getRandomInt(valueCell, 100));  
                break;
        }      

        let randNeighbourhoodType = Utils.getRandomInt(0, Object.keys(NeighbourhoodType).length);
        let neighbourhoodType = NeighbourhoodType[Object.keys(NeighbourhoodType)[randNeighbourhoodType].toString()];

        return new Rule(condition, valueNeighbours, value2Neighbours, attribute, cellCondition, valueCell, value2Cell, amount, neighbourhoodType);
    }

    let setRandomRules = () => {
        let numberOfRules = Utils.getRandomInt(5, 20);
        for(let i = 0; i < numberOfRules; i++){
            let newRule = getRandomRule();   
            cellScreen.rules.push(newRule);
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
        randomize();
	}
}
