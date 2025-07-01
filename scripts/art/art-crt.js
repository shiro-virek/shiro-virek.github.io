
{    
    const globals = {
        random: null,
        canvasImg: document.getElementById('auxCanvas'),
        ctxImg: null,
        imgData: null,
        img: new Image()
    };

    const config = {
        randomize: true,
        noiseMax: 10,
        crtRows: 0,
        crtColumns: 0,
        crtDiameter: 0,
        crtScreen: null,
        offsetX: 0,
        offsetY: 0,
    }
    
    class CrtScreen {
        constructor() {
            this.crts = [];
            this.generateCrts();
            this.status = 0;
            this.noiseTime = 0;
        }

        turnOn = () => {
            if (this.status == 0) {
                
                this.status = 1;
                Sound.whiteNoise(globals.random);
            }
        }

        generateCrts = () => {
            for (let x = 0; x < config.crtColumns; x++) {
                this.crts[x] = new Array(config.crtRows);
            }

            for (let x = 0; x < config.crtColumns; x++) {
                for (let y = 0; y < config.crtRows; y++) {
                    let crt = new Crt(x, y);
                    this.crts[x][y] = crt;
                }
            }
        }

        draw = (ctx) => {   
            if (this.status == 2) {                
                for (let y = 0; y < config.crtRows; y++) {
                    for (let x = 0; x < config.crtColumns; x++) {
                        let i = y * config.crtColumns + x;
                        const r = globals.imgData[i * 4 + 0];
                        const g = globals.imgData[i * 4 + 1];
                        const b = globals.imgData[i * 4 + 2];
                        const a = globals.imgData[i * 4 + 3];

                        let newR = Numbers.scale(r, 0, 255, 20, 70);
                        let newG = Numbers.scale(g, 0, 255, 20, 70);
                        let newB = Numbers.scale(b, 0, 255, 20, 70);

                        this.crts[x][y].draw(ctx, newR, newG, newB);
                    }
                }
            }

            if (this.status == 1) {      
                for (let y = 0; y < config.crtRows; y++) {
                    for (let x = 0; x < config.crtColumns; x++) {
                        let value = globals.random.nextBool() ? 255 : 0;

                        this.crts[x][y].draw(ctx, value, value, value);
                    }
                }
            }
        }

        update = () => {
            if (this.status == 1){
                this.noiseTime++;

                if (this.noiseTime > config.noiseMax){
                    this.status = 2;
                    Sound.stopAllSounds();
                }
            }                
        }
    }

    class Crt {
        constructor(column, row) {
            this.diameter = config.crtDiameter;
            this.row = row;
            this.column = column;
            this.r = 0;
            this.g = 0;
            this.b = 0;
            this.x = config.offsetX + column * this.diameter;
            this.y = config.offsetY + row * this.diameter;
        }

        draw = (ctx, lightnessR, lightnessG, lightnessB) => {
            let borderColor = '#000';
            let third = this.diameter / 3;

            let colorR = `hsl(${0}, 100%, ${lightnessR}%)`;
            let colorG = `hsl(${120}, 100%, ${lightnessG}%)`;
            let colorB = `hsl(${255}, 100%, ${lightnessB}%)`;
            Drawing.drawRectangle(ctx, this.x, this.y, third, this.diameter, borderColor, colorR)
            Drawing.drawRectangle(ctx, this.x + third, this.y, third, this.diameter, borderColor, colorG)
            Drawing.drawRectangle(ctx, this.x + third * 2, this.y, third, this.diameter, borderColor, colorB)
        }
    }

    let loadImage = (source = '../assets/Picture1.jpg', status = 0) => {
        globals.canvasImg.width = config.crtColumns;
        globals.canvasImg.height = config.crtRows;

        globals.img.src = source;

        globals.img.onload = function () {
            globals.canvasImg.width = config.crtColumns;
            globals.canvasImg.height = config.crtRows;

            const { newImgHeight, newImgWidth, newOriginX, newOriginY } = Screen.adaptImageToScreen(globals.img, globals.canvasImg);
            
            globals.ctxImg.drawImage(globals.img, newOriginX, newOriginY, newImgWidth, newImgHeight);

            globals.imgData = globals.ctxImg.getImageData(0, 0, config.crtColumns, config.crtRows).data;

            config.crtScreen = new CrtScreen();       
            config.crtScreen.status = status;     
            addEvents();
            window.requestAnimationFrame(loop);
        };
    }

    let init = () => {
        initCanvas(); 

        globals.ctxImg = globals.canvasImg.getContext("2d", { willReadFrequently: true });

        if (config.randomize) randomize();

        globals.canvasImg.width = canvas.width;
        globals.canvasImg.height = canvas.height;   

        globals.random = Objects.getRandomObject();
        globals.canvasImg = document.getElementById('auxCanvas');
        globals.ctxImg = globals.canvasImg.getContext("2d");

        const minDiameter = Utils.isMobile() ? 12 : 4;
        config.crtDiameter = Math.floor(canvas.width / globals.random.nextInt(30, 100));
        config.crtDiameter = Math.max(config.crtDiameter, minDiameter);

        config.crtColumns = Math.floor(canvas.width / config.crtDiameter);
        config.crtRows = Math.floor(canvas.height / config.crtDiameter);   

        let totalWidth = config.crtColumns * config.crtDiameter;
        let totalHeight = config.crtRows * config.crtDiameter;

        config.offsetX = (canvas.width - totalWidth) / 2;
        config.offsetY = (canvas.height - totalHeight) / 2;

        loadImage();
    }

    let addEvents = () => {
        canvas.addEventListener('click', e => {
            config.crtScreen.turnOn();
        }, false);

        window.addEventListener('resize', () => {
            init(); 
        });
    }

    let randomize = () => {
    
    }

    window.draw = () => {
        config.crtScreen.update();
        drawBackground(ctx, canvas);
        config.crtScreen.draw(ctx);
    }
    
    window.trackMouse = (xMouse, yMouse) => {
    }

    window.clearCanvas = () => {
		Sound.error();
    }

	window.magic = () => {  
		Sound.error();
	}

    window.upload = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            if (!file.type.match('image.*')) {
                alert('Please select an image file');
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = function(event) {                    
                globals.img.onerror = function() {
                    alert('Error loading image');
                };
            
                loadImage(event.target.result, 1);
            };
            
            reader.onerror = function() {
                alert('Error reading file');
            };
            
            reader.readAsDataURL(file);
        }
    }

    init();
}
