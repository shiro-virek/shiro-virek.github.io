{
    let cellRows = 50;
    let cellColumns = 50;

    let cellMargin = 0;
    let cellPadding = 0;
    let cellDiameter = 20;

    let hue = 150;

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

    class Rule {
        constructor(condition, value, value2, attribute, amount){
            this.value = value;
            this.value2 = value2;
            this.condition = condition;
            this.attribute = attribute;
            this.amount = amount;
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

        ruleFulfilcell = (rule, sum) => {
            let result = false;
            switch(rule.condition){
				case Condition.Lower:
					result = (sum < rule.value);
					break;
				case Condition.Greater:
					result = (sum > rule.value);
					break;		
                case Condition.Between:
                    result = (sum >= rule.value && sum <= rule.value2);
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

        calculateCellStatus = (x, y) => {  
            this.rules.forEach(rule => {
                let neighboursResult = 0;

                this.cellsBuffer[x][y].diameter = this.cells[x][y].diameter; 
                this.cellsBuffer[x][y].radius = this.cells[x][y].radius; 
                this.cellsBuffer[x][y].hue = this.cells[x][y].hue; 
                this.cellsBuffer[x][y].saturation = this.cells[x][y].saturation; 
                this.cellsBuffer[x][y].lightness = this.cells[x][y].lightness; 

                neighboursResult += (this.getCellValueSafe(x, y-1, rule));
                neighboursResult += (this.getCellValueSafe(x, y+1, rule));
                neighboursResult += (this.getCellValueSafe(x-1, y-1, rule));
                neighboursResult += (this.getCellValueSafe(x+1, y-1, rule));
                neighboursResult += (this.getCellValueSafe(x-1, y, rule));
                neighboursResult += (this.getCellValueSafe(x+1, y, rule));
                neighboursResult += (this.getCellValueSafe(x-1, y+1, rule));
                neighboursResult += (this.getCellValueSafe(x+1, y+1, rule));

                if (this.ruleFulfilcell(rule, neighboursResult))
                    this.cellsBuffer[x][y] = this.applyRule(rule, this.cellsBuffer[x][y]);

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
                cellScreen.cells[x][y].hue =  Utils.getRandomInt(0, 255);
                cellScreen.cells[x][y].saturation =  Utils.getRandomInt(0, 100);
                cellScreen.cells[x][y].lightness =  Utils.getRandomInt(0, 100);            
            }
        }    

        setRandomRules();
        
        //setRules();
    }

    
    let setRules = () => {         
    }

    let getRandomRule = () => {

			let randCondition = Utils.getRandomInt(0, Object.keys(Condition).length);
			let condition = Condition[Object.keys(Condition)[randCondition].toString()];            
            
			let randAttribute = Utils.getRandomInt(0, Object.keys(Attribute).length);
			let attribute = Attribute[Object.keys(Attribute)[randAttribute].toString()];

            let value = 0;
            let value2 = 0;
            switch(attribute){
                case Attribute.Hue:
                    value = Utils.getRandomInt(0, 2040);  
                    value2 = Utils.getRandomInt(value, Utils.getRandomInt(value, 2040));  
                    break;
                case Attribute.Saturation:
                case Attribute.Lightness:
                    value = Utils.getRandomInt(0, 800);  
                    value2 = Utils.getRandomInt(value, Utils.getRandomInt(value, 800));  
                    break;
            }            
            
            let amount = Utils.getRandomFloat(0.1, 1.99, 2);

            return new Rule( condition, value, value2 , attribute, amount);
    }

    let setRandomRules = () => {
        let numberOfRules = Utils.getRandomInt(1, 5);
        for(let i = 0; i < numberOfRules; i++){
            let rule = getRandomRule();    
            cellScreen.rules.push(rule);
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
