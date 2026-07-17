{
    const globals = {
        random: null,
        world: null,
        joystickL: null,
        joystickR: null,     
        rows: 0,
        columns: 0,   
        floorCenterX: 0,
        floorCenterZ: 0,
        points: 0,
        life: 100,
    }

    const config = {
        randomize: true,
        tileSize: 500,
        floorSize: 4000,
        worldSize: 10000,
        floorHue: 0,
        enemiesSpeed: 10,
        secretPoints: 10,
		enemyDamage: 5,
		enemyPoints: 5,
		enemyCount: 40,
		buildingsCount: 80,
    };    

    class FPSWorld extends ThreeDWorld {
        constructor(width, height, random, drawLine, drawPoint, drawFace) {
            super(width, height, random, drawLine, drawPoint, drawFace);

            this.cameraMode = 1;

            this.cameraX = 0;
            this.cameraY = -200; 
            this.cameraZ = 0;

            this.cameraRotationX = 5;
            this.cameraRotationZ = 0;

            this.drawFigureFaces = true;
            this.drawFigureEdges = false;
            this.drawFigureVertices = false;

        }

        fragmentFigure = (originalFig) => {
            const originalHue = originalFig.hue;
            const origin = originalFig.center; 

            originalFig.faces.forEach((faceIndices, index) => {
                let piece = new Character(this);
                
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
            let horizonY = this.width / 2 + (Math.tan(angleRad) * this.FOV);

            let skyGradient = ctx.createLinearGradient(0, 0, 0, horizonY);
            
            skyGradient.addColorStop(0, `hsl(${config.skyShift}, 100%, 5%)`); 
            skyGradient.addColorStop(0.5, `hsl(${config.skyShift}, 100%, 20%)`); 
            skyGradient.addColorStop(1, `hsl(${config.skyShift}, 100%, 60%)`); 

            ctx.fillStyle = skyGradient;
            ctx.fillRect(0, 0, width, horizonY);

            let voidGradient = ctx.createLinearGradient(0, horizonY, 0, height);
            
            voidGradient.addColorStop(0, `hsla(${config.skyShift}, 100%, 50%, 0.13)`); 
            voidGradient.addColorStop(0.3, `hsla(${config.skyShift}, 100%, 50%, 0.2)`); 
            voidGradient.addColorStop(1, `hsla(${config.skyShift}, 100%, 50%, 0.4)`);  

            ctx.fillStyle = voidGradient;
            ctx.fillRect(0, horizonY, width, height - horizonY);

            ctx.strokeStyle = `hsla(${config.skyShift}, 100%, 50%, 0.15)`; 
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, horizonY);
            ctx.lineTo(width, horizonY);
            ctx.stroke();
        }

        drawMap = () => {
            let mapSize = 100;
            let mapX = 10;
            let mapY = 30;

            this.figures.forEach(element => { 
                if (!element.solid) return;
                let rawX = Numbers.scale(element.center[0], -config.worldSize, config.worldSize, mapX, mapX + mapSize);
                let rawZ = Numbers.scale(element.center[2], -config.worldSize, config.worldSize, mapY, mapY + mapSize); 
                let x = Math.max(mapX, Math.min(mapX + mapSize, rawX));
                let z = Math.max(mapY, Math.min(mapY + mapSize, rawZ));
                Drawing.drawCircle(ctx, x, mapY + mapSize - (z - mapY), 2, element.isEnemy? 'rgba(255,0,0,0.5)': 'rgba(100,100,100,0.5)');
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
            super.draw();

            this.translateInfiniteFloor();
        }

        checkCollisionObject = (nextX, nextZ) => {
            const playerSize = 60; 

            for (let fig of this.figures.filter(f => !f.isEnemy)) {
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

        checkCollisionEnemy = (nextX, nextZ) => {
            const playerSize = 60; 

            for (let fig of this.figures.filter(f => f.isEnemy)) {
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
            if (this.cameraX < globals.floorCenterX - config.tileSize && this.cameraX > -config.worldSize + config.tileSize * (config.floorSize / 1000 * 2)) {
                globals.world.figures.filter(face => face.infinite).forEach(face => {    
                    face.translateX(-config.tileSize);          
                });

                globals.floorCenterX -= config.tileSize;
            }    
                        
            if (this.cameraX > globals.floorCenterX + config.tileSize && this.cameraX < config.worldSize - config.tileSize * (config.floorSize / 1000 * 2)) {
                globals.world.figures.filter(face => face.infinite).forEach(face => {    
                    face.translateX(config.tileSize);          
                });

                globals.floorCenterX += config.tileSize;
            }    

            if (this.cameraZ < globals.floorCenterZ - config.tileSize && this.cameraZ > -config.worldSize + config.tileSize * (config.floorSize / 1000 * 2)) {
                globals.world.figures.filter(face => face.infinite).forEach(face => {    
                    face.translateZ(-config.tileSize);          
                });

                globals.floorCenterZ -= config.tileSize;
            }    
                        
            if (this.cameraZ > globals.floorCenterZ + config.tileSize && this.cameraZ < config.worldSize - config.tileSize * (config.floorSize / 1000 * 2)) {
                globals.world.figures.filter(face => face.infinite).forEach(face => {    
                    face.translateZ(config.tileSize);          
                });

                globals.floorCenterZ += config.tileSize;
            }    
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

        addFigure = (screenX, screenY, fig = this.primitive) => {
            const spawnDistance = 500; 

            let centeredX = screenX - this.width / 2;
            let centeredY = screenY - this.height / 2;

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

            let figure = new Character(this);
            figure.vertices = Objects.clone(fig.vertices);
            figure.faces = Objects.clone(fig.faces);

            figure.translateX(worldX);
            figure.translateY(worldY);
            figure.translateZ(worldZ); 

            figure.cachedZ = figure.getAverageZ();

            figure.solid = true;
            figure.breakable = false;
            figure.setupCollision();
			
            this.figures.push(figure);
        }
        
        drawCrossHair = () => {
            const size = 10;
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(halfWidth - size, this.width / 2);
            ctx.lineTo(halfWidth + size, this.height / 2);
            ctx.moveTo(halfWidth, this.width / 2 - size);
            ctx.lineTo(halfWidth, this.height / 2 + size);
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
                    globals.points += config.secretPoints;
                    addSecretObject();
                }else{
					if (this.figures[targetFigure].isEnemy) 
                    	globals.points += config.enemyPoints
					else
						globals.points += 1;
				}

                globals.world.shakeIntensity = 30;
                this.fragmentFigure(this.figures[targetFigure]);

                this.figures.splice(targetFigure, 1);
            
            }
        }
    }

    class Character extends Figure {
        constructor(world) {
            super(world);
            this.solid = false;
            this.infinite = false;
            this.breakable = false;
            this.secret = false;
            this.isDebris = false;
            this.isEnemy = false;
            this.life = 1.0;
            this.vx = 0; 
            this.vy = 0;
            this.vz = 0; 
            this.gravity = 0.5; 
            this.fadeOutSpeed = 0;
            this.rotationAngle = 0;
            this.setupCollision();
        }

        moveAuto(distance) {
            this.translateX(Math.cos(this.rotationAngle) * distance);
            this.translateZ(Math.sin(this.rotationAngle) * distance);
            this.setupCollision();
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
    }

    let addWalls = () => {
        let cubeSize = 40;
        for (let i = 1; i <=4; i++) {         
            let segmentSize = config.worldSize / 20;
            let segments = config.worldSize / segmentSize + 1;
            for (let j = -segments; j < segments; j++) {
                let wall = new Character(globals.world);
                wall.vertices = Objects.clone(primitives[0].vertices);
                wall.faces = Objects.clone(primitives[0].faces);            

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
                let floorTile = new Character(globals.world);
                floorTile.vertices = Objects.clone(primitives[0].vertices);
                floorTile.faces = Objects.clone(primitives[0].faces);
                
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

        for (let i = 0; i < config.buildingsCount; i++) {
            let building = new Character(globals.world);
            building.vertices = Objects.clone(primitives[0].vertices);
            building.faces = Objects.clone(primitives[0].faces);
            
            let h = globals.world.random.nextInt(5, 15);
            building.scaleY(h); 
            building.scaleX(2);
            building.scaleZ(2);
            
            let posX = globals.world.random.nextInt(-config.worldSize, config.worldSize);
            let posZ = globals.world.random.nextInt(-config.worldSize, config.worldSize);
            
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

    let addEnemies = () => {
        for (let i = 0; i < config.enemyCount; i++) {
            let enemy = new Character(globals.world);
            enemy.vertices = Objects.clone(primitives[1].vertices); 
            enemy.faces = Objects.clone(primitives[1].faces);

            let posX = globals.world.random.nextInt(-config.worldSize, config.worldSize);
            let posZ = globals.world.random.nextInt(-config.worldSize, config.worldSize);

            enemy.scale(5);
            enemy.translateX(posX);
            enemy.translateY(50 - 20*5); 
            enemy.translateZ(posZ);        
            
            enemy.hue = 0; 

            enemy.breakable = true;
            enemy.infinite = false;
            enemy.solid = true;
            enemy.isEnemy = true;
            enemy.setupCollision();
            globals.world.figures.push(enemy);
        }
    }

    let addPyramids = () => {
        for (let i = 0; i < 10; i++) {
            let pyramid = new Character(globals.world);
            pyramid.vertices = Objects.clone(primitives[2].vertices); 
            pyramid.faces = Objects.clone(primitives[2].faces);

            pyramid.rotateX(180);
            pyramid.scale(8); 

            let posX = globals.world.random.nextInt(-2000, 2000);
            let posZ = globals.world.random.nextInt(-2000, 2000);

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
        let pyramid = new Character(globals.world);
        pyramid.vertices = Objects.clone(primitives[2].vertices); 
        pyramid.faces = Objects.clone(primitives[2].faces);

        pyramid.rotateX(180);
        pyramid.scale(8); 

        let posX = globals.world.random.nextInt(-config.worldSize, config.worldSize);
        let posZ = globals.world.random.nextInt(-config.worldSize, config.worldSize);

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
        addEnemies();
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

        Browser.addButton("btnShoot", "🔫", shoot, -10, 80, 60, 60);

        globals.joystickL = new Joystick(100, height - 100);
        globals.joystickL.add();

        globals.joystickR = new Joystick(width - 100, height - 100);
        globals.joystickR.add();
    }

    let init = () => {	
        globals.random = Objects.getRandomObject();
        if (config.randomize) randomize();
        initCanvas();
        globals.world = new FPSWorld(width, height, globals.random, Drawing.drawLine, Drawing.drawDot, drawFace);
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

    let updateObjects = (delta) => {
        for (let i = globals.world.figures.length - 1; i >= 0; i--) {
            let fig = globals.world.figures[i];            
            let factor = delta / FRAME_TIME;

            if (fig.isEnemy) {
                fig.rotationAngle += (globals.world.random.nextBool()? 0.1 : -0.1) * factor;
                fig.moveAuto(config.enemiesSpeed * factor);    

                if ((fig.center[0] <= -config.worldSize)
                    || (fig.center[0] >= config.worldSize)
                    || (fig.center[2] <= -config.worldSize)
                    || (fig.center[2] >= config.worldSize)) {
                    fig.rotationAngle += 3.14 * factor;
                }
            }

            if (fig.isDebris) {
                fig.vy += fig.gravity * factor;
                fig.translateX(fig.vx * factor);
                fig.translateY(fig.vy * factor);
                fig.translateZ(fig.vz * factor);

                fig.life -= fig.fadeOutSpeed * factor;

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
    }

    let moveCharacter = (delta) => {
        let factor = delta / FRAME_TIME;
        const forwardSpeed = -globals.joystickL.deltaY / 5; 
        const sideSpeed = -globals.joystickL.deltaX / 5;
        
        let angleRad = Trigonometry.sexagesimalToRadian(globals.world.cameraRotationZ);
        let angleRadR = Trigonometry.sexagesimalToRadian(globals.world.cameraRotationZ + 90);

        let dx = ((-Math.sin(angleRad) * forwardSpeed) + (-Math.sin(angleRadR) * sideSpeed)) * factor;
        let dz = ((Math.cos(angleRad) * forwardSpeed) + (Math.cos(angleRadR) * sideSpeed)) * factor;

        if (globals.world.checkCollisionEnemy(globals.world.cameraX + dx, globals.world.cameraZ + dz)) {
            globals.life -= config.enemyDamage;
            globals.world.cameraZ -= 100 * Math.cos(angleRad);
            globals.world.cameraX += 100 * Math.sin(angleRad);
            Sound.error();
        }else{                
            if (Math.abs(forwardSpeed) > 0.1 || Math.abs(sideSpeed) > 0.1) {            
                if (!globals.world.checkCollisionObject(globals.world.cameraX + dx, globals.world.cameraZ)) {
                    globals.world.cameraX += dx;
                } else {
                    Sound.hit(); 
                }

                if (!globals.world.checkCollisionObject(globals.world.cameraX, globals.world.cameraZ + dz)) {
                    globals.world.cameraZ += dz;
                } else {
                    Sound.hit();
                }
            }
        }
    }

    let moveCamera = (delta) => {
        let factor = delta / FRAME_TIME;
        if (config.rotationMode === 0) {
            globals.world.rotate(-globals.joystickR.deltaY / 100 * factor, -globals.joystickR.deltaX / 100 * factor);
        } else if (config.rotationMode === 1) {
            globals.world.moveCameraY(globals.joystickR.deltaY / 30 * factor);
        }
    }

    let checkPoints = () => {
        if (globals.life <= 0) {
            Browser.setInfo(`Game Over!`);   
			globals.world.figures = [];
        }else if (globals.points >= 50) {
            Browser.setInfo(`You Win!`);
			globals.world.figures = [];
        }
    }

    window.trackMouse = (x, y) => {
        if (clicking) {
        }
    }

    let drawFace = (vertices, lightness, hue) => {
        for (let i = 0; i < vertices.length; i++) {
                const viewPoint = globals.world.applyCameraTransform(this.vertices[i]);
                if (viewPoint[2] < 10) return; 
        }
        
        const distPoint = globals.world.applyCameraTransform(this.vertices[0]);
        const distance = distPoint[2];
        
        let alpha = Numbers.scale(distance, 2000, 5000, 1, 0);
        if (alpha < 0) alpha = 0;
        if (alpha > 1) alpha = 1;

        let color = `hsla(${this.hue}, 100%, ${lightness}%, ${alpha})`;
        
        ctx.beginPath();
        let vertex = globals.world.worldToScreen(this.vertices[0]);
        ctx.moveTo(vertex[0], vertex[1]);
        
        for (let i = 1; i < indices.length; i++) {
            vertex = globals.world.worldToScreen(this.vertices[i]);
            ctx.lineTo(vertex[0], vertex[1]);
        }
        ctx.closePath();
        
        ctx.fillStyle = color;
        ctx.strokeStyle = color; 
        ctx.lineWidth = 1;    
        ctx.fill();
        ctx.stroke();
    }

    window.draw = (delta) => {
        drawBackground(ctx, canvas);

        globals.world.drawHorizon();
        updateObjects(delta);
        globals.world.draw();
        moveCharacter(delta);
        moveCamera(delta);

        globals.world.drawCrossHair();
        Browser.setInfo(`Life ${globals.life}% ${globals.points} pts.`);
        globals.world.drawMap();
        globals.world.drawCompass();

        checkPoints();
    }

    let randomize = () => {      
        config.floorHue = globals.random.nextInt(1, 360);  
        config.skyShift = globals.random.nextInt(0, 360);
    }

	window.clearCanvas = () => {		
        globals.world.figures = [];
	}

    init();
}
