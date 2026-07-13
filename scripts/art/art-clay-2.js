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
        light: [-0.6, -0.6, 0.5],
        radius: 30,
        sign: -1,
        mirror: false,
        r: 255,
        g: 255,
        b: 255,
        tool: 0, // 0: draw, 1: diffuse, 2: move light
    };    

    function drawDepression(cx, cy) {
        for (let y = -config.radius; y <= config.radius; y++) {
            for (let x = -config.radius; x <= config.radius; x++) {
                const dist = Math.sqrt(x * x + y * y);
                if (dist < config.radius) {
                    const falloff = Math.cos((dist / config.radius) * Math.PI) * 0.5 + 0.5;
                    const idx = (cy + y) * width + (cx + x);
                    if (cx + x >= 0 && cx + x < width && cy + y >= 0 && cy + y < height) {
                        globals.heightMap[idx] -= falloff * 2.5  * config.sign;
                    }
                }
            }
        }
    }

    let init = () => {
        initCanvas();
        addEvents();

		globals.random = Objects.getRandomObject();
        if (config.randomize) randomize();
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

        addSpecialControls();
    }

    let addEvents = () => {
    }

    let randomize = () => {
        config.radius = globals.random.nextInt(20, 50);
        config.sign = globals.random.nextBool() ? 1 : -1;
        config.r = globals.random.nextInt(0, 255);
        config.g = globals.random.nextInt(0, 255);
        config.b = globals.random.nextInt(0, 255);  
    }

    let addSpecialControls = () => {
        let grow = () => {
            config.radius += 5;
        }
        Browser.addButton("btnGrow", "+", grow);

        let shrink = () => {
            config.radius -= 5;
        }
        Browser.addButton("btnShrink", "-", shrink);

        let toggleMirror = () => {
            config.mirror = !config.mirror;
        }
        Browser.addButton("btnToggleMirror", "👯", toggleMirror);

        let setMountainTool = () => {
            config.tool = 0;
            config.sign = -1;
        }
        Browser.addButton("btnSetMountainTool", "⛰️", setMountainTool);

        let setValleyTool = () => {
            config.tool = 0;
            config.sign = 1;
        }
        Browser.addButton("btnSetValleyTool", "🕳️", setValleyTool);

        let diffuse = () => {
            diffuseHeightMap();
        }
        Browser.addButton("btnDiffuse", "💧", diffuse);

        let setDiffuseTool = () => {
            config.tool = 1;
        }
        Browser.addButton("btnSetDiffuseTool", "💧", setDiffuseTool);

        let setMoveLightTool = () => {    
            config.tool = 2;
        }
        Browser.addButton("btnSetMoveLightTool", "💡", setMoveLightTool);
 
    }


    let diffuseHeightMapClick = (cx, cy) => {
        const copy = globals.heightMap.slice();
        for (let y = -config.radius; y <= config.radius; y++) {
            for (let x = -config.radius; x <= config.radius; x++) {
                const dist = Math.sqrt(x * x + y * y);
                if (dist < config.radius) {
                    const idx =  (cy + y) * width + (cx + x);

                    if (cx + x >= 0 && cx + x < width && cy + y >= 0 && cy + y < height) {
                        const sum =
                            copy[idx] +
                            copy[idx - 1] +
                            copy[idx + 1] +
                            copy[idx - width] +
                            copy[idx + width];
                            globals.heightMap[idx] = sum / 5 * 0.9; 
                    }
                }
            }
        }
    }

    let moveLight = (cx, cy) => {
       lightX = cx - width / 2;
       lightY = cy - height / 2;
       lightZ = 100;
       const len = Math.hypot(lightX, lightY, lightZ);
       config.light[0] = lightX / len;
       config.light[1] = lightY / len;
       config.light[2] = lightZ / len;
    }

    let diffuseHeightMap = () => {
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
                    globals.heightMap[idx] = sum / 5 * 0.9; 
            }
        }
    }
    
    window.draw = () => {
        drawBackground(ctx, canvas);

        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        //const color = Color.parseColor(Browser.getCssVariable("--main-color"));
        globals.baseImageData = Drawing.createFlatColor(ctx, config.r, config.g, config.b);
                
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

    window.trackMouse = (x, y) => {
        if (clicking) {  
            //let points = Trigonometry.bresenhamLine(lastPosX, lastPosY, x, y);
            let points = Trigonometry.pointsInterpolation(lastPosX, lastPosY, x, y, 10);
            for (const p of points) {  
                switch (config.tool) {
                    case 0: 
                        drawDepression(p.x, p.y);    
                        if (config.mirror) drawDepression(width-p.x, p.y);     
                        break;
                    case 1: //diffuse
                        diffuseHeightMapClick(p.x, p.y);  
                        break;
                    case 2: //move light
                        moveLight(p.x, p.y);
                        break;
                }              
            }
        }
    }

    window.clearCanvas = () => {		
        globals.heightMap = new Float32Array(width * height);
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