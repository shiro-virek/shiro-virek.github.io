{        
    const globals = {
        random: Objects.getRandomObject()
    };

    let isCameraDragging = false;

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
        }
    ];

    const config = {
        FOV: 10000,
        drawEdges: globals.random.nextBool(),
        figureInfo: figureTypes[globals.random.nextInt(0, figureTypes.length - 1)],
    };    

    class ThreeDWorld {
        constructor() {
            this.figures = [];
            this.cameraRotationX = 0; 
            this.cameraRotationZ = 0;
        }

        draw = () => {
            if (config.drawEdges)
                this.drawFigures();
            else
                this.drawFiguresVertices();
        }

         worldToScreen = (point) => {
            // 1. Aplicar la rotación de la cámara (rotación inversa al mundo)
            const rotatedPoint = this.applyCameraRotation(point); 
            
            const x = rotatedPoint[0];
            const y = rotatedPoint[1];
            const z = rotatedPoint[2];

            // 2. Proyectar (usando la coordenada Z ya rotada)
            const scaleFactor = config.FOV / (config.FOV + z);
            const projectedX = x * scaleFactor;
            const projectedY = y * scaleFactor;
            
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

        static sexagesimalToRadian = (degrees) => {
            return degrees * (Math.PI / 180);
        }

        addDistance = (distance) => {
            if (config.FOV + distance > 0)
                config.FOV += distance;
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
            let figure = new Figure();

            figure.vertices = Objects.clone(config.figureInfo.vertices);
            figure.edges = Objects.clone(config.figureInfo.edges);

            figure.translateX(x);
            figure.translateY(y);

            this.figures.push(figure);
			Sound.ping();
        }

        // Aplica la rotación inversa de la cámara a un punto (x, y, z)
        applyCameraRotation = (point) => {
            let x = point[0];
            let y = point[1];
            let z = point[2];
            
            // --- Rotación Inversa en X (Pitch) ---
            // La rotación de la figura ya está en el objeto Figure. 
            // Aquí se rotan las coordenadas del punto respecto a la cámara.
            
            let angleX = ThreeDWorld.sexagesimalToRadian(-this.cameraRotationX); // Inverso
            let newY = y * Math.cos(angleX) + z * (-Math.sin(angleX));
            let newZ = y * Math.sin(angleX) + z * Math.cos(angleX);
            y = newY;
            z = newZ;

            // --- Rotación Inversa en Z (Yaw) ---
            let angleZ = ThreeDWorld.sexagesimalToRadian(-this.cameraRotationZ); // Inverso
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
            angle = ThreeDWorld.sexagesimalToRadian(angle);

            for (let i = this.vertices.length - 1; i >= 0; i--) {
                let x = this.vertices[i][0] * Math.cos(angle) + this.vertices[i][1] * (-Math.sin(angle));
                this.vertices[i][1] = this.vertices[i][0] * Math.sin(angle) + this.vertices[i][1] * Math.cos(angle); //Y
                this.vertices[i][0] = x;
            }
        }

        rotateY = (angle) => {
            angle = ThreeDWorld.sexagesimalToRadian(angle);

            for (let i = this.vertices.length - 1; i >= 0; i--) {
                let x = this.vertices[i][0] * Math.cos(angle) + this.vertices[i][2] * Math.sin(angle);
                this.vertices[i][2] = this.vertices[i][0] * (-Math.sin(angle)) + this.vertices[i][2] * Math.cos(angle); //Z
                this.vertices[i][0] = x;
            }
        }

        rotateX = (angle) => {
            angle = ThreeDWorld.sexagesimalToRadian(angle);

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
            let point2d0 = world.worldToScreen(p0);
            let point2d1 = world.worldToScreen(p1);

            Drawing.drawLine(ctx, point2d0[0], point2d0[1], point2d1[0], point2d1[1], 1, color);
        }

        drawVertex = (point, color) => {
            let vertex = world.worldToScreen(point);

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
            config.FOV += 10000;
        }
        Browser.addButton("btnGrow", "+", grow);

        let shrink = () => {
            config.FOV -= 10000;
        }
        Browser.addButton("btnShrink", "-", shrink);
    }

    let init = () => {
        initCanvas();
        world = new ThreeDWorld();
        addEvents();
        window.requestAnimationFrame(loop)

        addSpecialControls();
    }

    let addEvents = () => {
		canvas.addEventListener('touchend', e => {
            if (!mouseMoved)
                world.addFigure(e.offsetX, e.offsetY);
		}, false);  

		canvas.addEventListener('click', function (e) {
            if (!mouseMoved)
                world.addFigure(e.offsetX, e.offsetY);
		});

        canvas.addEventListener('wheel', function(e) {
            // e.deltaY es negativo si la rueda va hacia arriba (acercar), positivo hacia abajo (alejar)
            const zoomAmount = e.deltaY * 5; // Ajusta el factor para una sensibilidad cómoda
            
            // Si la rueda va hacia abajo (e.deltaY > 0), el zoomAmount es positivo, lo que *aumenta* el FOV, alejando
            // Si la rueda va hacia arriba (e.deltaY < 0), el zoomAmount es negativo, lo que *disminuye* el FOV, acercando
            world.addDistance(zoomAmount); 
            
            e.preventDefault(); // Evita el scroll de la página
        });

        canvas.addEventListener('mousedown', function (e) {
            // Verificar si una tecla de modificador (ej: Shift) está presionada para rotar la cámara
            if (e.shiftKey) {
                isCameraDragging = true;
            } else {
                isCameraDragging = false;
            }
        });

        canvas.addEventListener('mouseup', function (e) {
            isCameraDragging = false;
        });
    }

    window.trackMouse = (x, y) => {
     // 'movX' y 'movY' son la diferencia de movimiento del mouse desde el último fotograma
        
        if (isCameraDragging) {    
            // Rotar la cámara (modificar los ángulos en ThreeDWorld)
            world.cameraRotationZ += movX * 0.1; // Rotación horizontal (Yaw)
            world.cameraRotationX += movY * 0.1; // Rotación vertical (Pitch)

            // Opcional: Limitar la rotación vertical para evitar el "gimbal lock"
            const maxPitch = 89;
            if (world.cameraRotationX > maxPitch) world.cameraRotationX = maxPitch;
            if (world.cameraRotationX < -maxPitch) world.cameraRotationX = -maxPitch;
            
        } else if (clicking) {    
            // Rotación de figuras existente
            world.figures.forEach(figure => {
                figure.translateX(-halfWidth);
                figure.translateY(-halfHeight);
                figure.rotateX(movY);
                figure.rotateY(movX);
                figure.translateX(halfWidth);
                figure.translateY(halfHeight);
            });
        }
    }

    window.draw = () => {
        drawBackground(ctx, canvas);
        world.draw();
    }

	window.clearCanvas = () => {		
        world.figures = [];
	}

	window.magic = () => {  
		Sound.error();
	}

    window.upload = () => {
		Sound.error();
    }

    init();    
}
