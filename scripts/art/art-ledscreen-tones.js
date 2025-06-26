{    
    const globals = {
        random: null
    };

    let ledRows = 50;
    let ledColumns = 50;
    let ledMargin = 30;
    let ledPadding = 30;
    let ledDiameter = 20;
    let hue = 150;
    let valueIncrement = 5;
    let ledScreen;

	let clicking = false;
    
    const Figures = Object.freeze({
		Square: Symbol("square"),
		Circle: Symbol("circle")
	});

    class LedScreen {
        constructor() {      
            this.generateLeds();          
			let rand = globals.random.nextInt(0, Object.keys(Figures).length - 1);  
			this.shape = Figures[Object.keys(Figures)[rand]];
        }

        generateLeds = () => {
            this.leds = []; 
            for (let x = 0; x <= ledColumns; x++) {
                this.leds[x] = new Array(ledRows);
            }

            for (let x = 0; x <= ledColumns; x++) {
                for (let y = 0; y <= ledRows; y++) {
                    let led = new Led(x, y);
                    this.leds[x][y] = led;
                }
            }
        }

        setPixel = (x, y) => {            
            let col = Math.round((x - ledMargin) / ((ledDiameter) + ledPadding));
            let row = Math.round((y - ledMargin) / ((ledDiameter) + ledPadding));
            this.leds[col][row].value += valueIncrement;
            if (this.leds[col][row].value > 255) 
                this.leds[col][row].value = 0;
        }

        draw = (ctx) => {
            for (let x = 0; x <= ledColumns; x++) {
                for (let y = 0; y <= ledRows; y++) {
                    this.leds[x][y].draw(ctx);
                }
            }
        }

        update = () => {                           
        }
    }

    class Led {
        constructor(column, row) {
            this.diameter = ledDiameter;
            this.radius = ledDiameter / 2;
            this.row = row;
            this.column = column;
            this.x = ledMargin + column * ledPadding + column * this.diameter;
            this.y = ledMargin + row * ledPadding + row * this.diameter;
            this.value = 0;
        }

        draw = (ctx) => {
            let color = `hsl(${hue}, 100%, ${this.value}%)`;

            switch(ledScreen.shape){
                case Figures.Circle:
                    Drawing.drawCircle(ctx, this.x + this.radius, this.y + this.radius, this.radius, color, color)
                    break;
                case Figures.Square:                    
                    Drawing.drawRectangle(ctx, this.x, this.y, this.diameter, this.diameter, color, color);
                    break;
            }
        }
    }

    let init = () => {
        initCanvas();

        randomize();

        ledRows = Math.floor((height - ledMargin)/ (ledDiameter + ledPadding));
        ledColumns = Math.floor((width - ledMargin)/ (ledDiameter + ledPadding));
        ledScreen = new LedScreen();
        
        addEvents();
        window.requestAnimationFrame(loop)
    }

    let addEvents = () => {   
        canvas.addEventListener('mousemove', e => {
			trackMouse(e.offsetX, e.offsetY);
		}, false);

		canvas.addEventListener('touchstart', function (e) {
			clicking = true;
			trackMouse(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
		});

		canvas.addEventListener('touchmove', function (e) {
			e.preventDefault();
			trackMouse(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
		});

		canvas.addEventListener('mousedown', e => {
			clicking = true;
		}, false);

		canvas.addEventListener('mouseup', e => {
			clicking = false;
		}, false);

		canvas.addEventListener('touchend', e => {
			clicking = false;
		}, false);     
    }

    let trackMouse = (xMouse, yMouse) => {
        if (clicking)
            ledScreen.setPixel(xMouse, yMouse);
    }

    let randomize = () => {            
		globals.random = Objects.getRandomObject();
        
        ledDiameter = globals.random.nextInt(5, 20);        
        ledPadding = globals.random.nextInt(0, 20);
        ledMargin = ledPadding;  
        hue = globals.random.nextInt(0, 255);
    }

    let draw = () => {
        drawBackground(ctx, canvas);
        ledScreen.draw(ctx);
    }

    let loop = (timestamp) => {
        let progress = timestamp - lastRender;

        ledScreen.update();

        draw();

        lastRender = timestamp;
        window.requestAnimationFrame(loop);
    }

	window.clearCanvas = () => {		
        ledScreen.generateLeds();  
	}

	window.magic = () => {  
		Sound.error();
	}

    window.upload = () => {
		Sound.error();
    }

    init();
}
