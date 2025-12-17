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
        FOV: 800,
        figureInfo: figureTypes[globals.random.nextInt(0, figureTypes.length - 1)],
        rotationMode: 0,
    };    

    class ThreeDWorld {
        constructor() {
            this.figures = [];
            this.cameraRotationX = 0; 
            this.cameraRotationZ = 0;
            this.cameraZ = 1000;
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
            const rotatedPoint = this.applyCameraRotation(point); 
            
            const x = rotatedPoint[0];
            const y = rotatedPoint[1];
            const z = rotatedPoint[2];

            let depth = z + this.cameraZ;
            if (depth < 1) depth = 1; 

            const scaleFactor = config.FOV / depth;
            
            const projectedX = (x * scaleFactor) + halfWidth;
            const projectedY = (y * scaleFactor) + halfHeight;
            
            return [projectedX, projectedY];    
        }

        addFigure = (x, y) => {
            let centeredX = x - halfWidth;
            let centeredY = y - halfHeight;

            let figure = new Figure();

            figure.vertices = Objects.clone(config.figureInfo.vertices);
            figure.faces = Objects.clone(config.figureInfo.faces);

            const scaleFactor = config.FOV / this.cameraZ;
            let worldX = centeredX / scaleFactor;
            let worldY = centeredY / scaleFactor;
            let worldZ = 0; 

            if (this.cameraRotationZ !== 0) {
                let angleZ = Trigonometry.sexagesimalToRadian(this.cameraRotationZ); 
                let newX = worldX * Math.cos(angleZ) + worldY * (-Math.sin(angleZ));
                let newY = worldX * Math.sin(angleZ) + worldY * Math.cos(angleZ);
                worldX = newX;
                worldY = newY;
            }

            if (this.cameraRotationX !== 0) {
                let angleX = Trigonometry.sexagesimalToRadian(this.cameraRotationX);
                let newY = worldY * Math.cos(angleX) + worldZ * (-Math.sin(angleX));
                let newZ = worldY * Math.sin(angleX) + worldZ * Math.cos(angleX);
                worldY = newY;
            }

            figure.translateX(worldX);
            figure.translateY(worldY);

            this.figures.push(figure);
        }
        
        applyCameraRotation = (point) => {
            let x = point[0];
            let y = point[1];
            let z = point[2];
                        
            let angleX = Trigonometry.sexagesimalToRadian(-this.cameraRotationX); 
            let newY = y * Math.cos(angleX) + z * (-Math.sin(angleX));
            let newZ = y * Math.sin(angleX) + z * Math.cos(angleX);
            y = newY;
            z = newZ;

            let angleZ = Trigonometry.sexagesimalToRadian(-this.cameraRotationZ);
            let newX = x * Math.cos(angleZ) + y * (-Math.sin(angleZ));
            newY = x * Math.sin(angleZ) + y * Math.cos(angleZ);
            x = newX;
            y = newY;
            
            return [x, y, z];
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
                let rotatedVertex = globals.world.applyCameraRotation(this.vertices[i]);
                sumZ += rotatedVertex[2];
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
            const v0 = globals.world.applyCameraRotation(vertices[0]);
            const v1 = globals.world.applyCameraRotation(vertices[1]);
            const v2 = globals.world.applyCameraRotation(vertices[2]);

            const vector1 = Trigonometry.subtractVectors(v1, v0);
            const vector2 = Trigonometry.subtractVectors(v2, v0);
    
            const normal = Trigonometry.crossProduct(vector1, vector2);
    
            const cameraDirection = [0, 0, 1];
    
            return Trigonometry.dotProduct(normal, cameraDirection) < 0;
        }

        getLightness = (vertices) => {
            const v0 = globals.world.applyCameraRotation(vertices[0]);
            const v1 = globals.world.applyCameraRotation(vertices[1]);
            const v2 = globals.world.applyCameraRotation(vertices[2]);

            const vector1 = Trigonometry.subtractVectors(v1, v0);
            const vector2 = Trigonometry.subtractVectors(v2, v0);

            const normal = Trigonometry.crossProduct(vector1, vector2);
        
            const lightDirection = [0, 0, 1]; 
        
            const dotProduct = Trigonometry.dotProduct(normal, lightDirection);
            
            const lightness = Numbers.scale(dotProduct, -2000, 2000, 30, 90); 

            if (lightness < 0) return 0;
            if (lightness > 100) return 100;

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
            ctx.fill();
        }
    }

    let setInitialFigures = () => {
        
    }

    let addSpecialControls = () => {
        let grow = () => {
            globals.world.cameraZ -= 10;
            if (globals.world.cameraZ < 100) globals.world.cameraZ = 100;
        }
        Browser.addButton("btnGrow", "+", grow);

        let shrink = () => {
            globals.world.cameraZ += 10;
            if (globals.world.cameraZ < 100) globals.world.cameraZ = 100;
        }
        Browser.addButton("btnShrink", "-", shrink);

        let toggleRotation = () => {
            config.rotationMode = config.rotationMode == 1 ? 0 : 1;
        }
        Browser.addButton("btnToggleRotation", "🔄", toggleRotation);
        
    }

    let init = () => {	
        globals.random = Objects.getRandomObject();
        if (config.randomize) randomize();
        initCanvas();
        globals.world = new ThreeDWorld();
        addEvents();
        if (globals.random.nextBool()) setInitialFigures();
        window.requestAnimationFrame(loop);
        addSpecialControls();
    }

    let addEvents = () => {
		canvas.addEventListener('touchend', e => {
            if (!mouseMoved)
                globals.world.addFigure(e.offsetX, e.offsetY);
		}, false);  

		canvas.addEventListener('click', function (e) {
            if (!mouseMoved)
                globals.world.addFigure(e.offsetX, e.offsetY);
		});
    }

    window.trackMouse = (x, y) => {
        if (clicking) {
            if (config.rotationMode) {    
                globals.world.cameraRotationZ += movX * 0.1; 
                globals.world.cameraRotationX += movY * 0.1; 

                const maxPitch = 89;
                if (globals.world.cameraRotationX > maxPitch) globals.world.cameraRotationX = maxPitch;
                if (globals.world.cameraRotationX < -maxPitch) globals.world.cameraRotationX = -maxPitch;
                
            } else {               
                globals.world.figures.forEach(figure => {
                    figure.rotateX(movY);
                    figure.rotateY(movX);
                });
            }
        }
    }
    
    window.draw = () => {
        drawBackground(ctx, canvas);
        globals.world.draw();
    }

    let randomize = () => {        
    }

	window.clearCanvas = () => {		
        globals.world.figures = [];
	}

	window.magic = () => {  
		Sound.error();
	}

    window.upload = () => {
		Sound.error();
    }

    init();
}
