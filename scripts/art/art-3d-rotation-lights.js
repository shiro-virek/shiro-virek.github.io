{
    const figureTypes = [
        {
            name: "cube",
            vertices: [
                [-20, -20, -20],
                [20, -20, -20],
                [20, 20, -20],
                [-20, 20, -20],
                [-20, -20, 20],
                [20, -20, 20],
                [20, 20, 20],
                [-20, 20, 20]
            ],
            faces: [
                [0, 1, 2, 3],
                [0, 4, 5, 1],
                [1, 5, 6, 2],
                [3, 2, 6, 7],
                [0, 3, 7, 4],
                [4, 7, 6, 5]
            ]
        }
    ];

    const globals = {
        random: Objects.getRandomObject(),
        world: null
    }

    const config = {
        randomize: true,
        FOV: 10000,
        figureInfo: figureTypes[globals.random.nextInt(0, figureTypes.length - 1)],
        clicking: false,
        mouseMoved: false
    };    

    class ThreeDWorld {
        constructor() {
            this.figures = [];
            config.FOV = config.FOV;
        }

        draw = () => {
            this.figures.sort((a, b) => {
                const avgA = a.getAverageZ();
                const avgB = b.getAverageZ();
                if (isNaN(avgA) || isNaN(avgB)) {
                    return 0; 
                }
                return avgA - avgB;
            });
            
            this.figures.forEach(figure => {          
                figure.draw();       
            });
        }

        worldToScreen = (point) => {
            const scaleFactor = config.FOV / (config.FOV + point[2]);
            const projectedX = point[0] * scaleFactor;
            const projectedY = point[1] * scaleFactor;
            return [projectedX, projectedY];
        }

        addDistance = (distance) => {
            if (config.FOV + distance > 0)
                config.FOV += distance;
        }

        addFigure = (x, y) => {
            let figure = new Figure();

            figure.vertices = Objects.clone(config.figureInfo.vertices);
            figure.faces = Objects.clone(config.figureInfo.faces);

            figure.translateX(x);
            figure.translateY(y);

            this.figures.push(figure);
			Sound.ping();
        }
    }

    class Figure {
        constructor() {
            this.vertices = [];
            this.edges = [];
            this.hue = globals.random.nextInt(1, 360);
        }

        getAverageZ = () => {
            let sumZ = 0;
            for (let i = 0; i < this.vertices.length; i++) {
                sumZ += this.vertices[i][2];
            }
            
            let result = sumZ / this.vertices.length;
            
            if (isNaN(result)) {
                return 0; 
            }
            
            return result;
        }

        rotateZ = (angle) => {
            angle = Trigonometry.sexagesimalToRadian(angle);

            for (let i = this.vertices.length - 1; i >= 0; i--) {
                let x = this.vertices[i][0] * Math.cos(angle) + this.vertices[i][1] * (-Math.sin(angle));
                this.vertices[i][1] = this.vertices[i][0] * Math.sin(angle) + this.vertices[i][1] * Math.cos(angle); 
                this.vertices[i][0] = x;
            }
        }

        rotateY = (angle) => {
            angle = Trigonometry.sexagesimalToRadian(angle);

            for (let i = this.vertices.length - 1; i >= 0; i--) {
                let x = this.vertices[i][0] * Math.cos(angle) + this.vertices[i][2] * Math.sin(angle);
                this.vertices[i][2] = this.vertices[i][0] * (-Math.sin(angle)) + this.vertices[i][2] * Math.cos(angle); 
                this.vertices[i][0] = x;
            }
        }

        rotateX = (angle) => {
            angle = Trigonometry.sexagesimalToRadian(angle);

            for (let i = this.vertices.length - 1; i >= 0; i--) {
                let y = this.vertices[i][1] * Math.cos(angle) + this.vertices[i][2] * (-Math.sin(angle));
                this.vertices[i][2] = this.vertices[i][1] * Math.sin(angle) + this.vertices[i][2] * Math.cos(angle); 
                this.vertices[i][1] = y;
            }
        }

        translateX = (distance) => {
            for (let i = this.vertices.length - 1; i >= 0; i--) {
                this.vertices[i][0] += distance;
            }
        }

        translateY = (distance) => {
            for (let i = this.vertices.length - 1; i >= 0; i--) {
                this.vertices[i][1] += distance;
            }
        }

        translateZ = (distance) => {
            for (let i = this.vertices.length - 1; i >= 0; i--) {
                this.vertices[i][2] += distance;
            }
        }

        scale = (factor) => {
            for (let i = this.vertices.length - 1; i >= 0; i--) {
                this.vertices[i][0] *= factor;
                this.vertices[i][1] *= factor;
                this.vertices[i][2] *= factor;
            }
        }

        scaleX = (factor) => {
            for (let i = this.vertices.length - 1; i >= 0; i--) {
                this.vertices[i][0] *= factor;
            }
        }

        scaleY = (factor) => {
            for (let i = this.vertices.length - 1; i >= 0; i--) {
                this.vertices[i][1] *= factor;
            }
        }

        scaleZ = (factor) => {
            for (let i = this.vertices.length - 1; i >= 0; i--) {
                this.vertices[i][2] *= factor;
            }
        }

        shearX = (amount) => {
            for (let i = this.vertices.length - 1; i >= 0; i--) {
                this.vertices[i][1] = this.vertices[i][1] + amount * this.vertices[i][0];
                this.vertices[i][2] = this.vertices[i][2] + amount * this.vertices[i][0];
            }
        }

        shearY = (amount) => {
            for (let i = this.vertices.length - 1; i >= 0; i--) {
                this.vertices[i][0] = this.vertices[i][0] + amount * this.vertices[i][1];
                this.vertices[i][2] = this.vertices[i][2] + amount * this.vertices[i][1];
            }
        }

        shearZ = (amount) => {
            for (let i = this.vertices.length - 1; i >= 0; i--) {
                this.vertices[i][0] = this.vertices[i][0] + amount * this.vertices[i][2];
                this.vertices[i][1] = this.vertices[i][1] + amount * this.vertices[i][2];
            }
        }

        draw = () => {
            this.faces.forEach(face => {
                const faceVertices = face.map(index => this.vertices[index]);
                if (this.shouldDrawFace(faceVertices)) {
                    this.drawFace(faceVertices);                        
                }
            });
        }

        shouldDrawFace = (vertices) => {
            const vector1 = Trigonometry.subtractVectors(vertices[1], vertices[0]);
            const vector2 = Trigonometry.subtractVectors(vertices[2], vertices[0]);
    
            const normal = Trigonometry.crossProduct(vector1, vector2);
    
            const cameraDirection = [0, 0, 1];
    
            return Trigonometry.dotProduct(normal, cameraDirection) < 0;
        }

        getLightness = (vertices) => {
            const vector1 = Trigonometry.subtractVectors(vertices[1], vertices[0]);
            const vector2 = Trigonometry.subtractVectors(vertices[2], vertices[0]);

            const normal = Trigonometry.crossProduct(vector1, vector2);
        
            const lightDirection = [0, 0, 1]; 
        
            const dotProduct = Trigonometry.dotProduct(normal, lightDirection);

            
            const lightness = Numbers.scale(dotProduct, -1000, 0, 50, 100);

            
            return lightness;
        }   

        drawFace = (vertices) => {
            ctx.fillStyle = `hsl(${this.hue}, ${100}%, ${this.getLightness(vertices)}%)`;
            ctx.beginPath();

            let vertex = globals.world.worldToScreen(vertices[0]);
            ctx.moveTo(vertex[0], vertex[1]);
            for (let i = 1; i < vertices.length; i++) {
                vertex = globals.world.worldToScreen(vertices[i]);
                ctx.lineTo(vertex[0], vertex[1]);
            }
            ctx.closePath();
            ctx.stroke();
            ctx.fill();
        }
    }

    let setInitialFigures = () => {
        let figuresCount = globals.random.nextInt(1, 10);
        let translateX = globals.random.nextBool();
        let translateY = globals.random.nextBool();
        let translateZ = globals.random.nextBool();
        let rotateY = globals.random.nextBool();    
        let rotateX = globals.random.nextBool();
        let rotateZ = globals.random.nextBool();
        let scale = globals.random.nextBool();
        let scaleX = globals.random.nextBool();
        let scaleY = globals.random.nextBool();
        let scaleZ = globals.random.nextBool();
        let shearX = globals.random.nextBool();
        let shearY = globals.random.nextBool();
        let shearZ = globals.random.nextBool();

        for(let i=0; i <= figuresCount; i++){
            let figure = new Figure();

            figure.vertices = Objects.clone(config.figureInfo.vertices);
            figure.faces = Objects.clone(config.figureInfo.faces);

            if (translateX) figure.translateX(i*50);
            if (translateY) figure.translateY(i*50);
            if (translateZ) figure.translateZ(i*50);
            if (rotateX) figure.rotateX(i*10);
            if (rotateY) figure.rotateY(i*10);
            if (rotateZ) figure.rotateZ(i*10);    
            if (scale) figure.scale(i*0.1);        
            if (scaleX) figure.scaleX(i*0.1);
            if (scaleY) figure.scaleY(i*0.1);
            if (scaleZ) figure.scaleZ(i*0.1);
            if (shearX) figure.shearX(i*0.05);
            if (shearY) figure.shearY(i*0.05);
            if (shearZ) figure.shearZ(i*0.05);

            globals.world.figures.push(figure);
        }
    }

    let init = () => {	
        globals.random = Objects.getRandomObject();
        if (config.randomize) randomize();
        initCanvas();
        globals.world = new ThreeDWorld();
        addEvents();
        if (globals.random.nextBool()) setInitialFigures();
        window.requestAnimationFrame(loop)
    }

    let addEvents = () => {
        canvas.addEventListener('mousemove', e => {
            config.mouseMoved = true;
			trackMouse(e.offsetX, e.offsetY);
		}, false);

		canvas.addEventListener('touchmove', function (e) {
			e.preventDefault();
            config.mouseMoved = true;
			trackMouse(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
		});

		canvas.addEventListener('touchstart', function (e) {
            config.mouseMoved = false;            
			trackMouse(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
			config.clicking = true;
		});

		canvas.addEventListener('mousedown', e => {
            config.mouseMoved = false;
			config.clicking = true;
		}, false);

		canvas.addEventListener('mouseup', e => {
			config.clicking = false;
		}, false);

		canvas.addEventListener('touchend', e => {
            if (!config.mouseMoved)
                globals.world.addFigure(e.offsetX, e.offsetY);

			config.clicking = false;
		}, false);  

		canvas.addEventListener('click', function (e) {
            if (!config.mouseMoved)
                globals.world.addFigure(e.offsetX, e.offsetY);
		});
    }

    let trackMouse = (x, y) => {
        if (lastPosX == 0) lastPosX = x;
        if (lastPosY == 0) lastPosY = y;

        let movX = lastPosX - x;
        let movY = lastPosY - y;

        if (config.clicking) {  
            globals.world.figures.forEach(figure => {
                figure.translateX(-halfWidth);
                figure.translateY(-halfHeight);
                figure.rotateX(movY);
                figure.rotateY(movX);
                figure.translateX(halfWidth);
                figure.translateY(halfHeight);
            });
        }

        lastPosX = x;
        lastPosY = y;
    }
    
    let draw = () => {
        drawBackground(ctx, canvas);
        globals.world.draw();
    }

    let randomize = () => {        
    }

    let loop = (timestamp) => {
        let progress = timestamp - lastRender;

        draw();

        lastRender = timestamp;
        window.requestAnimationFrame(loop);
    }

    init();

	window.clearCanvas = () => {		
        globals.world.figures = [];
	}
}
