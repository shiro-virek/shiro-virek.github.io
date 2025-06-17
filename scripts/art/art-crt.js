
{    
    const globals = {
        random: null
    };
    
    let crtRows = 0
    let crtColumns = 0;
    let crtDiameter = 0;
    let crtScreen;
    
    let canvasImg = document.getElementById('auxCanvas');
    let ctxImg = canvasImg.getContext("2d");
    let imgData;

    const img = new Image();
    
    class CrtScreen {
        constructor() {
            this.crts = [];
            this.generateCrts();
            this.on = false;
        }

        turnOn = () => {
            if (!this.on) {
                
                this.on = true;
                Sound.whiteNoise();
            }
        }

        generateCrts = () => {
            for (let x = 0; x < crtColumns; x++) {
                this.crts[x] = new Array(crtRows);
            }

            for (let x = 0; x < crtColumns; x++) {
                for (let y = 0; y < crtRows; y++) {
                    let crt = new Crt(x, y);
                    this.crts[x][y] = crt;
                }
            }
        }

        setPixel = (x, y) => {
            let col = Math.round(x / crtDiameter);
            let row = Math.round(y / crtDiameter);
        }

        draw = (ctx) => {   
            if (this.on) {                
                for (let y = 0; y < crtRows; y++) {
                    for (let x = 0; x < crtColumns; x++) {
                        let i = y * crtColumns + x;
                        const r = imgData[i * 4 + 0];
                        const g = imgData[i * 4 + 1];
                        const b = imgData[i * 4 + 2];
                        const a = imgData[i * 4 + 3];

                        let newR = Numbers.scale(r, 0, 255, 0, 50);
                        let newG = Numbers.scale(g, 0, 255, 0, 50);
                        let newB = Numbers.scale(b, 0, 255, 0, 50);

                        this.crts[x][y].draw(ctx, newR, newG, newB);
                    }
                }
            }
        }

        update = () => {
        }
    }

    class Crt {
        constructor(column, row) {
            this.diameter = crtDiameter;
            this.row = row;
            this.column = column;
            this.r = 0;
            this.g = 0;
            this.b = 0;
            this.x = column + column * this.diameter;
            this.y = row + row * this.diameter;
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

    let loadImage = (source = '../assets/Picture1.jpg') => {
        canvasImg.width = crtColumns;
        canvasImg.height = crtRows;

        img.src = source;

        img.onload = function () {
            let newImgHeight = 0;
            let newImgWidth = 0;
            let newOriginX = 0;
            let newOriginY = 0;

            if (canvasImg.width > canvasImg.height) {
                newImgHeight = canvasImg.height;
                newImgWidth = canvasImg.height * img.width / img.height;
                newOriginY = 0;
                newOriginX = canvasImg.width / 2 - (newImgWidth / 2);
            } else {
                newImgWidth = canvasImg.width;
                newImgHeight = newImgWidth * img.height / img.width;
                newOriginX = 0;
                newOriginY = canvasImg.height / 2 - (newImgHeight / 2);
            }

            ctxImg.drawImage(img, newOriginX, newOriginY, newImgWidth, newImgHeight);

            imgData = ctxImg.getImageData(0, 0, canvasImg.width, canvasImg.height).data;

            initCanvas(); 
            crtScreen = new CrtScreen();
            addEvents();
            window.requestAnimationFrame(loop);
        };
    }

    let init = () => {
		globals.random = Objects.getRandomObject();
        canvasImg = document.getElementById('auxCanvas');
        ctxImg = canvasImg.getContext("2d");
        crtColumns = globals.random.nextInt(30, 100); 
        crtDiameter = Math.floor(width / crtColumns);
        crtRows = Math.floor(height / crtDiameter);              
        loadImage();
    }

    let addEvents = () => {

        canvas.addEventListener('click', e => {
            crtScreen.turnOn();
        }, false);

        /*   
        canvas.addEventListener('mousemove', e => {
            crtScreen.setPixel(e.offsetX, e.offsetY);
        }, false);

        canvas.addEventListener('touchstart', function(e){
            crtScreen.setPixel(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
        });

        canvas.addEventListener('touchmove', function(e){
            e.preventDefault();
            crtScreen.setPixel(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
        });	
        */

        const uploader = document.getElementById('uploader');
        const uploadButton = document.getElementById('uploadButton');

        uploadButton.addEventListener('click', function() {
            uploader.click();
        });

        uploader.addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                
                if (!file.type.match('image.*')) {
                    alert('Please select an image file');
                    return;
                }
                
                const reader = new FileReader();
                
                reader.onload = function(event) {                    
                    img.onerror = function() {
                        alert('Error loading image');
                    };
                
                    loadImage(event.target.result);
                };
                
                reader.onerror = function() {
                    alert('Error reading file');
                };
                
                reader.readAsDataURL(file);
            }
        });
    }

    let randomize = () => {
    
    }

    let draw = () => {
        drawBackground(ctx, canvas);
        crtScreen.draw(ctx);
    }

    let loop = (timestamp) => {
        let progress = timestamp - lastRender;

        crtScreen.update();

        draw();

        lastRender = timestamp;
        window.requestAnimationFrame(loop);
    }

    init();

	window.clearCanvas = () => {  
	}
}
