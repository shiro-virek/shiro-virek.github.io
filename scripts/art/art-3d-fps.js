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
        rows: 0,
        columns: 0,   
        floorCenterX: 0,
        floorCenterZ: 0,
        points: 0,
    }

    const config = {
        randomize: true,
        FOV: 1000,
        figureInfo: figureTypes[globals.random.nextInt(0, figureTypes.length - 1)],
        rotationMode: 0,
        tileSize: 500,
        floorSize: 2000,
        worldSize: 7000,
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

        drawMap = () => {
            let mapSize = 100;
            
            Drawing.drawRectangle(ctx, 10, 10, mapSize, mapSize, 'rgba(255,255,255,0.5)');  

            let xPlayer = Numbers.scale(this.cameraX, -config.worldSize, config.worldSize, 10, 10 + mapSize);
            let zPlayer = Numbers.scale(this.cameraZ, -config.worldSize, config.worldSize, 10, 10 + mapSize);          
            Drawing.drawCircle(ctx, xPlayer, 10 + mapSize - zPlayer, 3, 'rgba(255,0,0,0.5)');   

            let xSecret = Numbers.scale(globals.secretX, -config.worldSize, config.worldSize, 10, 10 + mapSize);
            let zSecret = Numbers.scale(globals.secretZ, -config.worldSize, config.worldSize, 10, 10 + mapSize);          
            Drawing.drawCircle(ctx, xSecret, 10 + mapSize - zSecret, 3, 'rgba(0,255,0,0.5)'); 
        }   

        draw = () => {
            let allFaces = [];

            this.figures.forEach(figure => {
                figure.faces.forEach(faceIndices => {
                    const viewVertices = faceIndices.map(index => 
                        this.applyCameraTransform(figure.vertices[index])
                    );

                    let isBehindCamera = false;
                    for (let v of viewVertices) {
                        if (v[2] <= 1) {
                            isBehindCamera = true;
                            break;
                        }
                    }
                    if (isBehindCamera) return;

                    if (figure.shouldDrawFace(viewVertices)) {
                        let sumZ = 0;
                        viewVertices.forEach(v => sumZ += v[2]);
                        const avgZ = sumZ / viewVertices.length;

                        allFaces.push({
                            worldVertices: faceIndices.map(index => figure.vertices[index]),
                            viewZ: avgZ,
                            hue: figure.hue,
                            lightness: figure.getLightness(viewVertices)
                        });
                    }
                });
            });

            allFaces.sort((a, b) => b.viewZ - a.viewZ);

            allFaces.forEach(face => {
                this.drawSingleFace(face);
            });


            this.translateInfiniteFloor();
        }

        checkWallCollision = (nextX, nextZ) => {
            const playerSize = 40; 

            for (let fig of this.figures) {
                if (!fig.solid) continue; 

                const collisionX = nextX + playerSize > fig.bounds.minX && 
                                nextX - playerSize < fig.bounds.maxX;
                                
                const collisionZ = nextZ + playerSize > fig.bounds.minZ && 
                                nextZ - playerSize < fig.bounds.maxZ;

                if (collisionX && collisionZ) {
                    return true; 
                }
            }
            return false;
        }

        translateInfiniteFloor = () => {    
            if (this.cameraX < globals.floorCenterX - config.tileSize && this.cameraX > -config.worldSize + config.tileSize * 3) {
                globals.world.figures.filter(face => face.infinite).forEach(face => {    
                    face.translateX(-config.tileSize);          
                });

                globals.floorCenterX -= config.tileSize;
            }    
                        
            if (this.cameraX > globals.floorCenterX + config.tileSize && this.cameraX < config.worldSize - config.tileSize * 3) {
                globals.world.figures.filter(face => face.infinite).forEach(face => {    
                    face.translateX(config.tileSize);          
                });

                globals.floorCenterX += config.tileSize;
            }    

            if (this.cameraZ < globals.floorCenterZ - config.tileSize && this.cameraZ > -config.worldSize + config.tileSize * 3) {
                globals.world.figures.filter(face => face.infinite).forEach(face => {    
                    face.translateZ(-config.tileSize);          
                });

                globals.floorCenterZ -= config.tileSize;
            }    
                        
            if (this.cameraZ > globals.floorCenterZ + config.tileSize && this.cameraZ < config.worldSize - config.tileSize * 3) {
                globals.world.figures.filter(face => face.infinite).forEach(face => {    
                    face.translateZ(config.tileSize);          
                });

                globals.floorCenterZ += config.tileSize;
            }    
        }

        drawSingleFace = (face) => {
            const dist = face.viewZ;
            
            let alpha = Numbers.scale(dist, 2000, 3000, 1, 0);
            if (alpha < 0) alpha = 0;
            if (alpha > 1) alpha = 1;

            const color = `hsla(${face.hue}, 100%, ${face.lightness}%, ${alpha})`;
            
            ctx.beginPath();
            let screenPoint = this.worldToScreen(face.worldVertices[0]);
            ctx.moveTo(screenPoint[0], screenPoint[1]);
            
            for (let i = 1; i < face.worldVertices.length; i++) {
                screenPoint = this.worldToScreen(face.worldVertices[i]);
                ctx.lineTo(screenPoint[0], screenPoint[1]);
            }
            
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.strokeStyle = color; 
            ctx.lineWidth = 1;    
            ctx.fill();
            ctx.stroke();
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
            
            let angleZ = Trigonometry.sexagesimalToRadian(-this.cameraRotationZ);
            let cosZ = Math.cos(angleZ);
            let sinZ = Math.sin(angleZ);
            
            let nx = x * cosZ - z * sinZ;
            let nz = x * sinZ + z * cosZ;
            x = nx;
            z = nz;

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
            this.cameraX -= Math.sin(angleRad) * speed;
            this.cameraZ += Math.cos(angleRad) * speed;
        }

        moveRight = (speed) => {
            let angleRad = Trigonometry.sexagesimalToRadian(this.cameraRotationZ + 90);
            this.cameraX -= Math.sin(angleRad) * speed;
            this.cameraZ += Math.cos(angleRad) * speed;
        }

        moveCameraY = (speed) => {
            let angleRad = Trigonometry.sexagesimalToRadian(this.cameraRotationX);
            this.cameraX -= Math.sin(angleRad) * speed;
            this.cameraY += Math.cos(angleRad) * speed;
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

        drawCrossHair = () => {
            const size = 10;
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(halfWidth - size, halfHeight);
            ctx.lineTo(halfWidth + size, halfHeight);
            ctx.moveTo(halfWidth, halfHeight - size);
            ctx.lineTo(halfWidth, halfHeight + size);
            ctx.stroke();
        }

        checkShoot = () => {
            let targetFigure = null;
            let minZ = Infinity;

            this.figures.forEach((figure, index) => {
                if (figure.breakable === false) return;
                figure.faces.forEach(faceIndices => {
                    const rotatedVertices = faceIndices.map(i => 
                        this.applyCameraTransform(figure.vertices[i])
                    );

                    if (rotatedVertices.some(v => v[2] <= 1)) return;
                    if (!figure.shouldDrawFace(rotatedVertices)) return;

                    const screenPoints = faceIndices.map(i => this.worldToScreen(figure.vertices[i]));

                    if (Trigonometry.isPointInPoly([halfWidth, halfHeight], screenPoints)) {
                        let avgZ = figure.getAverageZ();
                        if (avgZ < minZ) {
                            minZ = avgZ;
                            targetFigure = index; 
                        }
                    }
                });
            });

            if (targetFigure !== null) {
                Sound.bang();
                let secretFound = false;

                if (this.figures[targetFigure].secret) {
                    secretFound = true;
                }

                this.figures.splice(targetFigure, 1);
                globals.points += 1;

                if (secretFound) {
                    addSecretObject();
                }
            }
        }
    }

    class Figure {
        constructor() {
            this.solid = false;
            this.infinite = false;
            this.breakable = false;
            this.secret = false;
            this.vertices = [];
            this.edges = [];
            this.faces = []; 
            this.hue = globals.random.nextInt(1, 360);
            this.setupCollision();
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

        setupCollision = () => {
            let minX = Infinity, maxX = -Infinity;
            let minZ = Infinity, maxZ = -Infinity;

            this.vertices.forEach(v => {
                if (v[0] < minX) minX = v[0]; if (v[0] > maxX) maxX = v[0];
                if (v[2] < minZ) minZ = v[2]; if (v[2] > maxZ) maxZ = v[2];
            });

            this.bounds = { minX, maxX, minZ, maxZ };
            
            this.center = [(minX + maxX) / 2, 0, (minZ + maxZ) / 2];
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
            
            const distPoint = globals.world.applyCameraTransform(this.vertices[indices[0]]);
            const distance = distPoint[2];
            
            let alpha = Numbers.scale(distance, 2000, 5000, 1, 0);
            if (alpha < 0) alpha = 0;
            if (alpha > 1) alpha = 1;

            let color = `hsla(${this.hue}, 100%, ${lightness}%, ${alpha})`;
            
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
            ctx.lineWidth = 1;    
            ctx.fill();
            ctx.stroke();
        }
    }

    let addWalls = () => {
        for (let i = 1; i <=4; i++) {         
            let segmentSize = 400;
            let segments = config.worldSize * 2 / segmentSize;
            for (let j = -segments; j < segments; j++) {
                let wall = new Figure();
                wall.vertices = Objects.clone(figureTypes[0].vertices);
                wall.faces = Objects.clone(figureTypes[0].faces);

                wall.scaleX(segmentSize / 40);
                wall.scaleY(20);

                if (i % 2 === 0) {
                    wall.rotateY(90);
                }

                switch(i) {
                    case 1: wall.translateX(j*segmentSize); wall.translateZ(-config.worldSize); break;
                    case 2: wall.translateX(config.worldSize); wall.translateZ(j*segmentSize); break;
                    case 3: wall.translateX(j*segmentSize); wall.translateZ(config.worldSize); break;
                    case 4: wall.translateX(-config.worldSize); wall.translateZ(j*segmentSize); break;
                }

                wall.translateY(-300);

                wall.hue = 0;

                wall.breakable = false;
                wall.infinite = false;
                wall.solid = true;
                wall.setupCollision();
                globals.world.figures.push(wall);   
            }           
        }
    }

    let addFloor = () => {

        for (let x = -config.floorSize; x <= config.floorSize; x += config.tileSize) {
            for (let z = -config.floorSize; z <= config.floorSize; z += config.tileSize) {
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

                floorTile.breakable = false;
                floorTile.infinite = true;
                floorTile.solid = false;
                floorTile.setupCollision();
                globals.world.figures.push(floorTile);
            }
        }
    }   

    let addBuildings = () => {

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
            
            building.breakable = true;
            building.infinite = false;
            building.solid = true;
            building.setupCollision();
            globals.world.figures.push(building);
        }
    }

    let addPyramids = () => {


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

            pyramid.breakable = true;
            pyramid.infinite = false;
            pyramid.solid = true;
            pyramid.setupCollision();
            globals.world.figures.push(pyramid);
        }
    }

    let addSecretObject = () => {
        let pyramid = new Figure();
        pyramid.vertices = Objects.clone(figureTypes[2].vertices); 
        pyramid.faces = Objects.clone(figureTypes[2].faces);

        pyramid.rotateX(180);
        pyramid.scale(8); 

        let posX = globals.random.nextInt(-config.worldSize, config.worldSize);
        let posZ = globals.random.nextInt(-config.worldSize, config.worldSize);

        globals.secretX = posX;
        globals.secretZ = posZ;

        pyramid.translateX(posX);
        pyramid.translateY(50 - 20 * 8); 
        pyramid.translateZ(posZ);
        
        pyramid.hue = 100; 

        pyramid.breakable = true;
        pyramid.infinite = false;
        pyramid.solid = true;
        pyramid.secret = true;
        pyramid.setupCollision();
        globals.world.figures.push(pyramid);        
    }

    let setInitialFigures = () => {
        globals.columns = Math.ceil((config.floorSize * 2) / config.tileSize);
        globals.rows = Math.ceil((config.floorSize * 2) / config.tileSize);

        addFloor();
        addBuildings();
        //addPyramids();
        addWalls();
        addSecretObject();
    }

    let addSpecialControls = () => {
        let toggleRotation = () => {
            if (config.rotationMode === 0) {
                config.rotationMode = 1;
                document.getElementById('btnToggleRotation').textContent = '🪽';
            } else {
                config.rotationMode = 0;
                document.getElementById('btnToggleRotation').textContent = '🔁';
            }                
        }
        Browser.addButton("btnToggleRotation", "🔁", toggleRotation);

        let shoot = () => {      
            Sound.ping(10); 
            globals.world.checkShoot();   
        }

        Browser.addButton("btnShoot", "🔫", shoot);

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

        const forwardSpeed = -globals.joystickL.deltaY / 10; 
        const sideSpeed = -globals.joystickL.deltaX / 10;
        
        let angleRad = Trigonometry.sexagesimalToRadian(globals.world.cameraRotationZ);
        
        let nextX_f = globals.world.cameraX - Math.sin(angleRad) * forwardSpeed;
        let nextZ_f = globals.world.cameraZ + Math.cos(angleRad) * forwardSpeed;
        
        let angleRadR = Trigonometry.sexagesimalToRadian(globals.world.cameraRotationZ + 90);
        let nextX_r = globals.world.cameraX - Math.sin(angleRadR) * sideSpeed;
        let nextZ_r = globals.world.cameraZ + Math.cos(angleRadR) * sideSpeed;

        if (Math.abs(forwardSpeed) > 0.1) {
            if (!globals.world.checkWallCollision(nextX_f, nextZ_f)) {
                globals.world.moveForward(forwardSpeed);
            }else{
				Sound.hit();
			}
        }
        
        if (Math.abs(sideSpeed) > 0.1) {
            if (!globals.world.checkWallCollision(nextX_r, nextZ_r)) {
                globals.world.moveRight(sideSpeed);
            }
        }

        if (config.rotationMode === 0) {
            globals.world.rotate(-globals.joystickR.deltaY / 150, -globals.joystickR.deltaX / 150);
        } else if (config.rotationMode === 1) {
            globals.world.moveCameraY(globals.joystickR.deltaY / 30);
        }

        globals.world.drawCrossHair();

        Browser.setInfo(`${globals.points}`);

        globals.world.drawMap();
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
