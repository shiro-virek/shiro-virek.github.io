{
    const config = {
        randomize: true,
        radius: 250,
        strength: 3.5,
        amplitude: 10,
        frequency: 0.3,
        mode: 1,
        functionIndex: 1,
        functions: [edges] 
    };
    
    const globals = {
        mouseX: 0,
        mouseY: 0,
        random: null,
        img: new Image(),
    };

    function noChanges(data, outputData) {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {        
                const index = (y * width + x) * 4;
                outputData[index] = data[index];       
                outputData[index + 1] = data[index + 1]; 
                outputData[index + 2] = data[index + 2]; 
                outputData[index + 3] = data[index + 3];                 
            }
        }
    }

    function edges(data, outputData) {
        let kernel = [
            [-1, -1, -1],
            [-1, 8, -1],
            [-1, -1, -1],
        ];
          
    
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {   
               /* const index = (y * width + x) * 4;
                outputData[index] = data[index];       
                outputData[index + 1] = data[index + 1]; 
                outputData[index + 2] = data[index + 2]; 
                outputData[index + 3] = data[index + 3];  
                */
        
                
                let newPixels = [
                    applyFilter(data, x, y, kernel[1][1]),
                    applyFilter(data, x-1, y-1, kernel[0][0]),
                    applyFilter(data, x+1, y+1, kernel[2][2]),
                    applyFilter(data, x-1, y+1, kernel[0][2]),
                    applyFilter(data, x+1, y-1, kernel[2][0]),
                    applyFilter(data, x-1, y, kernel[0][1]),
                    applyFilter(data, x, y-1, kernel[1][0]),
                    applyFilter(data, x+1, y, kernel[2][1]),
                    applyFilter(data, x, y+1, kernel[1][2])
                ];


                let pixelsSum = [0,0,0,0];

                for(let i = 0; i < newPixels.length; i++){
                    pixelsSum[0] += newPixels[i][0];
                    pixelsSum[1] += newPixels[i][1];
                    pixelsSum[2] += newPixels[i][2];
                }
                    
                const index = (y * width + x) * 4;
                outputData[index] = pixelsSum[0];       
                outputData[index + 1] = pixelsSum[1];  
                outputData[index + 2] = pixelsSum[2];  
                outputData[index + 3] = 255;  
            }
        }
    }

    let applyFilter = (data, x, y, filterValue) => { 
        if (x < 0 || x > width || y < 0 || y > width) return 0;
        const index = (y * width + x) * 4;
        return [data[index] * filterValue,
                data[index + 1] * filterValue,
                data[index + 2] * filterValue]
    }

    let init = () => {
        initCanvas();
        
		globals.random = Objects.getRandomObject();
        if (config.randomize) randomize();

        globals.img.src = '../assets/Picture1.jpg';
        globals.img.crossOrigin = "Anonymous";

        globals.img.onload = function () {
            addEvents();
            window.requestAnimationFrame(loop)
        };
    }

    let addEvents = () => {
    };

    window.trackMouse = (x, y) => {
        if (clicking) {
            globals.mouseX = x;
            globals.mouseY = y;
        }
    }
    
    let randomize = () => {
        config.radius = globals.random.nextInt(100, Math.min(halfWidth, halfHeight));
        config.strength = globals.random.nextRange(0.1, 10, 1);
        config.amplitude = globals.random.nextInt(1, 20);
        config.frequency = globals.random.nextRange(0.1, 0.5, 1);
        config.mode = 1; //globals.random.nextBool();
        config.functionIndex = globals.random.nextInt(0, config.functions.length - 1);
    }

    window.draw = () => {
        drawBackground(ctx, canvas);

        const { newImgHeight, newImgWidth, newOriginX, newOriginY } = Screen.adaptImageToScreen(globals.img, canvas);
            
        ctx.drawImage(globals.img, newOriginX, newOriginY, newImgWidth, newImgHeight);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        const outputImageData = ctx.createImageData(canvas.width, canvas.height);
        const outputData = outputImageData.data;

        const modifierFunction = config.functions[config.functionIndex];
        modifierFunction(data, outputData);

        ctx.putImageData(outputImageData, 0, 0);
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
                
                globals.img.src = event.target.result;
            };
            
            reader.onerror = function() {
                alert('Error reading file');
            };
            
            reader.readAsDataURL(file);
        }
    }

    init();
}
