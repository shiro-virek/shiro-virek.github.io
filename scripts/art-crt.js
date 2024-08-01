
{
    let crtRows = 0
    let crtColumns = 0;
    let crtDiameter = 0;
    let crtScreen;
    
    let canvasImg = document.getElementById('auxCanvas');
    let ctxImg = canvasImg.getContext("2d");
    let imgData;
    
    class CrtScreen {
        constructor() {
            this.crts = [];
            this.generateCrts();
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
            
            for (let y = 0; y < crtRows; y++) {
                for (let x = 0; x < crtColumns; x++) {
                    let i = y * crtColumns + x;
                    const r = imgData[i * 4 + 0];
                    const g = imgData[i * 4 + 1];
                    const b = imgData[i * 4 + 2];
                    const a = imgData[i * 4 + 3];

                    let newR = Utils.scale(r, 0, 255, 0, 50);
                    let newG = Utils.scale(g, 0, 255, 0, 50);
                    let newB = Utils.scale(b, 0, 255, 0, 50);

                    this.crts[x][y].draw(ctx, newR, newG, newB);
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
            Utils.drawRectangle(ctx, this.x, this.y, third, this.diameter, borderColor, colorR)
            Utils.drawRectangle(ctx, this.x + third, this.y, third, this.diameter, borderColor, colorG)
            Utils.drawRectangle(ctx, this.x + third * 2, this.y, third, this.diameter, borderColor, colorB)
        }
    }

    let loadImage = () => {
        canvasImg.width = crtColumns;
        canvasImg.height = crtRows;

        const img = new Image();
        img.src = '../assets/Picture1.jpg';

        img.onload = function () {
            ctxImg.drawImage(img, 0, 0, canvasImg.width, canvasImg.height);
            
            imgData = ctxImg.getImageData(0, 0, crtColumns, crtRows).data;

            initCanvas(); 
            crtScreen = new CrtScreen();
            addEvents();
            window.requestAnimationFrame(loop);
        };
    }

    let init = () => {
        canvasImg = document.getElementById('auxCanvas');
        ctxImg = canvasImg.getContext("2d");
        crtColumns = Utils.getRandomInt(30, 100); 
        crtDiameter = Math.floor(width / crtColumns);
        crtRows = Math.floor(height / crtDiameter);              
        loadImage();
    }

    let addEvents = () => {
        /*     
        canvas.addEventListener('click', e => {
            crtScreen.setPixel(e.offsetX, e.offsetY);
        }, false);
        
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
}
