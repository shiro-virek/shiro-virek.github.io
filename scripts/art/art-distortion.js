{
    const config = {
        randomize: true,
        radius: 250,
        strength: 3.5,
        amplitude: 10,
        frequency: 0.3,
        mode: 1,
        functionIndex: 3,
        functions: [barrel, twirl, pincushion, ripple, wobbly, ripple2, tvDistortion, water] 
    };
    
    const globals = {
        mouseX: 0,
        mouseY: 0,
        lastPosX: 0,
        lastPosY: 0,
        random: null
    };

    const img = new Image();

    function pincushion(data, outputData) {
        const radius = config.mode ? globals.mouseY : config.radius; 
        const distortionStrength = config.mode ? Numbers.scale(globals.mouseX, 0, width, 0.5, 10) : config.strength; 
        const centerX =  config.mode ? halfWidth : globals.mouseX;
        const centerY =  config.mode ? halfHeight : globals.mouseY;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < radius) {
                    const angle = Math.atan2(dy, dx);
                    const distortion = 1 - Math.pow(distance / radius, distortionStrength);
                    const newX = centerX + Math.cos(angle) * distortion * distance;
                    const newY = centerY + Math.sin(angle) * distortion * distance;

                    const index = (y * width + x) * 4;
                    const newIndex = (Math.round(newY) * width + Math.round(newX)) * 4;

                    outputData[index] = data[newIndex];         // R
                    outputData[index + 1] = data[newIndex + 1]; // G
                    outputData[index + 2] = data[newIndex + 2]; // B
                    outputData[index + 3] = data[newIndex + 3]; // A
                } else {
                    const index = (y * width + x) * 4;
                    outputData[index] = data[index];         // R
                    outputData[index + 1] = data[index + 1]; // G
                    outputData[index + 2] = data[index + 2]; // B
                    outputData[index + 3] = data[index + 3]; // A
                }
            }
        }
    }

    function ripple(data, outputData) {
        const amplitude = config.mode ? Numbers.scale(globals.mouseY, 0, height, 1, 20) : config.amplitude; 
        const frequency = config.mode ? Numbers.scale(globals.mouseX, 0, width, 0.1, 0.5) : config.frequency; 
        const centerX =  config.mode ? halfWidth : globals.mouseX;
        const centerY =  config.mode ? halfHeight : globals.mouseY;
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

                    outputData[index] = data[newIndex];         // Red
                    outputData[index + 1] = data[newIndex + 1]; // Green
                    outputData[index + 2] = data[newIndex + 2]; // Blue
                    outputData[index + 3] = data[newIndex + 3]; // Alpha
                }
            }
        }
    }

    function wobbly(data, outputData) {
        let amplitude = Numbers.scale(globals.mouseX, 0, width, 0, 20);
        let frequency = Numbers.scale(globals.mouseY, 0, height, 0, 1);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const offsetX = Math.sin(y * frequency) * amplitude;
                const offsetY = Math.cos(x * frequency) * amplitude;

                const newX = x + offsetX;
                const newY = y + offsetY;

                const clampedX = Math.max(0, Math.min(width - 1, Math.round(newX)));
                const clampedY = Math.max(0, Math.min(height - 1, Math.round(newY)));

                const index = (y * width + x) * 4;
                const newIndex = (clampedY * width + clampedX) * 4;

                outputData[index] = data[newIndex];         // R
                outputData[index + 1] = data[newIndex + 1]; // G
                outputData[index + 2] = data[newIndex + 2]; // B
                outputData[index + 3] = data[newIndex + 3]; // A
            }
        }
    }

    function ripple2(data, outputData) {
        const radius = config.mode ? globals.mouseY : config.radius; 
        const distortionStrength = config.mode ? Numbers.scale(globals.mouseX, 0, width, 0.5, 10) : config.strength; 
        const centerX =  config.mode ? halfWidth : globals.mouseX;
        const centerY =  config.mode ? halfHeight : globals.mouseY;

        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < radius) {
                    const angle = Math.atan2(dy, dx);                    

                    const newX = x + Math.cos((angle + distance * distortionStrength) * Trigonometry.RAD_CONST) * 50;
                    const newY = y + Math.sin((angle + distance * distortionStrength) * Trigonometry.RAD_CONST) * 50;

                    const index = (y * canvas.width + x) * 4;
                    const newIndex = (Math.round(newY) * canvas.width + Math.round(newX)) * 4;

                    outputData[index] = data[newIndex];         // R
                    outputData[index + 1] = data[newIndex + 1]; // G
                    outputData[index + 2] = data[newIndex + 2]; // B
                    outputData[index + 3] = data[newIndex + 3]; // A
                } else {
                    const index = (y * canvas.width + x) * 4;
                    outputData[index] = data[index];         // R
                    outputData[index + 1] = data[index + 1]; // G
                    outputData[index + 2] = data[index + 2]; // B
                    outputData[index + 3] = data[index + 3]; // A
                }
            }
        }
    }

    function barrel(data, outputData) {
        const radius = config.mode ? globals.mouseY : config.radius; 
        const distortionStrength = config.mode ? Numbers.scale(globals.mouseX, 0, width, 0.5, 10) : config.strength; 
        const centerX =  config.mode ? halfWidth : globals.mouseX;
        const centerY =  config.mode ? halfHeight : globals.mouseY;

        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < radius) {
                    const angle = Math.atan2(dy, dx);
                    const distortion = Math.pow(distance / radius, distortionStrength);
                    const newX = centerX + Math.cos(angle) * distortion * radius;
                    const newY = centerY + Math.sin(angle) * distortion * radius;

                    const index = (y * canvas.width + x) * 4;
                    const newIndex = (Math.round(newY) * canvas.width + Math.round(newX)) * 4;

                    outputData[index] = data[newIndex];         // R
                    outputData[index + 1] = data[newIndex + 1]; // G
                    outputData[index + 2] = data[newIndex + 2]; // B
                    outputData[index + 3] = data[newIndex + 3]; // A
                } else {
                    const index = (y * canvas.width + x) * 4;
                    outputData[index] = data[index];         // R
                    outputData[index + 1] = data[index + 1]; // G
                    outputData[index + 2] = data[index + 2]; // B
                    outputData[index + 3] = data[index + 3]; // A
                }
            }
        }
    }

    function twirl(data, outputData) {
        let radius = config.mode ? Numbers.scale(globals.mouseX, 0, width, 0, 500) : config.radius;
        let strength = config.mode ? Numbers.scale(globals.mouseY, 0, height, 0, 20) : config.strength;
        const centerX =  config.mode ? halfWidth : globals.mouseX;
        const centerY =  config.mode ? halfHeight : globals.mouseY;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < radius) {
                    const angle = Math.atan2(dy, dx);
                    const twistAngle = strength * Math.pow((radius - distance) / radius, 2);
                    const newAngle = angle + twistAngle;

                    const newX = centerX + Math.cos(newAngle) * distance;
                    const newY = centerY + Math.sin(newAngle) * distance;

                    const index = (y * width + x) * 4;
                    const newIndex = (Math.round(newY) * width + Math.round(newX)) * 4;

                    outputData[index] = data[newIndex];         // R
                    outputData[index + 1] = data[newIndex + 1]; // G
                    outputData[index + 2] = data[newIndex + 2]; // B
                    outputData[index + 3] = data[newIndex + 3]; // A
                } else {
                    const index = (y * width + x) * 4;
                    outputData[index] = data[index];         // R
                    outputData[index + 1] = data[index + 1]; // G
                    outputData[index + 2] = data[index + 2]; // B
                    outputData[index + 3] = data[index + 3]; // A
                }
            }
        }
    }

    function tvDistortion(data, outputData) {
        let amplitude = config.mode ? Numbers.scale(globals.mouseX, 0, width, 1.0, 0.1) : 0.1;
        let freq = config.mode ? Numbers.scale(globals.mouseX, 0, width, 0.001, 0.01) : 0.005;
        let waves = config.mode ? Numbers.scale(globals.mouseY, 0, height, 1, 10) : 5;
        let glitch = config.mode ? Numbers.scale(globals.mouseY, 0, height, 1, 10) : 10;

        for (let y = 0; y < height; y++) {
            const offset = Math.floor(Math.sin(y * amplitude + Date.now() * freq) * waves + (globals.random.next() - 0.5) * glitch);

            for (let x = 0; x < width; x++) {
                let srcX = Math.min(width - 1, Math.max(0, x + offset));
                let srcIndex = (y * width + srcX) * 4;
                let destIndex = (y * width + x) * 4;

                outputData[destIndex] = data[srcIndex];       // R
                outputData[destIndex + 1] = data[srcIndex + 1]; // G
                outputData[destIndex + 2] = data[srcIndex + 2]; // B
                outputData[destIndex + 3] = data[srcIndex + 3]; // A
            }
        }
    }

    function water(data, outputData) {
        let amplitude = config.mode ? Numbers.scale(globals.mouseX, 0, width, 1.0, 0.1) : 0.1;
        let freq = config.mode ? Numbers.scale(globals.mouseX, 0, width, 0.001, 0.01) : 0.005;
        let waves = config.mode ? Numbers.scale(globals.mouseY, 0, height, 1, 10) : 5;

        for (let y = 0; y < height; y++) {
            const offset = Math.floor(Math.sin(y * amplitude + Date.now() * freq) * waves);

            for (let x = 0; x < width; x++) {
                let srcX = Math.min(width - 1, Math.max(0, x + offset));
                let srcIndex = (y * width + srcX) * 4;
                let destIndex = (y * width + x) * 4;

                outputData[destIndex] = data[srcIndex];       // R
                outputData[destIndex + 1] = data[srcIndex + 1]; // G
                outputData[destIndex + 2] = data[srcIndex + 2]; // B
                outputData[destIndex + 3] = data[srcIndex + 3]; // A
            }
        }
    }

    let init = () => {
        initCanvas();
        
		globals.random = Objects.getRandomObject();
        if (config.randomize) randomize();

        img.src = '../assets/Picture1.jpg';
        img.crossOrigin = "Anonymous";

        img.onload = function () {
            canvas.width = img.width;
            canvas.height = img.height;

            trackMouse(0, 0);

            addEvents();
            window.requestAnimationFrame(loop)
        };
    }

    let addEvents = () => {
    };

    window.trackMouse = (x, y) => {
        if (globals.lastPosX == 0) globals.lastPosX = x;
        if (globals.lastPosY == 0) globals.lastPosY = y;

        let movX = globals.lastPosX - x;
        let movY = globals.lastPosY - y;

        if (clicking) {
            globals.mouseX = x;
            globals.mouseY = y;
        }

        globals.lastPosX = x;
        globals.lastPosY = y;
    }

    let draw = () => {
        drawBackground(ctx, canvas);

        let newImgHeight = 0;
        let newImgWidth = 0;
        let newOriginX = 0;
        let newOriginY = 0;

        if (width > height) {
            newImgHeight = height;
            newImgWidth = newImgHeight * img.width / img.height;
            newOriginY = 0;
            newOriginX = halfWidth - (newImgWidth / 2);
        } else {
            newImgWidth = width;
            newImgHeight = newImgWidth * img.height / img.width;
            newOriginX = 0;
            newOriginY = halfHeight - (newImgHeight / 2);
        }

        ctx.drawImage(img, newOriginX, newOriginY, newImgWidth, newImgHeight);

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

    init();

    window.clearCanvas = () => {
		Sound.error();
    }

	window.magic = () => {  
		Sound.error();
	}

    window.upload = () => {
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
                
                img.src = event.target.result;
            };
            
            reader.onerror = function() {
                alert('Error reading file');
            };
            
            reader.readAsDataURL(file);
        }
    }
}
