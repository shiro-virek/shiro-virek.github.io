{
    const config = {
        clicking: false,
        mouseMoved: false
    };    

	let mouseX;
	let mouseY;
    const img = new Image();

    let init = () => {
        initCanvas();
        

        img.src = '../assets/Picture1.jpg'; 
        img.crossOrigin = "Anonymous"; 

        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;


            addEvents();
            window.requestAnimationFrame(loop)
        };
    }

    let addEvents = () => {
        canvas.addEventListener('mousemove', e => {
            config.mouseMoved = true;
			trackMouse(e.offsetX, e.offsetY);
		}, false);

		canvas.addEventListener('touchmove', function (e) {
			e.preventDefault();
            config.mouseMoved = true;
			trackMouse(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
		});

		canvas.addEventListener('touchstart', function (e) {
            config.mouseMoved = false;
			config.clicking = true;
		});

		canvas.addEventListener('mousedown', e => {
            config.mouseMoved = false;
			config.clicking = true;
		}, false);

		canvas.addEventListener('mouseup', e => {
			config.clicking = false;
		}, false);

		canvas.addEventListener('touchend', e => {
            //if (!config.mouseMoved)
               
			config.clicking = false;
		}, false);  

		canvas.addEventListener('click', function (e) {
            //if (!config.mouseMoved)
               
		});
    }

    let trackMouse = (x, y) => {
        if (lastPosX == 0) lastPosX = x;
        if (lastPosY == 0) lastPosY = y;

        let movX = lastPosX - x;
        let movY = lastPosY - y;

        if (config.clicking) {  
            mouseX = x;
			mouseY = y;
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

        if (width > height){
            newImgHeight = height;
            newImgWidth = newImgHeight * img.width / img.height;
            newOriginY = 0;
            newOriginX = halfWidth - (newImgWidth / 2);
        }else{
            newImgWidth = width;
            newImgHeight = newImgWidth * img.height / img.width;
            newOriginX = 0;
            newOriginY = halfHeight - (newImgHeight / 2);
        }

        ctx.drawImage(img, newOriginX, newOriginY, newImgWidth, newImgHeight);
    
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        const centerX = mouseX; 
        const centerY = mouseY; 
        const radius = Math.min(centerX, centerY);
        const distortionStrength = 1.5; // Ajusta este valor para controlar la intensidad de la distorsión

        const outputImageData = ctx.createImageData(canvas.width, canvas.height);
        const outputData = outputImageData.data;

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

                    // Copia los valores de los píxeles
                    outputData[index] = data[newIndex];         // R
                    outputData[index + 1] = data[newIndex + 1]; // G
                    outputData[index + 2] = data[newIndex + 2]; // B
                    outputData[index + 3] = data[newIndex + 3]; // A
                } else {
                    // Si el píxel está fuera del radio, se deja igual
                    const index = (y * canvas.width + x) * 4;
                    outputData[index] = data[index];         // R
                    outputData[index + 1] = data[index + 1]; // G
                    outputData[index + 2] = data[index + 2]; // B
                    outputData[index + 3] = data[index + 3]; // A
                }
            }
        }

        // Dibuja la imagen distorsionada en el canvas
        ctx.putImageData(outputImageData, 0, 0);
    }

    let loop = (timestamp) => {
        let progress = timestamp - lastRender;

        draw();

        lastRender = timestamp;
        window.requestAnimationFrame(loop);
    }

    init();

	window.clearCanvas = () => {		
        //world.figures = [];
	}
}
