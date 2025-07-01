{
    const config = {
        randomize: true,
        radius: 250,
        strength: 3.5,
        amplitude: 10,
        frequency: 0.3,
        mode: 1,
        functionIndex: 1,
        functions: [barrel, twirl, pincushion, ripple, wobbly, ripple2, tvDistortion, water, boxBlur] 
    };
    
    const globals = {
        mouseX: 0,
        mouseY: 0,
        random: null,
        img: new Image(),
    };

    function pincushion(data, outputData) {
        const radius = config.mode ? globals.mouseY : config.radius; 
        const distortionStrength = config.mode ? Numbers.scale(globals.mouseX, 0, width, 0.5, 10) : config.strength; 
        const centerX =  config.mode ? halfWidth : globals.mouseX;
        const centerY =  config.mode ? halfHeight : globals.mouseY;

        Effects.pincushion(data, outputData, radius, distortionStrength, centerX, centerY);
    }

    function ripple(data, outputData) {
        const amplitude = config.mode ? Numbers.scale(globals.mouseY, 0, height, 1, 20) : config.amplitude; 
        const frequency = config.mode ? Numbers.scale(globals.mouseX, 0, width, 0.1, 0.5) : config.frequency; 
        const centerX =  config.mode ? halfWidth : globals.mouseX;
        const centerY =  config.mode ? halfHeight : globals.mouseY;
        const phase = 1;

        Effects.ripple(data, outputData, amplitude, frequency, phase, centerX, centerY);
    }

    function wobbly(data, outputData) {
        let amplitude = Numbers.scale(globals.mouseX, 0, width, 0, 20);
        let frequency = Numbers.scale(globals.mouseY, 0, height, 0, 1);

        Effects.wobbly(data, outputData, amplitude, frequency);    
    }

    function ripple2(data, outputData) {
        const radius = config.mode ? globals.mouseY : config.radius; 
        const distortionStrength = config.mode ? Numbers.scale(globals.mouseX, 0, width, 0.5, 10) : config.strength; 
        const centerX =  config.mode ? halfWidth : globals.mouseX;
        const centerY =  config.mode ? halfHeight : globals.mouseY;

        Effects.ripple2(data, outputData, radius, distortionStrength, centerX, centerY);
    }

    function barrel(data, outputData) {
        const radius = config.mode ? globals.mouseY : config.radius; 
        const distortionStrength = config.mode ? Numbers.scale(globals.mouseX, 0, width, 0.5, 10) : config.strength; 
        const centerX =  config.mode ? halfWidth : globals.mouseX;
        const centerY =  config.mode ? halfHeight : globals.mouseY;

        Effects.barrel(data, outputData, radius, distortionStrength, centerX, centerY);
    }

    function twirl(data, outputData) {
        let radius = config.mode ? Numbers.scale(globals.mouseX, 0, width, 0, 500) : config.radius;
        let strength = config.mode ? Numbers.scale(globals.mouseY, 0, height, 0, 20) : config.strength;
        const centerX =  config.mode ? halfWidth : globals.mouseX;
        const centerY =  config.mode ? halfHeight : globals.mouseY;

        Effects.twirl(data, outputData, radius, strength, centerX, centerY);
    }

    function tvDistortion(data, outputData) {
        let amplitude = config.mode ? Numbers.scale(globals.mouseX, 0, width, 1.0, 0.1) : 0.1;
        let frequency = config.mode ? Numbers.scale(globals.mouseX, 0, width, 0.001, 0.01) : 0.005;
        let waves = config.mode ? Numbers.scale(globals.mouseY, 0, height, 1, 10) : 5;
        let glitch = config.mode ? Numbers.scale(globals.mouseY, 0, height, 1, 10) : 10;

        Effects.tvDistortion(data, outputData, amplitude, frequency, waves, glitch, globals.random);
    }

    function water(data, outputData) {
        let amplitude = config.mode ? Numbers.scale(globals.mouseX, 0, width, 1.0, 0.1) : 0.1;
        let frequency = config.mode ? Numbers.scale(globals.mouseX, 0, width, 0.001, 0.01) : 0.005;
        let waves = config.mode ? Numbers.scale(globals.mouseY, 0, height, 1, 10) : 5;

        Effects.water(data, outputData, amplitude, frequency, waves);
    }
        
    function boxBlur(data, outputData) {
        let radius = Math.floor(Numbers.scale(globals.mouseX, 0, width, 1, 10));

        Effects.boxBlur(data, outputData, radius);
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

    let draw = () => {
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
    
    let randomize = () => {
        config.radius = globals.random.nextInt(100, Math.min(halfWidth, halfHeight));
        config.strength = globals.random.nextRange(0.1, 10, 1);
        config.amplitude = globals.random.nextInt(1, 20);
        config.frequency = globals.random.nextRange(0.1, 0.5, 1);
        config.mode = globals.random.nextBool();
        config.functionIndex = globals.random.nextInt(0, config.functions.length);
    }

    let loop = (timestamp) => {
        let progress = timestamp - lastRender;

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
