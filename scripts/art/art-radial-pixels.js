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
        mode: 1,
        rows: 50,
        columns: 50,
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
            const sampleScale = 4;
            const subSamples = 3;

            let imgW = globals.radialScreen.slicesNumber * sampleScale;
            let imgH = globals.radialScreen.levelsNumber * sampleScale;
            globals.canvasImg.width = imgW;
            globals.canvasImg.height = imgH;

            const { newImgHeight, newImgWidth, newOriginX, newOriginY } = Screen.adaptImageToScreen(globals.img, globals.canvasImg);
            
            globals.ctxImg.drawImage(globals.img, newOriginX, newOriginY, newImgWidth, newImgHeight);

            globals.imgData = globals.ctxImg.getImageData(0, 0, imgW, imgH).data;

            let halfW = imgW / 2;
            let halfH = imgH / 2;
            let maxR = Math.hypot(halfW, halfH);

            for (let s = 0; s <= globals.radialScreen.slicesNumber; s++) {
                for (let l = 0; l <= globals.radialScreen.levelsNumber; l++) {
                    let color = null;

                    if (config.mode == 1){
                        let totalR = 0, totalG = 0, totalB = 0, count = 0;

                        for (let sa = 0; sa < subSamples; sa++) {
                            for (let sr = 0; sr < subSamples; sr++) {
                                let angleDeg = (s + (sa + 0.5) / subSamples) * globals.radialScreen.slicesAngle;
                                let angleRad = Trigonometry.degToRad(angleDeg);
                                let r = ((l + (sr + 0.5) / subSamples) / globals.radialScreen.levelsNumber) * maxR;

                                let imgX = Math.floor(halfW + r * Math.cos(angleRad));
                                let imgY = Math.floor(halfH + r * Math.sin(angleRad));

                                imgX = Math.max(0, Math.min(imgW - 1, imgX));
                                imgY = Math.max(0, Math.min(imgH - 1, imgY));

                                let idx = (imgY * imgW + imgX) * 4;
                                totalR += globals.imgData[idx];
                                totalG += globals.imgData[idx + 1];
                                totalB += globals.imgData[idx + 2];
                                count++;
                            }
                        }

                        color = `rgb(${Math.round(totalR / count)}, ${Math.round(totalG / count)}, ${Math.round(totalB / count)})`;
                    }else{
                        let index = (l * globals.radialScreen.slicesNumber + s) * 4;
                        color = `rgb(${globals.imgData[index]}, ${globals.imgData[index + 1]}, ${globals.imgData[index + 2]})`;
                    }                   
                    
                    globals.radialScreen.radialPixels[s][l].color = color;
                }
            }            
        };
    }

    let init = () => {
		globals.random = Objects.getRandomObject();
        if (config.randomize) randomize();
        globals.ctxImg = globals.canvasImg.getContext("2d", { willReadFrequently: true });
        globals.radialScreen = new RadialScreen(height / 2, config.columns, config.rows);
 
        initCanvas();
        addEvents();
        window.requestAnimationFrame(loop);

        addSpecialControls();

        loadImage();
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

        let toggleMode = () => { 
			config.mode = config.mode == 1 ? 2 : 1;
            loadImage();
        }
        
        Browser.addButton("btnToggleMode", "🔀", toggleMode);
    }

    let addEvents = () => {
    }

    let randomize = () => {
        config.rows = globals.random.nextInt(30, 100);
        config.columns = config.rows;
    }
    
    window.draw = (delta) => {                
        globals.radialScreen.update();
        drawBackground(ctx, canvas);
        globals.radialScreen.draw(ctx);
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