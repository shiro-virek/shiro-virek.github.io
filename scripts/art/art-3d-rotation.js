{        
    const globals = {
        random: Objects.getRandomObject(),
        world: null,
    };

    const figureTypes = [
        {
            name: "letterV",
            vertices: [
                [0, 0, 0], [30, 0, 0], [60, 0, 0], [90, 0, 0],
                [45, 35, 0], [45, 75, 0],
                [0, 0, 20], [30, 0, 20], [60, 0, 20], [90, 0, 20],
                [45, 35, 20], [45, 75, 20]
            ],
            edges: [
                [6, 7], [7, 10], [10, 8], [8, 9], [6, 11], [11, 9],
                [0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11],
                [0, 1], [1, 4], [4, 2], [2, 3], [0, 5], [5, 3]
            ]
        },
        {
            name: "cube",
            vertices: [
                [0, 0, 0], [30, 0, 0], [0, 30, 0], [30, 30, 0],
                [0, 0, 30], [30, 0, 30], [0, 30, 30], [30, 30, 30]
            ],
            edges: [
                [0, 1], [1, 3], [2, 3], [0, 2],
                [4, 5], [5, 7], [7, 6], [4, 6],
                [0, 4], [1, 5], [3, 7], [2, 6]
            ]
        },
        {
            name: "pyramid",
            vertices: [
                [10, 0, 10], [0, 20, 20], [20, 20, 20], [0, 20, 0], [20, 20, 0]
            ],
            edges: [
                [0, 1], [0, 2], [0, 3], [0, 4], [1, 2], [2, 4], [3, 4], [3, 1]
            ]
        },
        {
            name: "pyramid2",
            vertices: [
                [10, 0, 10], [10, 20, 20], [0, 20, 0], [20, 20, 0]
            ],
            edges: [
                [0, 1], [0, 2], [0, 3], [1, 2], [2, 3], [1, 3]
            ]
        },
        {
            name: "icosahedron",
            vertices: [
                [0, 16, 0], [14.304, 7.152, 0], [4.416, 7.152, 13.616],
                [-11.584, 7.152, 8.416], [-11.584, 7.152, -8.416], [4.416, 7.152, -13.616],
                [11.584, -7.152, 8.416], [-4.416, -7.152, 13.616], [-14.304, -7.152, 0],
                [-4.416, -7.152, -13.616], [11.584, -7.152, -8.416], [0, -16, 0]
            ],
            edges: [
                [0, 1], [0, 2], [0, 3], [0, 4], [0, 5],
                [1, 2], [1, 5], [1, 6], [2, 3], [2, 7],
                [3, 4], [3, 8], [4, 5], [4, 9], [5, 10],
                [6, 7], [6, 10], [6, 11], [7, 8], [7, 11],
                [8, 9], [8, 11], [9, 10], [9, 11], [10, 11]
            ]
        },
        {
            "name": "star",
            "vertices": [
                [0, 30, 0],    
                [7, 11, 0],    
                [29, 9, 0],    
                [11, -4, 0],   
                [18, -24, 0],  
                [0, -11, 0],   
                [-18, -24, 0], 
                [-11, -4, 0],  
                [-29, 9, 0],   
                [-7, 11, 0],  

                [0, 30, 20],   
                [7, 11, 20],   
                [29, 9, 20],   
                [11, -4, 20],  
                [18, -24, 20], 
                [0, -11, 20],  
                [-18, -24, 20],
                [-11, -4, 20], 
                [-29, 9, 20],  
                [-7, 11, 20]   
            ],
            "edges": [
                [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 0],
                [10, 11], [11, 12], [12, 13], [13, 14], [14, 15], [15, 16], [16, 17], [17, 18], [18, 19], [19, 10],
                [0, 10], [1, 11], [2, 12], [3, 13], [4, 14], [5, 15], [6, 16], [7, 17], [8, 18], [9, 19]
            ]
        }
    ];

    const config = {
        FOV: 800,
        drawEdges: globals.random.nextBool(),
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
            if (config.drawEdges)
                this.drawFigures();
            else
                this.drawFiguresVertices();
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

        worldToScreenOblique = (point, angleX, angleY) => {
            const radianX = (angleX * Math.PI) / 180;
            const radianY = (angleY * Math.PI) / 180;

            const projectedX = point[0] + point[2] * Math.tan(radianY);
            const projectedY = point[1] + point[2] * Math.tan(radianX);

            return [projectedX, projectedY];
        }

        worldToScreenIsometric = (point) => {
            const isoMatrix = [
                Math.sqrt(3) / 2, -1 / 2, 0,
                Math.sqrt(3) / 2, 1 / 2, 0,
                0, 0, 1
            ];

            const projectedX = isoMatrix[0] * point[0] + isoMatrix[1] * point[1] + isoMatrix[2] * point[2];
            const projectedY = isoMatrix[3] * point[0] + isoMatrix[4] * point[1] + isoMatrix[5] * point[2];
            const projectedZ = isoMatrix[6] * point[0] + isoMatrix[7] * point[1] + isoMatrix[8] * point[2];

            return [projectedX, projectedY];
        }

        drawFigures = () => {
            for (let i = this.figures.length - 1; i >= 0; i--) {
                this.figures[i].drawFigure(ctx);
            }
        }

        drawFiguresVertices = () => {
            for (let i = this.figures.length - 1; i >= 0; i--) {
                this.figures[i].drawVertices(ctx);
            }
        }

        addFigure(x, y) {
            let centeredX = x - halfWidth;
            let centeredY = y - halfHeight;

            let figure = new Figure();

            figure.vertices = Objects.clone(config.figureInfo.vertices);
            figure.edges = Objects.clone(config.figureInfo.edges);

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
            Sound.ping();
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
        }

        rotateZ = (angle) => {
            angle = Trigonometry.sexagesimalToRadian(angle);

            for (let i = this.vertices.length - 1; i >= 0; i--) {
                let x = this.vertices[i][0] * Math.cos(angle) + this.vertices[i][1] * (-Math.sin(angle));
                this.vertices[i][1] = this.vertices[i][0] * Math.sin(angle) + this.vertices[i][1] * Math.cos(angle); //Y
                this.vertices[i][0] = x;
            }
        }

        rotateY = (angle) => {
            angle = Trigonometry.sexagesimalToRadian(angle);

            for (let i = this.vertices.length - 1; i >= 0; i--) {
                let x = this.vertices[i][0] * Math.cos(angle) + this.vertices[i][2] * Math.sin(angle);
                this.vertices[i][2] = this.vertices[i][0] * (-Math.sin(angle)) + this.vertices[i][2] * Math.cos(angle); //Z
                this.vertices[i][0] = x;
            }
        }

        rotateX = (angle) => {
            angle = Trigonometry.sexagesimalToRadian(angle);

            for (let i = this.vertices.length - 1; i >= 0; i--) {
                let y = this.vertices[i][1] * Math.cos(angle) + this.vertices[i][2] * (-Math.sin(angle));
                this.vertices[i][2] = this.vertices[i][1] * Math.sin(angle) + this.vertices[i][2] * Math.cos(angle); //Z
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

        drawEdge = (p0, p1, color) => {
            let point2d0 = globals.world.worldToScreen(p0);
            let point2d1 = globals.world.worldToScreen(p1);

            Drawing.drawLine(ctx, point2d0[0], point2d0[1], point2d1[0], point2d1[1], 1, color);
        }

        drawVertex = (point, color) => {
            let vertex = globals.world.worldToScreen(point);

            let newColor = `hsl(${Numbers.scale(point[2], -500, 500, 300, 360)}, ${100}%, ${50}%)`;

            Drawing.drawDot(ctx, vertex[0], vertex[1], newColor);
        }

        drawFigure = () => {
            for (let i = this.edges.length - 1; i >= 0; i--) {
                this.drawEdge(this.vertices[this.edges[i][0]], this.vertices[this.edges[i][1]]);
            }
        }

        drawVertices = () => {
            for (let i = this.vertices.length - 1; i >= 0; i--) {
                this.drawVertex(this.vertices[i]);
            }
        }
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
        initCanvas();
        globals.world = new ThreeDWorld();
        addEvents();
        window.requestAnimationFrame(loop)

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
