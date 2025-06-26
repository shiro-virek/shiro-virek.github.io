{
    const globals = {
		random: null,
        streaming: false,
        video: null
    };

    const config = {
        randomize: true,
        clicking: false,
        mouseMoved: false, 
        mode: 1,
        functionIndex: 1,
        functions: [negative,ripple]
    };    
    
    let init = () => {
        globals.random = Objects.getRandomObject();
        if (config.randomize) randomize();
		initCanvas();
        addEvents();
    }

    let addEvents = () => {        
		canvas.addEventListener('click', async () => {
            if (!globals.streaming) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    
                    globals.video = document.createElement('video');
                    globals.video.srcObject = stream;
                    globals.video.play();
                    
                    globals.video.addEventListener('loadedmetadata', () => {
                        canvas.width = globals.video.videoWidth;
                        canvas.height = globals.video.videoHeight;
                        globals.streaming = true;
                        
                        requestAnimationFrame(loop);
                    });
                } catch (err) {
                    console.error("The webcam could not be accessed:", err);
                    alert("The webcam could not be accessed. Make sure you allow access.");
                }
            }
        });
    }

    let randomize = () => { 
        config.functionIndex = globals.random.nextInt(0, config.functions.length);   
    }

    function negative(imageData){
        const pixels = imageData;
        for (let i = 0; i < pixels.length; i += 4) {
            pixels[i] = 255 - pixels[i];       
            pixels[i + 1] = 255 - pixels[i + 1]; 
            pixels[i + 2] = 255 - pixels[i + 2];
        }
    }

    function ripple(imageData){
        var outputData = imageData;

        const amplitude = 10;
        const frequency = 0.3; 
        const centerX = halfWidth;
        const centerY = halfHeight;
        const phase = 1;

        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                const displacement = amplitude * Math.sin(frequency * distance - phase);

                const newX = x + (dx / distance) * displacement;
                const newY = y + (dy / distance) * displacement;

                if (newX >= 0 && newX < canvas.width && newY >= 0 && newY < canvas.height) {
                    const index = (y * canvas.width + x) * 4;
                    const newIndex = (Math.floor(newY) * canvas.width + Math.floor(newX)) * 4;

                    outputData[index] = imageData[newIndex];         // Red
                    outputData[index + 1] = imageData[newIndex + 1]; // Green
                    outputData[index + 2] = imageData[newIndex + 2]; // Blue
                    outputData[index + 3] = imageData[newIndex + 3]; // Alpha
                }
            }
        }

        imageData = outputData;    
    }

    let draw = () => {
        drawBackground(ctx, canvas);

        ctx.drawImage(globals.video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        const webcamFunction = config.functions[config.functionIndex];
        webcamFunction(imageData.data);

        ctx.putImageData(imageData, 0, 0);
    }

    let loop = (timestamp) => {
        let progress = timestamp - lastRender;

        if (!globals.streaming) return;
        draw();

        lastRender = timestamp;
        window.requestAnimationFrame(loop);
    }

	window.clearCanvas = () => {
		Sound.error();
	}

	window.magic = () => {  
		Sound.error();
	}

    window.upload = () => {
		Sound.error();
    }
    
    init();
}