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
                let id = this.streets.length + 1;
				let street = new Street(x, y, id);
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
                let streetComparisons = [];

                for (const street of globals.city.streets) {
                    for (const street2 of globals.city.streets) {
                        if (street == street2)
                            continue;

                        let found = false;
                        for (const set of streetComparisons) {
                            if ((set[0] == street.id && set[1] == street2.id) || (set[0] == street2.id && set[1] == street.id))
                                found = true;
                        }
                        if (found) continue;

                        streetComparisons.push([[street.id, street2.id]]);

                        let x1 = street.originX + Math.cos(street.angle * Trigonometry.RAD_CONST) * street.length1;
                        let y1 = street.originY + Math.sin(street.angle * Trigonometry.RAD_CONST) * street.length1;
                        let x2 = street.originX + Math.cos(street.angle + 180 * Trigonometry.RAD_CONST) * street.length2;
                        let y2 = street.originY + Math.sin(street.angle + 180 * Trigonometry.RAD_CONST) * street.length2;

                        let x3 = street2.originX + Math.cos(street2.angle * Trigonometry.RAD_CONST) * street2.length1;
                        let y3 = street2.originY + Math.sin(street2.angle * Trigonometry.RAD_CONST) * street2.length1;
                        let x4 = street2.originX + Math.cos((street2.angle + 180) * Trigonometry.RAD_CONST) * street2.length2;
                        let y4 = street2.originY + Math.sin((street2.angle + 180) * Trigonometry.RAD_CONST) * street2.length2;

                        if (x1 < 0 || x1 > width || y1 < 0 || y1 > height) street.growing1 = false;
                        if (x2 < 0 || x2 > width || y2 < 0 || y2 > height) street.growing2 = false;
                        if (x3 < 0 || x3 > width || y3 < 0 || y3 > height) street2.growing1 = false;
                        if (x4 < 0 || x4 > width || y4 < 0 || y4 > height) street2.growing2 = false;

                        let intersection1 = (Trigonometry.getSegmentsIntersectionPoint(street.originX, street.originY, x1, y1, street2.originX, street2.originY, x3, y3));
                        if (intersection1){
                            let distance1 = Trigonometry.distanceBetweenTwoPoints(intersection1.x, intersection1.y, x1, y1); 
                            let distance2 = Trigonometry.distanceBetweenTwoPoints(intersection1.x, intersection1.y, x3, y3);
                            if (distance1 && distance2)
                                if (distance1 < distance2)
                                    street.growing1 = false
                                else
                                    street2.growing1 = false;                 
                        }

                        let intersection2 = (Trigonometry.getSegmentsIntersectionPoint(street.originX, street.originY, x1, y1, street2.originX, street2.originY, x4, y4));
                        if (intersection2){
                            let distance3 = Trigonometry.distanceBetweenTwoPoints(intersection2.x, intersection2.y, x1, y1);
                            let distance4 = Trigonometry.distanceBetweenTwoPoints(intersection2.x, intersection2.y, x4, y4);
                            if (distance3 && distance4)
                                if (distance3 < distance4)
                                    street.growing1 = false
                                else
                                    street2.growing2 = false;                            
                        }

                        let intersection3 = (Trigonometry.getSegmentsIntersectionPoint(street.originX, street.originY, x2, y2, street2.originX, street2.originY, x3, y3));
                        if (intersection3){
                            let distance5 = Trigonometry.distanceBetweenTwoPoints(intersection3.x, intersection3.y, x2, y2);
                            let distance6 = Trigonometry.distanceBetweenTwoPoints(intersection3.x, intersection3.y, x3, y3);
                            if (distance5 && distance6)
                                if (distance5 < distance6)
                                    street.growing2 = false
                                else
                                    street2.growing1 = false;
                        }

                        let intersection4 = (Trigonometry.getSegmentsIntersectionPoint(street.originX, street.originY, x2, y2, street2.originX, street2.originY, x4, y4));
                        if (intersection4){
                            let distance7 = Trigonometry.distanceBetweenTwoPoints(intersection4.x, intersection4.y, x2, y2);
                            let distance8 = Trigonometry.distanceBetweenTwoPoints(intersection4.x, intersection4.y, x4, y4)
                            if (distance7 && distance8)
                                if (distance7 < distance8)
                                    street.growing2 = false
                                else
                                    street2.growing2 = false;
                        }
                    }

                    if (street.growing1) street.length1 += 0.5;
                    if (street.growing2) street.length2 += 0.5;

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
        constructor(x, y, id) {
            this.growing1 = true;
            this.growing2 = true;
			this.originX = x;
            this.originY = y;
            this.angle = globals.random.nextInt(0,360);
            this.length1 = 0;
            this.length2 = 0;
            this.id = id
		}
    }

    let init = () => {
        Browser.setTitle('Streets');  
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