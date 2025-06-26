{
    const globals = {
		random: null,
        streaming: false,
        video: null
    };

    const config = {
        randomize: false,
        mode: 1,
        functionIndex: 1,
        functions: [negative, ripple]
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
        const data = imageData;

        Effects.negative(data, data);    
    }

    function ripple(imageData){
        var data = imageData;

        const amplitude = 10;
        const frequency = 0.3; 
        const centerX = halfWidth;
        const centerY = halfHeight;
        const phase = 1;

        Effects.ripple(data, data, amplitude, frequency, phase, centerX, centerY);
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

    window.trackMouse = (xMouse, yMouse) => {
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