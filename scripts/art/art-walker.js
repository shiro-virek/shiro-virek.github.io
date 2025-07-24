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
    }

    let invalidDirection = (direction) => {
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
            console.log(rand);
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
        } while (newX < 0 || newY < 0 || newX > width || newY > height || invalidDirection(direction));

        Drawing.drawLine(ctx, globals.lastLineX, globals.lastLineY, newX, newY, 2, '#FFF');

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