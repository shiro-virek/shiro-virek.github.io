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
        walkers: [],
    };

    const config = {
        randomize: true,

    };    

    class Walker {
        constructor() {
            this.lastLineX = width / 2;
            this.lastLineY = height / 2;
            this.lastDirection = Directions.Left;

            if (config.randomize) 
                this.randomize()
            else 
            {
                this.step = 10;
                this.hue = 0;
                this.fixedStep = false;
                this.changeColor = false;
                this.transparent = false;
                this.diagonals = false;
            }
        }

        randomize = () => {
            this.step = globals.random.nextInt(1, 10);
            this.hue = globals.random.nextInt(0, 360);
            this.fixedStep = globals.random.nextBool();
            this.changeColor = globals.random.nextBool();
            this.transparent = globals.random.nextBool();
            this.diagonals = globals.random.nextBool();
        }

        draw = (ctx, canvas) => {
            let newX = 0;
            let newY = 0;   
            let direction = null;
            let step = 0;
            let rand = 0;

            do {
                if (this.diagonals)
                    rand =  globals.random.nextInt(0, Object.keys(Directions).length - 1)
                else
                    rand =  globals.random.nextInt(0, 3);

                direction = Directions[Object.keys(Directions)[rand]];

                step = this.step;

                if (this.fixedStep) step *= globals.random.nextRange(0.1,1.9);
                let hypotenuse = Math.sqrt((step*step)+(step*step));

                switch (direction) {
                    case Directions.Down:
                        newX = this.lastLineX;
                        newY = this.lastLineY + step;
                        break;
                    case Directions.Up:                
                        newX = this.lastLineX;
                        newY = this.lastLineY - step;
                        break;
                    case Directions.Left:
                        newX = this.lastLineX - step;
                        newY = this.lastLineY;
                        break;
                    case Directions.Right:
                        newX = this.lastLineX + step;
                        newY = this.lastLineY;
                        break;
                    case Directions.NE:   
                        newX = this.lastLineX - hypotenuse;
                        newY = this.lastLineY - hypotenuse;
                        break;
                    case Directions.NW: 
                        newX = this.lastLineX + hypotenuse;
                        newY = this.lastLineY - hypotenuse;
                        break;      
                    case Directions.SE:
                        newX = this.lastLineX - hypotenuse;
                        newY = this.lastLineY + hypotenuse;
                        break;
                    case Directions.SW:
                        newX = this.lastLineX + hypotenuse;
                        newY = this.lastLineY + hypotenuse;
                        break;
                    default:
                        break;
                }
            } while (newX < 0 || newY < 0 || newX > width || newY > height || this.oppositeDirection(direction));

            let color = 0;

            if (this.changeColor)
                color = `hsla(${this.hue}, ${Numbers.scale(Math.abs(newX - newY), 0, width, 0, 100)}%, ${Numbers.scale(step, 0, this.step * 1.9, 0, 50)}%, ${this.transparent ? 0.3 : 1.0})`
            else
                color = `hsla(${this.hue}, ${100}%, ${50}%, ${this.transparent ? 0.5 : 1.0})`

            Drawing.drawLine(ctx, this.lastLineX, this.lastLineY, newX, newY, 1, color);

            Drawing.drawLine(ctx, width - this.lastLineX, this.lastLineY, width - newX, newY, 1, color);

            this.lastDirection = direction;
            this.lastLineX = newX;
            this.lastLineY = newY;
        }

        oppositeDirection = (direction) => {
            switch (this.lastDirection) {
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
        
    }

    let init = () => {
		globals.random = Objects.getRandomObject();
        globals.walkers.push(new Walker());
        initCanvas();
        drawBackground(ctx, canvas);
        addEvents();
        window.requestAnimationFrame(loop);
        addSpecialControls();
    }
    
    let addSpecialControls = () => {
        let newWalker = () => {
            globals.walkers.push(new Walker());
        }
        Browser.addButton("btnNewWalker", "➕", newWalker);
    }

    let addEvents = () => {
    }

    let randomize = () => {
        globals.walkers.forEach((walker) => {
            walker.randomize();
        });
    }
   
    window.draw = () => {
        globals.walkers.forEach((walker) => {
            walker.draw(ctx, canvas);
        });
    }

    window.trackMouse = (x, y) => {
        if (clicking) {  

        }
    }
    
    window.clearCanvas = () => {
		Sound.error();
    }

    init();
}