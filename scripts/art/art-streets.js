{
    const globals = {
        random: null,
        city: null
    };

    const config = {
        randomize: true,
    };    

    class City {
        constructor() {
            this.streets = [];
		}

		addStreet = (x, y) => {
				let street = new Street(x, y);
				//city.randomize();
				globals.city.streets.push(street);
		
				//Sound.ping(100);
			
		}

		draw = (ctx) => {
			if (this.streets.length > 0) {	
                for (const street of globals.city.streets) {
                    Drawing.drawLineFromAngle(ctx, street.originX, street.originY, street.angle, street.length1);
                    Drawing.drawLineFromAngle(ctx, street.originX, street.originY, street.angle+180, street.length2) 
                }
			} 
		}

        update = () => {
            if (this.streets.length > 0) {	
                for (const street of globals.city.streets) {
                    if (street.growing1) street.length1 += 0.2;
                    if (street.growing2) street.length2 += 0.2;
                }
			} 
        }
    }

    class Street {
        constructor(x, y) {
            this.growing1 = true;
            this.growing2 = true;
			this.originX = x;
            this.originY = y;
            this.angle = globals.random.nextInt(0,360);
            this.length1 = 0;
            this.length2 = 0;
		}
    }

    let init = () => {
		globals.random = Objects.getRandomObject();
        globals.city = new City();
        if (config.randomize) randomize();
        initCanvas();
        addEvents();
        window.requestAnimationFrame(loop);
    }

    let addEvents = () => {
        canvas.addEventListener('click', e => {
			globals.city.addStreet(e.offsetX, e.offsetY);
		}, false);
    }

    let randomize = () => {
    }
    
    window.draw = () => {
        drawBackground(ctx, canvas);
        globals.city.update();
        globals.city.draw(ctx);
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