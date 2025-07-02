{
    const globals = {
		random: null,
        mutationCounter: 0,
        cellScreen: null,
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
                    this.cells[x][y].energy = this.cellsBuffer[x][y].energy;
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
                            let squareDistance = (i - x) ** 2 + (j - y) ** 2;
                            
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
            let cell = this.cells[x][y];
            let cellEnergy = cell.energy * 0.9; 

            let neighborEnergy = this.diffuseEnergy(x, y) * 0.1; 

            let accumulatedEnergy = cellEnergy + neighborEnergy;

            this.neighborhoods.forEach(neighborhood => {
                neighborhood.rules.forEach(rule => {
                    let neighboursCount = this.getNeighboursCount(neighborhood, x, y);
                    if (this.ruleFulfilcell(rule, neighboursCount, cell.alive)) {
                        accumulatedEnergy += 20; 
                    }
                });
            });

            accumulatedEnergy = Math.min(100, accumulatedEnergy);
            let nextAlive = accumulatedEnergy > 50;

            this.cellsBuffer[x][y].energy = accumulatedEnergy;
            this.cellsBuffer[x][y].alive = nextAlive;

        }

        update = () => {            
            for (let x = 0; x <= config.cellColumns; x++) {
                for (let y = 0; y <= config.cellRows; y++) {
                    this.calculateCellStatus(x, y);
                }
            }                  
        }

        diffuseEnergy = (x, y) => {
            let total = 0;
            let count = 0;

            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    let nx = x + dx;
                    let ny = y + dy;

                    if (dx === 0 && dy === 0) continue;

                    if (nx >= 0 && ny >= 0 && nx <= config.cellColumns && ny <= config.cellRows) {
                        total += this.cells[nx][ny].energy;
                        count++;
                    }
                }
            }

            return count > 0 ? total / count : 0;
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
            this.energy = 0;         
        }

        getColor = () => {
            let e = this.energy;
            e = Math.max(0, Math.min(100, e));

            let hue = (240 - (e * 2.4)) % 360;
            let saturation = 100;
            let lightness = 50;

            return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
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
    }

    let randomize = () => {
		globals.random = Objects.getRandomObject();

        config.cellDiameter = globals.random.nextInt(5, 15);        

        config.cellRows = Math.floor((height - config.cellMargin)/ (config.cellDiameter + config.cellPadding));
        config.cellColumns = Math.floor((width - config.cellMargin)/ (config.cellDiameter + config.cellPadding));
        config.cellScreen = new CellScreen();
        
        for (let x = 0; x <= config.cellColumns; x++) {
            for (let y = 0; y <= config.cellRows; y++) {
                config.cellScreen.cells[x][y].alive = globals.random.next() < 0.2;    
            }
        }    
        setRandomRules();
    }

    let getRandomRule = (neighborhood) => {
        let randCondition = globals.random.nextInt(0, Object.keys(Condition).length - 1);
        let condition = Condition[Object.keys(Condition)[randCondition]];

        let valueNeighbours = 0;
        let value2Neighbours = 0;

        let maxNeighbors = 8; 

        switch (neighborhood.neighborhoodType) {
            case NeighborhoodType.Extended:
                maxNeighbors = (config.extendedSize * 2 + 1) ** 2 - 1;
                break;
            case NeighborhoodType.Moore:
                maxNeighbors = 4;
                break;
            case NeighborhoodType.VonNeumann:
                maxNeighbors = 8;
                break;
            case NeighborhoodType.Diagonal:
                maxNeighbors = 4;
                break;
            case NeighborhoodType.Circunference:
            case NeighborhoodType.Circle:
                maxNeighbors = Math.floor(Math.PI * config.circleRadius * config.circleRadius);
                break;
        }

        valueNeighbours = globals.random.nextInt(0, maxNeighbors);
        value2Neighbours = globals.random.nextInt(valueNeighbours, maxNeighbors);

        let newValueCell = globals.random.nextBool();
        let alive = globals.random.nextBool();

        return new Rule(alive, condition, valueNeighbours, value2Neighbours, newValueCell);
    }

    let setRandomRules = () => {
        config.cellScreen.neighborhoods = [];

        let numberOfNeighborhoods = globals.random.nextInt(1, 3);
        for (let j = 0; j < numberOfNeighborhoods; j++) {
            let neighborhood = new Neighborhood();

            let randType = globals.random.nextInt(0, Object.keys(NeighborhoodType).length - 1);
            let type = NeighborhoodType[Object.keys(NeighborhoodType)[randType]];
            neighborhood.neighborhoodType = type;

            let numberOfRules = globals.random.nextInt(1, 3);

            for (let i = 0; i < numberOfRules; i++) {
                let rule = getRandomRule(neighborhood);
                if (rule !== null) {
                    neighborhood.rules.push(rule);
                }
            }

            if (neighborhood.rules.length > 0) {
                config.cellScreen.neighborhoods.push(neighborhood);
            }
        }
    }

    window.draw = () => {
        config.cellScreen.update();

        drawBackground(ctx, canvas);
        config.cellScreen.draw(ctx);
        config.cellScreen.copyBuffer();

        config.mutationCounter++;
        if (config.mutationCounter % 50 === 0) {
            setRandomRules();
        }

        Browser.sleep(globals.random.nextInt(50, 200));
    }

    window.trackMouse = (xMouse, yMouse) => {
    }

	window.clearCanvas = () => {  
		Sound.error();
    }

	window.magic = () => {  
		randomize();
        Sound.tada();
	}

    window.upload = () => {
		Sound.error();
    }

    init();
}
