{
    const globals = {
		random: null,
        cellScreen: null,
        mutationCounter: 0,        
        lastHash: "",
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
                }
            }
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
                    this.cells[x][y].diameter =  this.cellsBuffer[x][y].diameter;
                    this.cells[x][y].hue =  this.cellsBuffer[x][y].hue;
                    this.cells[x][y].saturation =  this.cellsBuffer[x][y].saturation;
                    this.cells[x][y].lightness =  this.cellsBuffer[x][y].lightness;
                }
            }    
        }

        getCellValueSafe = (x, y, rule) => {
            if (x < 0 || y < 0 || x >= config.cellColumns || y >= config.cellRows)
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
                        for(let h=x-config.extendedSize; h<=x+config.extendedSize; h++){
                            for(let v=y-config.extendedSize; v<=y+config.extendedSize; v++){
                                if (h!=x || v!=y) neighboursResult += (this.getCellValueSafe(h, v, rule));
                            }
                        }

                        neighboursResult /= (config.extendedSize * config.extendedSize) - 1;
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
                        neighboursResult = this.getNeighboursResultCircunference(x, y, config.circleRadius, rule);
                        break;
                    case NeighbourhoodType.Circle:                        
                        for (let i = 0; i < this.cells.length; i++) {
                            for (let j = 0; j < this.cells[i].length; j++) {
                                let squareDistance = (i - x) ** 2 + (j - y) ** 2;
                                
                                if (squareDistance <= config.circleRadius ** 2) {
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
                    let updatedCell = this.applyRule(rule, this.cells[x][y]);

                    switch (rule.attribute) {
                        case Attribute.Hue:
                            updatedCell.hue = (updatedCell.hue + this.cells[x][y].hue * 2) / 3;
                            break;
                        case Attribute.Saturation:
                            updatedCell.saturation = (updatedCell.saturation + this.cells[x][y].saturation * 2) / 3;
                            break;
                        case Attribute.Lightness:
                            updatedCell.lightness = (updatedCell.lightness + this.cells[x][y].lightness * 2) / 3;
                            break;
                    }

                    this.cellsBuffer[x][y] = updatedCell;
                }
            });      
        }

        update = () => {            
            for (let x = 0; x < config.cellColumns; x++) {
                for (let y = 0; y < config.cellRows; y++) {
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
            
        }

        getColor = () => {
            return `hsl(${this.hue}, ${this.saturation}%, ${this.lightness}%)`;
        }

        draw = (ctx) => {
            Drawing.drawSquare(ctx, this.x, this.y, this.diameter, 0, this.getColor(), this.getColor())
        }
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

        config.cellDiameter = globals.random.nextInt(5, 20);        
        config.cellRows = Math.floor((height - config.cellMargin)/ (config.cellDiameter + config.cellPadding));
        config.cellColumns = Math.floor((width - config.cellMargin)/ (config.cellDiameter + config.cellPadding));
        globals.cellScreen = new CellScreen();

        for (let x = 0; x <= config.cellColumns; x++) {
            for (let y = 0; y <= config.cellRows; y++) {
                if (x >= 0 && y >= 0 && x < config.cellColumns && y < config.cellRows) {
                    globals.cellScreen.cells[x][y].hue = globals.random.nextInt(0, 360);
                    globals.cellScreen.cells[x][y].saturation = globals.random.nextInt(60, 100);
                    globals.cellScreen.cells[x][y].lightness = globals.random.nextInt(40, 60);
                }
            }
        }

        setRandomRules();
    };

    let getRandomRule = () => {
        let attribute = globals.random.next() > 0.6 ? 
            Attribute.Lightness : 
            Attribute[Object.keys(Attribute)[globals.random.nextInt(0, 3)]];

        let condition = globals.random.next() > 0.5 ? Condition.Lower : Condition.Greater;

        let valueNeighbours, valueCell;
        switch(attribute) {
            case Attribute.Hue:
                valueNeighbours = globals.random.nextInt(60, 180);
                valueCell = globals.random.nextInt(60, 180);
                break;
            case Attribute.Saturation:
            case Attribute.Lightness:
                valueNeighbours = globals.random.nextInt(30, 70); 
                valueCell = globals.random.nextInt(30, 70);
                break;
        }

        let amount = globals.random.nextRange(0.95, 1.05, 2);

        let neighbourhoodType = globals.random.next() > 0.5 ? 
            NeighbourhoodType.Moore : 
            NeighbourhoodType[Object.keys(NeighbourhoodType)[globals.random.nextInt(0, 5)]];

        return new Rule(
            condition, valueNeighbours, 0, attribute,
            condition, valueCell, 0, amount, neighbourhoodType
        );
    };


    let setRandomRules = () => {
        globals.cellScreen.neighborhoods = [];

        let numberOfRules = globals.random.nextInt(5, 20);
        for(let i = 0; i < numberOfRules; i++){
            let newRule = getRandomRule();   
            globals.cellScreen.rules.push(newRule);
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

                    const { h: hue, s: saturation, l: lightness } = Color.rgbToHsl(r, g, b);
                    globals.cellScreen.cells[x][y].hue = hue;
                    globals.cellScreen.cells[x][y].saturation = saturation;
                    globals.cellScreen.cells[x][y].lightness = lightness;
                }
            }
        };
    }

    window.draw = () => {
        globals.cellScreen.update();

        drawBackground(ctx, canvas);
        globals.cellScreen.draw(ctx);
        globals.cellScreen.copyBuffer();
        config.mutationCounter++;

        let currentHash = globals.cellScreen.cells.flat().map(c => c.lightness.toFixed(1)).join("");
        if (currentHash === globals.lastHash) {
            randomize();
            config.mutationCounter = 0;
        }
        globals.lastHash = currentHash;

        if (config.mutationCounter % 100 === 0) {
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
		setRandomRules();
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
