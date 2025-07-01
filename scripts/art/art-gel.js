{
    const globals = {
        random: null,
        heightMap: new Float32Array(width * height),
        lightLen: null,
        img: new Image(),
        baseImageData: null,
    };

    const config = {
        randomize: true,
        damping: 0.90,
        light: [-0.6, -0.6, 0.5],
        radius: 30,
    };    

    function drawDepression(cx, cy) {
        for (let y = -config.radius; y <= config.radius; y++) {
            for (let x = -config.radius; x <= config.radius; x++) {
                const dist = Math.sqrt(x * x + y * y);
                if (dist < config.radius) {
                    const falloff = Math.cos((dist / config.radius) * Math.PI) * 0.5 + 0.5;
                    const idx = (cy + y) * width + (cx + x);
                    if (cx + x >= 0 && cx + x < width && cy + y >= 0 && cy + y < height) {
                        globals.heightMap[idx] -= falloff * 2.5;
                    }
                }
            }
        }
    }

    function diffuseHeightMap() {
        const copy = globals.heightMap.slice();
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
            const idx = y * width + x;
            const sum =
                copy[idx] +
                copy[idx - 1] +
                copy[idx + 1] +
                copy[idx - width] +
                copy[idx + width];
                globals.heightMap[idx] = sum / 5 * config.damping; 
            }
        }
    }

    let init = () => {
        initCanvas();
        addEvents();

		globals.random = Objects.getRandomObject();
        if (config.randomize) randomize();

        globals.img.src = '../assets/Picture1.jpg';  
        globals.img.crossOrigin = "Anonymous";

        globals.img.onload = () => {
            const { newImgHeight, newImgWidth, newOriginX, newOriginY } = Screen.adaptImageToScreen(globals.img, canvas);
            
            ctx.drawImage(globals.img, newOriginX, newOriginY, newImgWidth, newImgHeight);

            globals.baseImageData = ctx.getImageData(0, 0, width, height);
            requestAnimationFrame(loop);
        };

        globals.lightLen = Math.hypot(...config.light);
        for (let i = 0; i < 3; i++) config.light[i] /= globals.lightLen;
        window.requestAnimationFrame(loop);
    }

    let addEvents = () => {
    }

    let randomize = () => {
        config.damping = globals.random.nextRange(0.3, 0.99);
        config.radius = globals.random.nextInt(20, 50);
    }
    
    let draw = () => {
        drawBackground(ctx, canvas);

        diffuseHeightMap();

        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
                
        if (!globals.baseImageData) return;

        const base = globals.baseImageData.data;

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = y * width + x;
                const hL = globals.heightMap[idx - 1];
                const hR = globals.heightMap[idx + 1];
                const hU = globals.heightMap[idx - width];
                const hD = globals.heightMap[idx + width];

                const nx = -(hR - hL);
                const ny = -(hD - hU);
                const nz = 1.0;

                const length = Math.hypot(nx, ny, nz);
                const n = [nx / length, ny / length, nz / length];

                let dot = n[0]*config.light[0] + n[1]*config.light[1] + n[2]*config.light[2];
                dot = Math.max(0, Math.min(1, dot));

                const c = Math.floor(dot * 255);
                const i = (y * width + x) * 4;
                data[i]     = base[i] * dot;
                data[i + 1] = base[i + 1] * dot;
                data[i + 2] = base[i + 2] * dot;
                data[i + 3] = 255;
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }

    let loop = (timestamp) => {
        let progress = timestamp - lastRender;

        draw();

        lastRender = timestamp;
        window.requestAnimationFrame(loop);
    }

    window.trackMouse = (x, y) => {
        if (clicking) {  
            //let points = Trigonometry.bresenhamLine(lastPosX, lastPosY, x, y);
            let points = Trigonometry.pointsInterpolation(lastPosX, lastPosY, x, y, 10);
            for (const p of points) {                
                drawDepression(p.x, p.y); 
            }
        }
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