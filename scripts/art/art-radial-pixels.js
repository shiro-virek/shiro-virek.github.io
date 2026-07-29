{
    const globals = {
        random: null,
        canvasImg: document.getElementById('auxCanvas'),
        ctxImg: null,
        img: new Image(),
        imgData: null,
        radialScreen: null,
    };

    const config = {
        randomize: true,
    };    


    class RadialScreen {
        constructor(radius, slicesNumber, levelsNumber) {      
            this.radialPixels = [];
            this.radius = radius;
            this.slicesNumber = slicesNumber;
            this.slicesAngle = 360 / this.slicesNumber;
            this.levelsNumber = levelsNumber;
            this.levelsWideness = this.radius / this.levelsNumber;
            this.generatePixels();          
        }

        generatePixels = () => {
            this.radialPixels = []; 
            for (let x = 0; x <= this.slicesNumber; x++) {
                this.radialPixels[x] = new Array(this.levelsNumber);
            }

            for (let x = 0; x <= this.slicesNumber; x++) {
                for (let y = 0; y <= this.levelsNumber; y++) {
                    let pixel = new RadialPixel(this, x, y);
                    this.radialPixels[x][y] = pixel;
                }
            }
        }

        draw = (ctx) => {
            for (let x = 0; x <= this.slicesNumber; x++) {
                for (let y = 0; y <= this.levelsNumber; y++) {
                    this.radialPixels[x][y].draw(ctx);
                }
            }
        }

        update = () => {                           
        }
    }

    class RadialPixel {
        constructor(radialScreen, sliceNumber, levelNumber, color = "#FFF") {
            this.sliceNumber = sliceNumber;
            this.levelNumber = levelNumber;
            this.radialScreen = radialScreen;
            this.color = color;
        }

        draw = (ctx) => {
            let angle = this.sliceNumber * this.radialScreen.slicesAngle;
            let angle2 = angle + this.radialScreen.slicesAngle;
            drawRadialPixel(width / 2, height / 2, this.levelNumber * this.radialScreen.levelsWideness, this.radialScreen.levelsWideness, angle, angle2, this.color);
        }
    }

    let loadImage = (source = '../assets/Picture1.jpg') => {
        globals.img.src = source;

        globals.img.onload = function () {
            /*
            globals.canvasImg.width = config.ledColumns;
            globals.canvasImg.height = config.ledRows;

            const { newImgHeight, newImgWidth, newOriginX, newOriginY } = Screen.adaptImageToScreen(globals.img, globals.canvasImg);
            
            globals.ctxImg.drawImage(globals.img, newOriginX, newOriginY, newImgWidth, newImgHeight);

            globals.imgData = globals.ctxImg.getImageData(0, 0, config.ledColumns, config.ledRows).data;

            
            for (let y = 0; y < config.ledRows; y++) {
                for (let x = 0; x < config.ledColumns; x++) {
                    let index = (y * config.ledColumns + x) * 4;
                    globals.ledScreen.leds[x][y].r = globals.imgData[index];
                    globals.ledScreen.leds[x][y].g = globals.imgData[index + 1];
                    globals.ledScreen.leds[x][y].b = globals.imgData[index + 2];
                    globals.ledScreen.leds[x][y].lightness = Numbers.scale(Color.getLightness(globals.imgData[index], globals.imgData[index+1], globals.imgData[index+2]), 0, 250, 0, 100);
                }
            }
            */
        };
    }

    let init = () => {
		globals.random = Objects.getRandomObject();
        globals.ctxImg = globals.canvasImg.getContext("2d", { willReadFrequently: true });
        globals.radialScreen = new RadialScreen(height / 2, 20, 20);
        if (config.randomize) randomize();
        initCanvas();
        addEvents();
        window.requestAnimationFrame(loop);

        addSpecialControls();
    }

    let addSpecialControls = () => {
        let uploader = document.getElementById('uploader');        

        let handleClick = () => {
            uploader.click();
        }       
        
        Browser.addButton("btnUploadPicture", "🖼️", handleClick);

        uploader.addEventListener('change', function(e) {
            Upload.uploadPicture(e, globals.img, loadImage);
        });
    }

    let addEvents = () => {
    }

    let randomize = () => {
    }
    
    window.draw = (delta) => {                
        globals.radialScreen.update();
        drawBackground(ctx, canvas);
        globals.radialScreen.draw(ctx);

        /*
        radialPixel(200, 200, 20, 5, 0, 100, "rgba(255,0,0,1)");
        radialPixel(200, 200, 20, 5, 100, 190, "rgba(255,255,0,1)");
        radialPixel(200, 200, 20, 5, 190, 360, "rgba(0,255,255,1)");

        radialPixel(200, 200, 15, 5, 0, 100, "rgba(255,0,255,1)");
        radialPixel(200, 200, 15, 5, 100, 190, "rgba(0,255,0,1)");
        radialPixel(200, 200, 15, 5, 190, 360, "rgba(255,255,255,1)");

        radialPixel(200, 200, 10, 5, 0, 100, "rgba(255,0,0,1)");
        radialPixel(200, 200, 10, 5, 100, 190, "rgba(255,255,0,1)");
        radialPixel(200, 200, 10, 5, 190, 360, "rgba(0,255,255,1)");

        radialPixel(200, 200, 5, 5, 0, 100, "rgba(255,0,255,1)");
        radialPixel(200, 200, 5, 5, 100, 190, "rgba(0,255,0,1)");
        radialPixel(200, 200, 5, 5, 190, 360, "rgba(255,255,255,1)");
        */
    }

    let getArcEndPoint = (c1,c2,radius,angle) => {
        return [c1+Math.cos(angle)*radius,c2+Math.sin(angle)*radius];
    }

    let drawRadialPixel = (x, y, radius, wideness, startAngle, endAngle, color) => {
        ctx.fillStyle = color;  

        ctx.beginPath();
        startAngle *= Trigonometry.RAD_CONST;
        endAngle *= Trigonometry.RAD_CONST; 
  
        ctx.arc(x, y, radius, startAngle, endAngle, 0);
        ctx.arc(x, y, Math.max(0, radius - wideness), endAngle, startAngle, 1);

        ctx.fill();
    }

    window.trackMouse = (x, y) => {
        if (clicking) {  

        }
    }
    
    window.clearCanvas = () => {
		Sound.error();
    }

    init();
}