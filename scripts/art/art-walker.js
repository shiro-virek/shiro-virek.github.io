{
    const Directions = Object.freeze({
		Up: Symbol("up"),		
		Down: Symbol("down"),
        Left: Symbol("left"),
        Right: Symbol("right"),
        NE: Symbol("ne"),		
		NW: Symbol("nw"),
        SE: Symbol("se"),
        SW: Symbol("sw"),
	});

    const globals = {
        random: null,
        lastLineX: width / 2,
        lastLineY: height / 2,
        lastDirection: Directions.Left,
    };

    const config = {
        randomize: true,
        step: 10,
        hue: 0,
        fixedStep: false,
        changeColor: false,
        transparent: false,
        diagonals: false,
    };    

    let init = () => {
		globals.random = Objects.getRandomObject();
        if (config.randomize) randomize();
        initCanvas();
        drawBackground(ctx, canvas);
        addEvents();
        window.requestAnimationFrame(loop);
    }

    let addEvents = () => {
    }

    let randomize = () => {
        config.step = globals.random.nextInt(1, 10);
        config.hue = globals.random.nextInt(0, 360);
        config.fixedStep = globals.random.nextBool();
        config.changeColor = globals.random.nextBool();
        config.transparent = globals.random.nextBool();
        config.diagonals = globals.random.nextBool();
    }

    let oppositeDirection = (direction) => {
        switch (globals.lastDirection) {
            case Directions.Down:   
                return direction === Directions.Up;
            case Directions.Up:       
                return direction === Directions.Down;
            case Directions.Left:
                return direction === Directions.Right;
            case Directions.Right:
                return direction === Directions.Left;
            case Directions.NE:   
                return direction === Directions.SW;
            case Directions.NW:       
                return direction === Directions.SE;
            case Directions.SE:
                return direction === Directions.NW;
            case Directions.SW:
                return direction === Directions.NE;
            default:
                break;
        }
    }
    
    window.draw = () => {
        let newX = 0;
        let newY = 0;   
        let direction = null;
        let step = 0;
        let rand = 0;

        do {
            if (config.diagonals)
                rand =  globals.random.nextInt(0, Object.keys(Directions).length - 1)
            else
                rand =  globals.random.nextInt(0, 3);

            direction = Directions[Object.keys(Directions)[rand]];

            step = config.step;

            if (config.fixedStep) step *= globals.random.nextRange(0.1,1.9);
            let hypotenuse = Math.sqrt((step*step)+(step*step));

            switch (direction) {
                case Directions.Down:
                    newX = globals.lastLineX;
                    newY = globals.lastLineY + step;
                    break;
                case Directions.Up:                
                    newX = globals.lastLineX;
                    newY = globals.lastLineY - step;
                    break;
                case Directions.Left:
                    newX = globals.lastLineX - step;
                    newY = globals.lastLineY;
                    break;
                case Directions.Right:
                    newX = globals.lastLineX + step;
                    newY = globals.lastLineY;
                    break;
                case Directions.NE:   
                    newX = globals.lastLineX - hypotenuse;
                    newY = globals.lastLineY - hypotenuse;
                    break;
                case Directions.NW: 
                    newX = globals.lastLineX + hypotenuse;
                    newY = globals.lastLineY - hypotenuse;
                    break;      
                case Directions.SE:
                    newX = globals.lastLineX - hypotenuse;
                    newY = globals.lastLineY + hypotenuse;
                    break;
                case Directions.SW:
                    newX = globals.lastLineX + hypotenuse;
                    newY = globals.lastLineY + hypotenuse;
                    break;
                default:
                    break;
            }
        } while (newX < 0 || newY < 0 || newX > width || newY > height || oppositeDirection(direction));

        let color = 0;

        if (config.changeColor)
            color = `hsla(${config.hue}, ${Numbers.scale(Math.abs(newX - newY), 0, width, 0, 100)}%, ${Numbers.scale(step, 0, config.step * 1.9, 0, 50)}%, ${config.transparent ? 0.3 : 1.0})`
        else
            color = `hsla(${config.hue}, ${100}%, ${50}%, ${config.transparent ? 0.5 : 1.0})`

        Drawing.drawLine(ctx, globals.lastLineX, globals.lastLineY, newX, newY, 1, color);

        Drawing.drawLine(ctx, width - globals.lastLineX, globals.lastLineY, width - newX, newY, 1, color);

        globals.lastDirection = direction;
        globals.lastLineX = newX;
        globals.lastLineY = newY;
    }

    window.trackMouse = (x, y) => {
        if (clicking) {  

        }
    }
    
    window.clearCanvas = () => {
		Sound.error();
    }

	window.magic = () => {  
		Sound.error();
	}

    window.upload = (e) => {
		Sound.error();        
    }

    init();
}