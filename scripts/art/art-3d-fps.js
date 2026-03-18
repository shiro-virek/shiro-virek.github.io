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
        },
        {
            name: "hex_prism",
            vertices: [
                [-15, 20, -26], [15, 20, -26], [30, 20, 0], 
                [15, 20, 26], [-15, 20, 26], [-30, 20, 0],
                [-15, -20, -26], [15, -20, -26], [30, -20, 0], 
                [15, -20, 26], [-15, -20, 26], [-30, -20, 0]
            ],
            faces: [
                [0, 1, 2, 3, 4, 5], 
                [11, 10, 9, 8, 7, 6],    
                [0, 6, 7, 1],
                [1, 7, 8, 2],
                [2, 8, 9, 3],
                [3, 9, 10, 4],
                [4, 10, 11, 5],
                [5, 11, 6, 0]
            ]
        },
        {
            name: "pyramid",
            vertices: [
                [-20, -20, -20], 
                [20, -20, -20],  
                [20, -20, 20],   
                [-20, -20, 20],  
                [0, 20, 0]       
            ],
            faces: [
                [3, 2, 1, 0],
                [0, 1, 4],   
                [1, 2, 4],   
                [2, 3, 4],  
                [3, 0, 4]     
            ]
        },
        {
            name: "octahedron",
            vertices: [
                [0, -30, 0], 
                [0, 30, 0], 
                [-20, 0, -20], 
                [20, 0, -20],  
                [20, 0, 20],   
                [-20, 0, 20]   
            ],
            faces: [
                [1, 2, 3], [1, 3, 4], [1, 4, 5], [1, 5, 2],
                [0, 3, 2], [0, 4, 3], [0, 5, 4], [0, 2, 5]
            ]
        }
    ];

    const globals = {
        random: Objects.getRandomObject(),
        world: null,
        joystickL: null,
        joystickR: null,
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

            this.cameraX = 0;
            this.cameraY = -200; 
            this.cameraZ = 0;

            this.cameraRotationX = 5;
            this.cameraRotationZ = 0;
        }

        draw = () => {
            this.figures.forEach(figure => {
                figure.cachedZ = figure.getAverageZ();
            });

            this.figures.sort((a, b) => {
                if (isNaN(a.cachedZ)) return 1; 
                if (isNaN(b.cachedZ)) return -1;
                
                return b.cachedZ - a.cachedZ;
            });
            
            this.figures.forEach(figure => {          
                figure.draw();       
            });
        }

        worldToScreen = (point) => {
            const viewPoint = this.applyCameraTransform(point); 
            
            const x = viewPoint[0];
            const y = viewPoint[1];
            const z = viewPoint[2];

            if (z <= 1) return [-9999, -9999]; 

            const scaleFactor = config.FOV / z;
            
            const projectedX = (x * scaleFactor) + halfWidth;
            const projectedY = (y * scaleFactor) + halfHeight;
            
            return [projectedX, projectedY];    
        }

        applyCameraTransform = (point) => {
            let x = point[0] - this.cameraX;
            let y = point[1] - this.cameraY;
            let z = point[2] - this.cameraZ;
            
            // Rotación Yaw (Horizontal)
            let angleZ = Trigonometry.sexagesimalToRadian(-this.cameraRotationZ);
            let cosZ = Math.cos(angleZ);
            let sinZ = Math.sin(angleZ);
            
            let nx = x * cosZ - z * sinZ;
            let nz = x * sinZ + z * cosZ;
            x = nx;
            z = nz;

            // Rotación Pitch (Vertical)
            let angleX = Trigonometry.sexagesimalToRadian(-this.cameraRotationX);
            let cosX = Math.cos(angleX);
            let sinX = Math.sin(angleX);
            
            let ny = y * cosX - z * sinX;
            nz = y * sinX + z * cosX;
            y = ny;
            z = nz;
            
            return [x, y, z];
        }
                                        
        moveForward = (speed) => {
            let angleRad = Trigonometry.sexagesimalToRadian(this.cameraRotationZ);
            // Avance relativo a la rotación actual
            this.cameraX -= Math.sin(angleRad) * speed;
            this.cameraZ += Math.cos(angleRad) * speed;
        }

        moveRight = (speed) => {
            let angleRad = Trigonometry.sexagesimalToRadian(this.cameraRotationZ + 90);
            // Lateral relativo a la rotación actual
            this.cameraX -= Math.sin(angleRad) * speed;
            this.cameraZ += Math.cos(angleRad) * speed;
        }

        moveUp = (speed) => {
            this.cameraY += speed;
        }

        rotate = (dPitch, dYaw) => {
            this.cameraRotationX += dPitch;
            this.cameraRotationZ += dYaw;

            if (this.cameraRotationX > 90) this.cameraRotationX = 90;
            if (this.cameraRotationX < -90) this.cameraRotationX = -90;
        }

        addFigure = (screenX, screenY, fig = config.figureInfo) => {
            const spawnDistance = 500; 

            let centeredX = screenX - halfWidth;
            let centeredY = screenY - halfHeight;

            let localX = centeredX * spawnDistance / config.FOV;
            let localY = centeredY * spawnDistance / config.FOV;
            let localZ = spawnDistance; 

            let angleX = Trigonometry.sexagesimalToRadian(this.cameraRotationX);

            let y1 = localY * Math.cos(angleX) - localZ * Math.sin(angleX);
            let z1 = localY * Math.sin(angleX) + localZ * Math.cos(angleX);
            let x1 = localX;

            let angleZ = Trigonometry.sexagesimalToRadian(this.cameraRotationZ);

            let xFinal = x1 * Math.cos(angleZ) - z1 * Math.sin(angleZ);
            let zFinal = x1 * Math.sin(angleZ) + z1 * Math.cos(angleZ);
            let yFinal = y1;

            let worldX = xFinal + this.cameraX;
            let worldY = yFinal + this.cameraY;
            let worldZ = zFinal + this.cameraZ;

            let figure = new Figure();
            figure.vertices = Objects.clone(fig.vertices);
            figure.faces = Objects.clone(fig.faces);

            figure.translateX(worldX);
            figure.translateY(worldY);
            figure.translateZ(worldZ); 

            figure.cachedZ = figure.getAverageZ();

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
            this.faces = []; 
            this.hue = globals.random.nextInt(1, 360);
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

        translateX = (d) => { for(let v of this.vertices) v[0]+=d; }
        translateY = (d) => { for(let v of this.vertices) v[1]+=d; }
        translateZ = (d) => { for(let v of this.vertices) v[2]+=d; }

        getAverageZ = () => {
            let sumZ = 0;
            for (let i = 0; i < this.vertices.length; i++) {
                let rotatedVertex = globals.world.applyCameraRotation(this.vertices[i]);
                sumZ += rotatedVertex[2];
            }
            return sumZ / this.vertices.length;
        }

        draw = () => {
            let facesToDraw = [];

            this.faces.forEach(faceIndices => {
                const rotatedVertices = faceIndices.map(index => 
                    globals.world.applyCameraRotation(this.vertices[index])
                );

                let faceLightness = 0;
                if (rotatedVertices.length >= 3) {
                    faceLightness = this.getLightness([
                        rotatedVertices[0], 
                        rotatedVertices[1], 
                        rotatedVertices[2]
                    ]);
                }

                for (let i = 1; i < rotatedVertices.length - 1; i++) {
                    const tVerts = [
                        rotatedVertices[0],            
                        rotatedVertices[i],            
                        rotatedVertices[i + 1]         
                    ];
                    
                    const tIndices = [
                        faceIndices[0],
                        faceIndices[i],
                        faceIndices[i + 1]
                    ];

                    let sumZ = tVerts[0][2] + tVerts[1][2] + tVerts[2][2];
                    const avgZ = sumZ / 3;

                    facesToDraw.push({
                        originalIndices: tIndices,
                        rotatedVertices: tVerts,
                        avgZ: avgZ,
                        lightness: faceLightness 
                    });
                }
            });

            facesToDraw.sort((a, b) => b.avgZ - a.avgZ);

            facesToDraw.forEach(item => {
                if (this.shouldDrawFace(item.rotatedVertices)) {
                    this.drawFace(item.originalIndices, item.lightness);                        
                }
            });
        }

        shouldDrawFace = (rotatedVertices) => {
            const vector1 = Trigonometry.subtractVectors(rotatedVertices[1], rotatedVertices[0]);
            const vector2 = Trigonometry.subtractVectors(rotatedVertices[2], rotatedVertices[0]);
    
            const normal = Trigonometry.crossProduct(vector1, vector2);
            const cameraDirection = [0, 0, 1];
            
            return Trigonometry.dotProduct(normal, cameraDirection) > 0;
        }

        getLightness = (rotatedVertices) => {
            const vector1 = Trigonometry.subtractVectors(rotatedVertices[1], rotatedVertices[0]);
            const vector2 = Trigonometry.subtractVectors(rotatedVertices[2], rotatedVertices[0]);
            
            let normal = Trigonometry.crossProduct(vector1, vector2);
        
            let magnitude = Math.sqrt(normal[0]*normal[0] + normal[1]*normal[1] + normal[2]*normal[2]);

            if (magnitude === 0) magnitude = 1;

            normal[0] /= magnitude;
            normal[1] /= magnitude;
            normal[2] /= magnitude;

            const lightDirection = [0, 0, 1];
        
            const dotProduct = Trigonometry.dotProduct(normal, lightDirection);
            
            const lightness = Numbers.scale(dotProduct, 0, 1, 20, 70); 

            if (lightness < 0) return 0;
            if (lightness > 100) return 100;
            return lightness;
        }

        drawFace = (indices, lightness) => {
            for (let i = 0; i < indices.length; i++) {
                const viewPoint = globals.world.applyCameraTransform(this.vertices[indices[i]]);
                if (viewPoint[2] < 10) return; 
            }
            
            let color = `hsl(${this.hue}, ${100}%, ${lightness}%)`;
            
            ctx.beginPath();
            let vertex = globals.world.worldToScreen(this.vertices[indices[0]]);
            ctx.moveTo(vertex[0], vertex[1]);
            
            for (let i = 1; i < indices.length; i++) {
                vertex = globals.world.worldToScreen(this.vertices[indices[i]]);
                ctx.lineTo(vertex[0], vertex[1]);
            }
            ctx.closePath();
            
            ctx.fillStyle = color;
            ctx.strokeStyle = color; 
            ctx.fill();
            ctx.stroke();
        }
    }

    let setInitialFigures = () => {
        for (let x = -2000; x <= 2000; x += 500) {
            for (let z = -2000; z <= 2000; z += 500) {
                let floorTile = new Figure();
                floorTile.vertices = Objects.clone(figureTypes[0].vertices);
                floorTile.faces = Objects.clone(figureTypes[0].faces);
                
                floorTile.scaleX(10); 
                floorTile.scaleZ(10); 
                floorTile.scaleY(0.1); 

                floorTile.translateX(x);
                floorTile.translateY(50); 
                floorTile.translateZ(z);
                
                floorTile.hue = 200; 
                globals.world.figures.push(floorTile);
            }
        }
        
        for (let i = 0; i < 15; i++) {
            let building = new Figure();
            building.vertices = Objects.clone(figureTypes[0].vertices);
            building.faces = Objects.clone(figureTypes[0].faces);
            
            let h = globals.random.nextInt(5, 15);
            building.scaleY(h); 
            building.scaleX(2);
            building.scaleZ(2);
            
            let posX = globals.random.nextInt(-1500, 1500);
            let posZ = globals.random.nextInt(-1500, 1500);
            
            building.translateX(posX);
            building.translateY(50 - (h * 20)); 
            building.translateZ(posZ);
            
            globals.world.figures.push(building);
        }

        
        for (let i = 0; i < 10; i++) {
            let pyramid = new Figure();
            pyramid.vertices = Objects.clone(figureTypes[2].vertices); 
            pyramid.faces = Objects.clone(figureTypes[2].faces);

            pyramid.rotateX(180);
            pyramid.scale(8); 

            let posX = globals.random.nextInt(-2000, 2000);
            let posZ = globals.random.nextInt(-2000, 2000);

            pyramid.translateX(posX);
            pyramid.translateY(50 - 20 * 8); 
            pyramid.translateZ(posZ);
            
            pyramid.hue = 30; 
            globals.world.figures.push(pyramid);
        }
            
    }

    let addSpecialControls = () => {
        const speed = 5;       
        const rotSpeed = 2;    

        let wKey = () => {
            globals.world.moveForward(speed);
        }
        Browser.addButton("btnWKey", "⬆️", wKey);

        let aKey = () => {
            globals.world.moveForward(-speed);
        }        
        Browser.addButton("btnAKey", "⬇️", aKey);

        let sKey = () => {
            globals.world.moveRight(-speed);
        }        
        Browser.addButton("btnSKey", "⬅️", sKey);

        let dKey = () => {
            globals.world.moveRight(speed);
        }
        Browser.addButton("btnDKey", "➡️", dKey);

        let zKey = () => {
            globals.world.moveUp(-speed);
        }
        Browser.addButton("btnZKey", "⤴️", zKey);

        let xKey = () => {
            globals.world.moveUp(speed);
        }
        Browser.addButton("btnXKey", "⤵️", xKey);
        
        let bKey = () => {
            globals.world.rotate(rotSpeed, 0);
        }
        Browser.addButton("btnBKey", "⏫", bKey);

        let nKey = () => {
            globals.world.rotate(-rotSpeed, 0);
        }
        Browser.addButton("btnNKey", "⏬", nKey);
        
        let vKey = () => {
            globals.world.rotate(0, rotSpeed);
        }
        Browser.addButton("btnVKey", "⏪", vKey);

        let cKey = () => {
            globals.world.rotate(0, -rotSpeed)
        }
        Browser.addButton("btnCKey", "⏩", cKey);

        globals.joystickL = new Joystick(100, height - 100);
        globals.joystickL.add();

        globals.joystickR = new Joystick(width - 100, height - 100);
        globals.joystickR.add();
    }

    let init = () => {	
        globals.random = Objects.getRandomObject();
        if (config.randomize) randomize();
        initCanvas();
        globals.world = new ThreeDWorld();
        addEvents();
        setInitialFigures();
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
        }
    }
            
    window.draw = () => {
        drawBackground(ctx, canvas);
        globals.world.draw();

        // Movimiento: Joystick Izquierdo
        const forwardSpeed = -globals.joystickL.deltaY / 25; 
        const sideSpeed = -globals.joystickL.deltaX / 25;

        if (Math.abs(forwardSpeed) > 0.1) globals.world.moveForward(forwardSpeed);
        if (Math.abs(sideSpeed) > 0.1) globals.world.moveRight(sideSpeed);

        // Rotación: Joystick Derecho
        // Quitamos el menos al segundo parámetro para que derecha sea derecha
        globals.world.rotate(-globals.joystickR.deltaY / 150, -globals.joystickR.deltaX / 150);
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
