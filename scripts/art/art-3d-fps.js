{
    const globals = {
        random: null,
        world: null,
        joystickL: null,
        joystickR: null,     
        rows: 0,
        columns: 0,   
        points: 0,
        life: 100,
    }

    const config = {
        randomize: true,
        enemiesSpeed: 10,
        secretPoints: 10,
        enemyDamage: 5,
        enemyPoints: 5,
        enemyCount: 40,
        buildingsCount: 80,
        rotationMode: 0,
    };    

    class FPSWorld extends OpenWorld {
        constructor(width, height, random, drawLine, drawPoint, drawFace) {
            super(width, height, random, drawLine, drawPoint, drawFace);
        }

        drawMap = () => {
            let mapSize = 100;
            let mapX = 10;
            let mapY = 30;

            this.figures.forEach(element => { 
                if (!element.solid) return;
                let rawX = Numbers.scale(element.center[0], -this.worldSize, this.worldSize, mapX, mapX + mapSize);
                let rawZ = Numbers.scale(element.center[2], -this.worldSize, this.worldSize, mapY, mapY + mapSize); 
                let x = Math.max(mapX, Math.min(mapX + mapSize, rawX));
                let z = Math.max(mapY, Math.min(mapY + mapSize, rawZ));
                Drawing.drawCircle(ctx, x, mapY + mapSize - (z - mapY), 2, element.isEnemy? 'rgba(255,0,0,0.5)': 'rgba(100,100,100,0.5)');
            });
            
            Drawing.drawRectangle(ctx, mapX, mapY, mapSize, mapSize, 'rgba(255,255,255,0.5)');  

            let rawX = Numbers.scale(this.cameraX, -this.worldSize, this.worldSize, mapX, mapX + mapSize);
            let rawZ = Numbers.scale(this.cameraZ, -this.worldSize, this.worldSize, mapY, mapY + mapSize);
            
            let xPlayer = Math.max(mapX, Math.min(mapX + mapSize, rawX));
            let zPlayer = Math.max(mapY, Math.min(mapY + mapSize, rawZ));
            
            Drawing.drawCircle(ctx, xPlayer, mapY + mapSize - (zPlayer - mapY), 3, 'rgba(255,0,0,0.5)');   

            let rawXSecret = Numbers.scale(globals.secretX, -this.worldSize, this.worldSize, mapX, mapX + mapSize);
            let rawZSecret = Numbers.scale(globals.secretZ, -this.worldSize, this.worldSize, mapY, mapY + mapSize);          
        
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

        drawCrossHair = () => {
            const size = 10;
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.width / 2 - size, this.height / 2);
            ctx.lineTo(this.width / 2 + size, this.height / 2);
            ctx.moveTo(this.width / 2, this.height / 2 - size);
            ctx.lineTo(this.width / 2, this.height / 2 + size);
            ctx.stroke();

            Drawing.drawCircle(ctx, this.width / 2, this.height / 2, size * 1.5, 'rgba(255,255,255,0.3)');
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

                    if (Trigonometry.isPointInPoly([this.width / 2, this.height / 2], screenPoints)) {
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
    }

    let addWalls = () => {
        let cubeSize = 40;
        for (let i = 1; i <=4; i++) {         
            let segmentSize = globals.world.worldSize / 20;
            let segments = globals.world.worldSize / segmentSize + 1;
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
                    case 1: wall.translateX(j*segmentSize); wall.translateZ(-globals.world.worldSize); break;
                    case 2: wall.translateX(globals.world.worldSize); wall.translateZ(j*segmentSize); break;
                    case 3: wall.translateX(j*segmentSize); wall.translateZ(globals.world.worldSize); break;
                    case 4: wall.translateX(-globals.world.worldSize); wall.translateZ(j*segmentSize); break;
                }

                wall.translateY(-300);

                wall.hue = globals.world.floorHue;

                wall.breakable = false;
                wall.infinite = false;
                wall.solid = true;
                wall.setupCollision();
                globals.world.figures.push(wall);   
            }           
        }
    }

    let addFloor = () => {

        for (let x = -globals.world.floorSize; x <= globals.world.floorSize; x += globals.world.tileSize) {
            for (let z = -globals.world.floorSize; z <= globals.world.floorSize; z += globals.world.tileSize) {
                let floorTile = new Character(globals.world);
                floorTile.vertices = Objects.clone(primitives[0].vertices);
                floorTile.faces = Objects.clone(primitives[0].faces);
                
                floorTile.scaleX(11); 
                floorTile.scaleZ(11); 
                floorTile.scaleY(0.1); 

                floorTile.translateX(x);
                floorTile.translateY(50); 
                floorTile.translateZ(z);
                
                floorTile.hue = globals.world.floorHue; 

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
            
            let posX = globals.world.random.nextInt(-globals.world.worldSize, globals.world.worldSize);
            let posZ = globals.world.random.nextInt(-globals.world.worldSize, globals.world.worldSize);
            
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

            let posX = globals.world.random.nextInt(-globals.world.worldSize, globals.world.worldSize);
            let posZ = globals.world.random.nextInt(-globals.world.worldSize, globals.world.worldSize);

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

        let posX = globals.world.random.nextInt(-globals.world.worldSize, globals.world.worldSize);
        let posZ = globals.world.random.nextInt(-globals.world.worldSize, globals.world.worldSize);

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
        globals.columns = Math.ceil((globals.world.floorSize * 2) / globals.world.tileSize);
        globals.rows = Math.ceil((globals.world.floorSize * 2) / globals.world.tileSize);

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

    let drawFace = (vertices, lightness, hue, alpha) => {
        const color = `hsla(${hue}, 100%, ${lightness}%, ${alpha})`;
        
        ctx.beginPath();
        let screenPoint = globals.world.worldToScreen(vertices[0]);
        ctx.moveTo(screenPoint[0], screenPoint[1]);
        
        for (let i = 1; i < vertices.length; i++) {
            screenPoint = globals.world.worldToScreen(vertices[i]);
            ctx.lineTo(screenPoint[0], screenPoint[1]);
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
    }

	window.clearCanvas = () => {		
        globals.world.figures = [];
	}

    init();
}
