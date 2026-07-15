{
    const globals = {
		random: null,
        ledScreen: null,
        canvasImg: document.getElementById('auxCanvas'),
        ctxImg: null,
        img: new Image(),
        imgData: null,
        world: null,
    };

    const config = { 
        randomize: true,
        ledRows: 50,
        ledColumns: 50,
        ledMargin: 30,
        ledPadding: 30,
        ledDiameter: 20,
        hue: 150,
        alternatePixel: false,
        FOV: 800,
    };
    
    const cube = {
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
        };

    const Figures = Object.freeze({
		Circle: Symbol("circle"),
    });
    class LedScreen {
        constructor() {
            this.leds = [];       
            this.generateLeds();          
			let rand = globals.random.nextInt(0, Object.keys(Figures).length - 1);  
			this.shape = Figures[Object.keys(Figures)[rand]];
        }

        clear = () => {
            for (let x = 0; x <= config.ledColumns; x++) {
                for (let y = 0; y <= config.ledRows; y++) {
                    this.leds[x][y].on = false;
                }
            }
        }

        generateLeds = () => {
            for (let x = 0; x <= config.ledColumns; x++) {
                this.leds[x] = new Array(config.ledRows);
            }

            for (let x = 0; x <= config.ledColumns; x++) {
                for (let y = 0; y <= config.ledRows; y++) {
                    let led = new Led(x, y);
                    this.leds[x][y] = led;
                }
            }
        }

        setPixel = (col, row) => {           
            if (col > config.ledColumns - 1 || row > config.ledRows - 1 || col < 0 || row < 0) return;
            this.leds[col][row].on = true;
        }

        draw = (ctx) => {
            for (let x = 0; x <= config.ledColumns; x++) {
                for (let y = 0; y <= config.ledRows; y++) {
                    this.leds[x][y].draw(ctx);
                }
            }
        }

        update = () => {                           
        }

        drawLine = (x1, y1, x2, y2) => {
            let points = Trigonometry.bresenhamLine(Math.floor(x1), Math.floor(y1), Math.floor(x2), Math.floor(y2));
            for (const p of points) {
                this.setPixel(p.x , p.y);
            }
        }
    }

    class Led {
        constructor(column, row) {
            this.diameter = config.ledDiameter;
            this.radius = config.ledDiameter / 2;
            this.row = row;
            this.column = column;
            this.x = config.ledMargin + column * config.ledPadding + column * this.diameter;
            this.y = config.ledMargin + row * config.ledPadding + row * this.diameter;            
            if (config.alternatePixel)
                this.y = this.column % 2 == 0 ? this.y : this.y + this.radius;
            this.on = false;
        }

        draw = (ctx) => {
            if (this.on){
                Drawing.drawCircle(ctx, this.x + this.radius, this.y + this.radius, this.radius * 2, `hsla(${config.hue}, 100%, 50%, 0.05)`)
                Drawing.drawCircle(ctx, this.x + this.radius, this.y + this.radius, this.radius, `hsla(${config.hue}, 100%, 50%, 0.8)`)
                Drawing.drawCircle(ctx, this.x + this.radius, this.y + this.radius, this.radius / 2, `hsla(${config.hue}, 100%, 90%, 1.0)`)
            }else{ 
                Drawing.drawCircle(ctx, this.x + this.radius, this.y + this.radius, this.radius, `hsla(${config.hue}, 0%, 50%, 0.5)`)
                Drawing.drawCircle(ctx, this.x + this.radius, this.y + this.radius, this.radius / 2, `hsla(${config.hue}, 0%, 50%, 1.0)`)
            }
        }
    }




    class ThreeDWorld {
        constructor() {
            this.figures = [];
            this.cameraRotationX = 0; 
            this.cameraRotationZ = 0;
            this.cameraZ = 1000;
        }

        draw = () => {
            this.drawFigures();
        }

        worldToScreen = (point) => {
            const rotatedPoint = this.applyCameraRotation(point); 
            
            const x = rotatedPoint[0];
            const y = rotatedPoint[1];
            const z = rotatedPoint[2];

            let depth = z + this.cameraZ;
            if (depth < 1) depth = 1; 

            const scaleFactor = config.FOV / depth;
            
            const projectedX = (x * scaleFactor) + config.ledColumns / 2;
            const projectedY = (y * scaleFactor) + config.ledRows / 2;
            
            return [projectedX, projectedY];    
        }

        drawFigures = () => {
            for (let i = this.figures.length - 1; i >= 0; i--) {
                this.figures[i].drawFigure(ctx);
            }
        }

        addFigure(x, y) {
            let centeredX = x - config.ledColumns / 2;
            let centeredY = y - config.ledRows / 2;

            let figure = new Figure();

            figure.vertices = Objects.clone(cube.vertices);
            figure.edges = Objects.clone(cube.edges);

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

        drawEdge = (p0, p1, color) => {
            let point2d0 = globals.world.worldToScreen(p0);
            let point2d1 = globals.world.worldToScreen(p1);

            globals.ledScreen.drawLine(point2d0[0], point2d0[1], point2d1[0], point2d1[1]);
        }

        drawFigure = () => {
            for (let i = this.edges.length - 1; i >= 0; i--) {
                this.drawEdge(this.vertices[this.edges[i][0]], this.vertices[this.edges[i][1]]);
            }
        }
    }





    let loadImage = (source = '../assets/Picture1.jpg') => {
        globals.img.src = source;

        globals.img.onload = function () {
            globals.canvasImg.width = config.ledColumns;
            globals.canvasImg.height = config.ledRows;

            const { newImgHeight, newImgWidth, newOriginX, newOriginY } = Screen.adaptImageToScreen(globals.img, globals.canvasImg);
            
            globals.ctxImg.drawImage(globals.img, newOriginX, newOriginY, newImgWidth, newImgHeight);

            globals.imgData = globals.ctxImg.getImageData(0, 0, config.ledColumns, config.ledRows).data;

            for (let y = 0; y < config.ledRows; y++) {
                for (let x = 0; x < config.ledColumns; x++) {
                    let i = y * config.ledColumns + x;
                    const r = globals.imgData[i * 4 + 0];
                    const g = globals.imgData[i * 4 + 1];
                    const b = globals.imgData[i * 4 + 2];
                    const a = globals.imgData[i * 4 + 3];

                    let lightness = Color.getLightness = (r, g, b);
                    globals.ledScreen.leds[x][y].on = lightness > 120;
                }
            }
        };
    }

    let init = () => {
        initCanvas();
        globals.ctxImg = globals.canvasImg.getContext("2d", { willReadFrequently: true });
		globals.random = Objects.getRandomObject(); 
        config.ledDiameter = globals.random.nextInt(5, 20);        
        config.ledPadding = globals.random.nextInt(0, 20);
        config.ledMargin = config.ledPadding;       
        if (config.randomize) randomize();
        config.ledRows = Math.floor((height - config.ledMargin)/ (config.ledDiameter + config.ledPadding));
        config.ledColumns = Math.floor((width - config.ledMargin)/ (config.ledDiameter + config.ledPadding));
        globals.ledScreen = new LedScreen();
        
        addEvents();
        window.requestAnimationFrame(loop)

        globals.world = new ThreeDWorld();
        globals.world.addFigure(0, 0);
        globals.world.figures[0].scaleX(0.4);
        globals.world.figures[0].scaleY(0.4);
        globals.world.figures[0].scaleZ(0.4);
    }

    let addEvents = () => {        
    }

    let randomize = () => {               
        config.hue = globals.random.nextInt(0, 255);    
        config.alternatePixel = globals.random.nextBool();
    }

    window.trackMouse = (xMouse, yMouse) => {
        if (clicking){            
            let x1 = Numbers.scale(lastPosX, 0, width, 0, config.ledColumns);
            let y1 = Numbers.scale(lastPosY, 0, height, 0, config.ledRows);
            let x2 = Numbers.scale(xMouse, 0, width, 0, config.ledColumns);
            let y2 = Numbers.scale(yMouse, 0, height, 0, config.ledRows);
            globals.ledScreen.drawLine(x1, y1, x2, y2);
        }    
    }

    window.draw = (delta) => {
        globals.ledScreen.update();
        drawBackground(ctx, canvas);   
        globals.ledScreen.clear();
        if (globals.world.figures.length > 0)  {
            globals.world.figures[0].rotateY(1 * delta / FRAME_TIME);
            globals.world.figures[0].rotateZ(1 * delta / FRAME_TIME);
        }  
        globals.world.draw();
        globals.ledScreen.draw(ctx);
    }

	window.clearCanvas = () => {		
        globals.ledScreen.generateLeds();  
	}

    init();
}
