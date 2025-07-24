{
    const Directions = Object.freeze({
		Up: Symbol("up"),		
		Down: Symbol("down"),
        Left: Symbol("left"),
        Right: Symbol("right"),
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
            default:
                break;
        }
    }
    
    window.draw = () => {
        let newX = 0;
        let newY = 0;   
        let direction = null;

        do {
            let rand =  globals.random.nextInt(0, Object.keys(Directions).length - 1);

            direction = Directions[Object.keys(Directions)[rand]];

            switch (direction) {
                case Directions.Down:
                    newX = globals.lastLineX;
                    newY = globals.lastLineY + config.step;
                    break;
                case Directions.Up:                
                    newX = globals.lastLineX;
                    newY = globals.lastLineY - config.step;
                    break;
                case Directions.Left:
                    newX = globals.lastLineX - config.step;
                    newY = globals.lastLineY;
                    break;
                case Directions.Right:
                    newX = globals.lastLineX + config.step;
                    newY = globals.lastLineY;
                    break;
                default:
                    break;
            }
        } while (newX < 0 || newY < 0 || newX > width || newY > height || oppositeDirection(direction));

        let color = `hsl(${config.hue}, ${100}%, ${50}%)`;

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