{
    const config = {
        randomize: true,
        radius: 250,
        strength: 3.5,
        mode: 0,
        functionIndex: 0,
        functions: [barrel, twirl, pincushion, pinch, ripple, wobbly, ripple2]
    };
    
    const globals = {
        mouseX: 0,
        mouseY: 0,
        clicking: false,
        mouseMoved: false,
    };

    const img = new Image();

    function pincushion(data, outputData) {
        const centerX = globals.mouseX;
        const centerY = globals.mouseY;
        const distortionStrength = 5.5;
        const radius = Math.min(centerX, centerY);

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

    function pinch(data, outputData) {
        const centerX = globals.mouseX;
        const centerY = globals.mouseY;
        const radius = Math.min(centerX, centerY);
        const strength = 1.5;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < radius) {
                    const angle = Math.atan2(dy, dx);
                    const distortion = 1 - Math.pow(distance / radius, strength);
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
        const centerX = globals.mouseX;
        const centerY = globals.mouseY;
        const amplitude = 10;
        const frequency = 0.3;
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
        let amplitude = Utils.scale(globals.mouseX, 0, width, 0, 20);
        let frequency = Utils.scale(globals.mouseY, 0, height, 0, 1);
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
        const centerX = globals.mouseX;
        const centerY = globals.mouseY;
        const radius = Math.min(centerX, centerY);
        const distortionStrength = 5.5;

        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < radius) {
                    const angle = Math.atan2(dy, dx);

                    let RAD_CONST = 0.0175;

                    const newX = x + Math.cos((angle + distance * distortionStrength) * RAD_CONST) * 50;
                    const newY = y + Math.sin((angle + distance * distortionStrength) * RAD_CONST) * 50;

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
        const centerX = globals.mouseX;
        const centerY = globals.mouseY;
        const radius = Math.min(centerX, centerY);
        const distortionStrength = 1.5;

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
        let radius = config.mode ? Utils.scale(globals.mouseX, 0, width, 0, 500) : config.radius;
        let strength = config.mode ? Utils.scale(globals.mouseY, 0, height, 0, 20) : config.strength;
        const centerX =  config.mode ? width / 2 : globals.mouseX;
        const centerY =  config.mode ? height / 2 : globals.mouseY;

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


    let init = () => {
        initCanvas();
        
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
        canvas.addEventListener('mousemove', e => {
            globals.mouseMoved = true;
            trackMouse(e.offsetX, e.offsetY);
        }, false);

        canvas.addEventListener('touchmove', function (e) {
            e.preventDefault();
            globals.mouseMoved = true;
            trackMouse(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
        });

        canvas.addEventListener('touchstart', function (e) {
            globals.mouseMoved = false;
            globals.clicking = true;
        });

        canvas.addEventListener('mousedown', e => {
            globals.mouseMoved = false;
            globals.clicking = true;
        }, false);

        canvas.addEventListener('mouseup', e => {
            globals.clicking = false;
        }, false);

        canvas.addEventListener('touchend', e => {
            //if (!globals.mouseMoved)

            globals.clicking = false;
        }, false);

        canvas.addEventListener('click', function (e) {
            //if (!globals.mouseMoved)

        });
    }

    let trackMouse = (x, y) => {
        if (lastPosX == 0) lastPosX = x;
        if (lastPosY == 0) lastPosY = y;

        let movX = lastPosX - x;
        let movY = lastPosY - y;

        if (globals.clicking) {
            globals.mouseX = x;
            globals.mouseY = y;
        }

        lastPosX = x;
        lastPosY = y;
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
        config.radius = Utils.getRandomInt(100, 250);
        config.strength = Utils.getRandomFloat(1, 4, 1);
        config.mode = Utils.getRandomBool();
        config.functionIndex = Math.floor(Math.random() * config.functions.length)
    }

    let loop = (timestamp) => {
        let progress = timestamp - lastRender;

        draw();

        lastRender = timestamp;
        window.requestAnimationFrame(loop);
    }

    init();

    window.clearCanvas = () => {
    }
}
