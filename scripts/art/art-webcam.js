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
        functions: [negative]
    };    
    
    let init = () => {
		initCanvas();
        globals.random = Objects.getRandomObject();
        if (config.randomize) randomize();
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
        config.functionIndex = Math.floor(Math.random() * config.functions.length)      
    }

    function negative(imageData){
        const pixels = imageData;
        for (let i = 0; i < pixels.length; i += 4) {
            pixels[i] = 255 - pixels[i];       
            pixels[i + 1] = 255 - pixels[i + 1]; 
            pixels[i + 2] = 255 - pixels[i + 2];
        }
    }

    let draw = () => {
        drawBackground(ctx, canvas);

        ctx.drawImage(globals.video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        const webcamFunction = config.functions[config.functionIndex];
        let value = webcamFunction(imageData.data);


        ctx.putImageData(imageData, 0, 0);
    }

    let loop = (timestamp) => {
        let progress = timestamp - lastRender;

        if (!globals.streaming) return;
        draw();

        lastRender = timestamp;
        window.requestAnimationFrame(loop);
    }

    init();
    
	window.clearCanvas = () => {    
	}
}
