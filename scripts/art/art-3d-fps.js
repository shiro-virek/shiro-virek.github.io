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
        floorSize: 4000,
        worldSize: 10000,
        floorHue: 0,
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

        fragmentFigure = (originalFig) => {
            const originalHue = originalFig.hue;
            const origin = originalFig.center; 

            originalFig.faces.forEach((faceIndices, index) => {
                let piece = new Figure();
                
                piece.vertices = faceIndices.map(vIdx => Objects.clone(originalFig.vertices[vIdx]));
                
                const newFaceIndices = [];
                for (let i = 0; i < faceIndices.length; i++) newFaceIndices.push(i);
                piece.faces = [newFaceIndices];

                piece.setupCollision();
                
                piece.isDebris = true;
                piece.hue = originalHue;
                piece.breakable = false;
                piece.fadeOutSpeed = 0.01 + (Math.random() * 0.02);

                let dirX = piece.center[0] - origin[0];
                let dirY = piece.center[1] - origin[1]; 
                let dirZ = piece.center[2] - origin[2];

                let mag = Math.sqrt(dirX*dirX + dirY*dirY + dirZ*dirZ);
                if (mag === 0) mag = 1; 

                let force = 15; 
                piece.vx = (dirX / mag) * force + (Math.random() * 4 - 2); 
                piece.vz = (dirZ / mag) * force + (Math.random() * 4 - 2);
                
                piece.vy = (Math.random() * -10 - 5); 

                this.figures.push(piece);
            });
        }

        drawHorizon = () => {
            let angleRad = Trigonometry.sexagesimalToRadian(this.cameraRotationX);
            let horizonY = halfHeight + (Math.tan(angleRad) * config.FOV);

            let skyGradient = ctx.createLinearGradient(0, 0, 0, horizonY);
            
            skyGradient.addColorStop(0, '#001a1a'); 
            skyGradient.addColorStop(0.5, '#004d4d'); 
            skyGradient.addColorStop(1, '#00ffff44'); 

            ctx.fillStyle = skyGradient;
            ctx.fillRect(0, 0, width, horizonY);

            let voidGradient = ctx.createLinearGradient(0, horizonY, 0, height);
            
            voidGradient.addColorStop(0, '#00ffff22'); 
            voidGradient.addColorStop(0.3, '#003333'); 
            voidGradient.addColorStop(1, '#000000');  

            ctx.fillStyle = voidGradient;
            ctx.fillRect(0, horizonY, width, height - horizonY);

            ctx.strokeStyle = `hsla(180, 100%, 50%, 0.15)`; 
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, horizonY);
            ctx.lineTo(width, horizonY);
            ctx.stroke();
        }

        drawMap = () => {
            let mapSize = 100;
            let mapX = 10;
            let mapY = 10;

            this.figures.forEach(element => { 
                if (!element.solid) return;
                let rawX = Numbers.scale(element.center[0], -config.worldSize, config.worldSize, mapX, mapX + mapSize);
                let rawZ = Numbers.scale(element.center[2], -config.worldSize, config.worldSize, mapY, mapY + mapSize); 
                let x = Math.max(mapX, Math.min(mapX + mapSize, rawX));
                let z = Math.max(mapY, Math.min(mapY + mapSize, rawZ));
                Drawing.drawCircle(ctx, x, mapY + mapSize - (z - mapY), 2, 'rgba(100,100,100,0.5)');
            });
            
            Drawing.drawRectangle(ctx, mapX, mapY, mapSize, mapSize, 'rgba(255,255,255,0.5)');  

            let rawX = Numbers.scale(this.cameraX, -config.worldSize, config.worldSize, mapX, mapX + mapSize);
            let rawZ = Numbers.scale(this.cameraZ, -config.worldSize, config.worldSize, mapY, mapY + mapSize);
            
            let xPlayer = Math.max(mapX, Math.min(mapX + mapSize, rawX));
            let zPlayer = Math.max(mapY, Math.min(mapY + mapSize, rawZ));
            
            Drawing.drawCircle(ctx, xPlayer, mapY + mapSize - (zPlayer - mapY), 3, 'rgba(255,0,0,0.5)');   

            let rawXSecret = Numbers.scale(globals.secretX, -config.worldSize, config.worldSize, mapX, mapX + mapSize);
            let rawZSecret = Numbers.scale(globals.secretZ, -config.worldSize, config.worldSize, mapY, mapY + mapSize);          
        
            let xSecret = Math.max(mapX, Math.min(mapX + mapSize, rawXSecret));
            let zSecret = Math.max(mapY, Math.min(mapY + mapSize, rawZSecret));
            
            Drawing.drawCircle(ctx, xSecret, mapY + mapSize - (zSecret - mapY), 3, 'rgba(0,255,0,0.5)');           
        } 

        drawCompass = () => {
            const compassSize = 30;
            const margin = 60;
            let compassX = width - margin - compassSize / 2;
            let compassY = margin;
            Drawing.drawCircle(ctx, compassX, compassY, compassSize, 'rgba(255,255,255,0.5)');
            Drawing.drawCircle(ctx, compassX, compassY, 2, 'rgba(255,255,255,0.5)');  

			let factor = 0.8;
            let fixX = -3;
            let fixY = 3;

			ctx.fillStyle = "#FF0000";
            let degrees = this.cameraRotationZ;
            let northX = fixX + compassX + Math.sin(Trigonometry.sexagesimalToRadian(degrees)) * compassSize * factor;
            let northY = fixY + compassY - Math.cos(Trigonometry.sexagesimalToRadian(degrees)) * compassSize * factor;
			ctx.fillText(`N`, northX, northY);	

			ctx.fillStyle = "#FFF";
            degrees += 90;
            northX = fixX + compassX + Math.sin(Trigonometry.sexagesimalToRadian(degrees)) * compassSize * factor;
            northY = fixY + compassY - Math.cos(Trigonometry.sexagesimalToRadian(degrees)) * compassSize * factor;
			ctx.fillText(`E`, northX, northY);
            
            degrees += 90;
            northX = fixX + compassX + Math.sin(Trigonometry.sexagesimalToRadian(degrees)) * compassSize * factor;
            northY = fixY + compassY - Math.cos(Trigonometry.sexagesimalToRadian(degrees)) * compassSize * factor;
			ctx.fillText(`S`, northX, northY);

            degrees += 90;
            northX = fixX + compassX + Math.sin(Trigonometry.sexagesimalToRadian(degrees)) * compassSize * factor;
            northY = fixY + compassY - Math.cos(Trigonometry.sexagesimalToRadian(degrees)) * compassSize * factor;
			ctx.fillText(`W`, northX, northY);
	
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
                            life: figure.isDebris ? figure.life : 1.0,
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
            const playerSize = 60; 

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
            if (this.cameraX < globals.floorCenterX - config.tileSize && this.cameraX > -config.worldSize + config.tileSize * 4) {
                globals.world.figures.filter(face => face.infinite).forEach(face => {    
                    face.translateX(-config.tileSize);          
                });

                globals.floorCenterX -= config.tileSize;
            }    
                        
            if (this.cameraX > globals.floorCenterX + config.tileSize && this.cameraX < config.worldSize - config.tileSize * 4) {
                globals.world.figures.filter(face => face.infinite).forEach(face => {    
                    face.translateX(config.tileSize);          
                });

                globals.floorCenterX += config.tileSize;
            }    

            if (this.cameraZ < globals.floorCenterZ - config.tileSize && this.cameraZ > -config.worldSize + config.tileSize * 4) {
                globals.world.figures.filter(face => face.infinite).forEach(face => {    
                    face.translateZ(-config.tileSize);          
                });

                globals.floorCenterZ -= config.tileSize;
            }    
                        
            if (this.cameraZ > globals.floorCenterZ + config.tileSize && this.cameraZ < config.worldSize - config.tileSize * 4) {
                globals.world.figures.filter(face => face.infinite).forEach(face => {    
                    face.translateZ(config.tileSize);          
                });

                globals.floorCenterZ += config.tileSize;
            }    
        }

        drawSingleFace = (face) => {
            const dist = face.viewZ;
            let fogAlpha = Numbers.scale(dist, 2000, 5000, 1, 0);
            if (fogAlpha < 0) fogAlpha = 0;

            let finalAlpha = fogAlpha * face.life;
            if (finalAlpha < 0) finalAlpha = 0;
            if (finalAlpha > 1) finalAlpha = 1;

            const color = `hsla(${face.hue}, 100%, ${face.lightness}%, ${finalAlpha.toFixed(2)})`;
            
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

            figure.solid = true;
            figure.breakable = true;

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

			Drawing.drawCircle(ctx, halfWidth, halfHeight, size * 1.5, 'rgba(255,255,255,0.3)');
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

                if (this.figures[targetFigure].secret) {
                    addSecretObject();
                }

                globals.world.shakeIntensity = 30;
                this.fragmentFigure(this.figures[targetFigure]);

                this.figures.splice(targetFigure, 1);
                globals.points += 1;
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
            this.isDebris = false;
            this.life = 1.0;
            this.vx = 0; 
            this.vy = 0;
            this.vz = 0; 
            this.gravity = 0.5; 
            this.fadeOutSpeed = 0;
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
        let cubeSize = 40;
        for (let i = 1; i <=4; i++) {         
            let segmentSize = config.worldSize / 20;
            let segments = config.worldSize / segmentSize + 1;
            for (let j = -segments; j < segments; j++) {
                let wall = new Figure();
                wall.vertices = Objects.clone(figureTypes[0].vertices);
                wall.faces = Objects.clone(figureTypes[0].faces);            

                wall.scaleX(segmentSize / cubeSize);
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

                wall.hue = config.floorHue;

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
                
                floorTile.scaleX(11); 
                floorTile.scaleZ(11); 
                floorTile.scaleY(0.1); 

                floorTile.translateX(x);
                floorTile.translateY(50); 
                floorTile.translateZ(z);
                
                floorTile.hue = config.floorHue; 

                floorTile.breakable = false;
                floorTile.infinite = true;
                floorTile.solid = false;
                floorTile.setupCollision();
                globals.world.figures.push(floorTile);
            }
        }
    }   

    let addBuildings = () => {

        for (let i = 0; i < 50; i++) {
            let building = new Figure();
            building.vertices = Objects.clone(figureTypes[0].vertices);
            building.faces = Objects.clone(figureTypes[0].faces);
            
            let h = globals.random.nextInt(5, 15);
            building.scaleY(h); 
            building.scaleX(2);
            building.scaleZ(2);
            
            let posX = globals.random.nextInt(-config.worldSize, config.worldSize);
            let posZ = globals.random.nextInt(-config.worldSize, config.worldSize);
            
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

        globals.world.drawHorizon();

        for (let i = globals.world.figures.length - 1; i >= 0; i--) {
            let fig = globals.world.figures[i];
            
            if (fig.isDebris) {
                fig.vy += fig.gravity;
                fig.translateX(fig.vx);
                fig.translateY(fig.vy);
                fig.translateZ(fig.vz);

                fig.life -= fig.fadeOutSpeed;

                if (fig.life <= 0) {
                    globals.world.figures.splice(i, 1);
                    continue;
                }

                if (fig.center[1] > 50) {
                    fig.translateY(50 - fig.center[1]);
                    fig.vy *= -0.5; 
                    fig.vx *= 0.8; 
                    fig.vz *= 0.8;
                }
            }
        }
        globals.world.draw();

        const forwardSpeed = -globals.joystickL.deltaY / 10; 
        const sideSpeed = -globals.joystickL.deltaX / 10;
        
        let angleRad = Trigonometry.sexagesimalToRadian(globals.world.cameraRotationZ);
        let angleRadR = Trigonometry.sexagesimalToRadian(globals.world.cameraRotationZ + 90);

        let dx = (-Math.sin(angleRad) * forwardSpeed) + (-Math.sin(angleRadR) * sideSpeed);
        let dz = (Math.cos(angleRad) * forwardSpeed) + (Math.cos(angleRadR) * sideSpeed);

        if (Math.abs(forwardSpeed) > 0.1 || Math.abs(sideSpeed) > 0.1) {
            
            if (!globals.world.checkWallCollision(globals.world.cameraX + dx, globals.world.cameraZ)) {
                globals.world.cameraX += dx;
            } else {
                Sound.hit(); 
            }

            if (!globals.world.checkWallCollision(globals.world.cameraX, globals.world.cameraZ + dz)) {
                globals.world.cameraZ += dz;
            } else {
                Sound.hit();
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
        globals.world.drawCompass();
    }

    let randomize = () => {      
        config.floorHue = globals.random.nextInt(1, 360);  
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
