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
                    for (const street2 of globals.city.streets) {
                        if (street == street2)
                            continue;

                        let x1 = street.originX + Math.cos(street.angle * Trigonometry.RAD_CONST) * street.length1;
                        let y1 = street.originY + Math.sin(street.angle * Trigonometry.RAD_CONST) * street.length1;
                        let x2 = street2.originX + Math.cos(street2.angle * Trigonometry.RAD_CONST) * street2.length1;
                        let y2 = street2.originY + Math.sin(street2.angle * Trigonometry.RAD_CONST) * street2.length1;

                        if (Trigonometry.segmentsIntersect(street.originX, street.originY, x1, y1,
                            street2.originX, street2.originY, x2, y2)) street.growing1 = false;

                        if (x1 < 0 || x1 > width || y1 < 0 || y1 > height) street.growing1 = false;

                        //---------

                        x2 = street2.originX + Math.cos((street2.angle + 180) * Trigonometry.RAD_CONST) * street2.length2;
                        y2 = street2.originY + Math.sin((street2.angle + 180) * Trigonometry.RAD_CONST) * street2.length2;

                        if (Trigonometry.segmentsIntersect(street.originX, street.originY, x1, y1,
                            street2.originX, street2.originY, x2, y2)) street.growing1 = false;

                        //---------

                        x1 = street.originX + Math.cos((street.angle + 180) * Trigonometry.RAD_CONST) * street.length2;
                        y1 = street.originY + Math.sin((street.angle + 180) * Trigonometry.RAD_CONST) * street.length2;
                        x2 = street2.originX + Math.cos(street2.angle * Trigonometry.RAD_CONST) * street2.length1;
                        y2 = street2.originY + Math.sin(street2.angle * Trigonometry.RAD_CONST) * street2.length1;

                        if (Trigonometry.segmentsIntersect(street.originX, street.originY, x1, y1,
                            street2.originX, street2.originY, x2, y2)) street.growing2 = false;

                        if (x1 < 0 || x1 > width || y1 < 0 || y1 > height) street.growing2 = false;

                        //---------

                        x2 = street2.originX + Math.cos((street2.angle + 180) * Trigonometry.RAD_CONST) * street2.length2;
                        y2 = street2.originY + Math.sin((street2.angle + 180) * Trigonometry.RAD_CONST) * street2.length2;

                        if (Trigonometry.segmentsIntersect(street.originX, street.originY, x1, y1,
                            street2.originX, street2.originY, x2, y2)) street.growing2 = false;

                        //---------
                        


                    }


                    if (street.growing1) street.length1 += 0.1;
                    if (street.growing2) street.length2 += 0.1;

                }
			} 
        }

        generateStreets = () => {
			let distance = width / 10;
			let lineCols = Math.floor(width / distance) + 1;
			let lineRows = Math.floor(height / distance) + 1;
			for (let x=0; x < lineCols; x++) {
				for (let y=0; y < lineRows; y++) {
					globals.city.addStreet(x * distance, y * distance);	
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
	    window.clearCanvas();
		globals.city.generateStreets();
        Sound.tada();
	}

    window.upload = (e) => {
		Sound.error();        
    }

    init();
}