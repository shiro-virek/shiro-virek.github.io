{    
    const globals = {
        random: null,
        initialClickCx: 0,
        initialClickCy: 0,
    };

    const config = {
        randomize: true,
        mode: 1,
        pow: 2,
        maxIterations: 50,
        scale: 0.005,
        cr: -0.7,
        ci: 0.27,
        offsetX: 0,
        offsetY: 0,
        hue: 10,
        fractalFunctionIndex: 1,
        fractalFunctions: [mandelbrot, julia, tricorn, newton, burningShip, phoenix, magnetType1, nova, lambda],
        functionsWithTwoModes: [julia, phoenix, nova, lambda, magnetType1],
        drawFunctionIndex: 1,
        drawFunctions: [drawPaletteColor1, drawPaletteColor2, drawPaletteGrayscale1, drawPaletteGrayscale2, drawPaletteHue1, drawPaletteHue2],
    };    

    function drawPaletteColor1(value, data, x, y){
        newValue = Numbers.scale(value, 0, config.maxIterations, 0, 360);
        const { r: red, g: green, b: blue } = Color.hslToRgb(newValue, 100, 50);
        Pixels.setPixelBatch(ctx, data, x, y, red, green, blue);
    }

    function drawPaletteHue1(value, data, x, y){
        newValue = Numbers.scale(value, 0, config.maxIterations, 0, 50);
        const { r: red, g: green, b: blue } = Color.hslToRgb(config.hue, 100, newValue);
        Pixels.setPixelBatch(ctx, data, x, y, red, green, blue);
    }

    function drawPaletteGrayscale1(value, data, x, y){
        newValue = Numbers.scale(value, 0, config.maxIterations, 0, 255);
        Pixels.setPixelBatch(ctx, data, x, y, newValue, newValue, newValue);       
    }

    function drawPaletteColor2(value, data, x, y){
        newValue = Numbers.scale(value, 0, config.maxIterations, 360, 0);
        const { r: red, g: green, b: blue } = Color.hslToRgb(newValue, 100, 50);
        Pixels.setPixelBatch(ctx, data, x, y, red, green, blue);
    }

    function drawPaletteHue2(value, data, x, y){
        newValue = Numbers.scale(value, 0, config.maxIterations, 50, 0);
        const { r: red, g: green, b: blue } = Color.hslToRgb(config.hue, 100, newValue);
        Pixels.setPixelBatch(ctx, data, x, y, red, green, blue);
    }

    function drawPaletteGrayscale2(value, data, x, y){
        newValue = Numbers.scale(value, 0, config.maxIterations, 255, 0);
        Pixels.setPixelBatch(ctx, data, x, y, newValue, newValue, newValue);       
    }

    function mandelbrot(c, i){
        return Fractals.mandelbrot(c, i, config.maxIterations, config.pow);
    }

    function julia(c, i){
        return Fractals.julia(c, i, config.maxIterations, config.pow, config.cr, config.ci);
    }

    function tricorn(c, i){
        return Fractals.tricorn(c, i, config.maxIterations, config.pow, config.cr, config.ci);
    }

    function newton(c, i){
        return Fractals.newton(c, i, config.maxIterations, config.pow);
    }

    function burningShip(c, i){
        return Fractals.burningShip(c, i, config.maxIterations, config.pow);
    }

    function phoenix(c, i){
        return Fractals.phoenix(c, i, config.maxIterations, config.pow, config.cr, config.ci);
    }

    function lambda(c, i){
        return Fractals.lambda(c, i, config.maxIterations, config.pow, config.cr, config.ci);
    }

    function magnetType1(c, i){        
        return Fractals.magnetType1(c, i, config.maxIterations, config.pow, config.cr, config.ci);
    }

    function nova(c, i){
        return Fractals.nova(c, i, config.maxIterations, config.pow, config.cr, config.ci);
    }

    let init = () => {
		globals.random = Objects.getRandomObject();
        if (config.randomize) randomize();
        initCanvas();
        addEvents();
        config.offsetX = -width * config.scale / 2;
        config.offsetY = -height * config.scale / 2;
        window.requestAnimationFrame(loop);
    }

    let addEvents = () => {
		canvas.addEventListener('mousedown', function (e) {
            globals.initialClickCx = e.offsetX * config.scale + config.offsetX;
            globals.initialClickCy = e.offsetY * config.scale + config.offsetY;
		});

		canvas.addEventListener('touchstart', function (e) {
            globals.initialClickCx = e.changedTouches[0].pageX * config.scale + config.offsetX;
            globals.initialClickCy = e.changedTouches[0].pageY * config.scale + config.offsetY;
		});
    }

    let randomize = () => {
        config.fractalFunctionIndex = 8; //globals.random.nextInt(0, config.fractalFunctions.length - 1);
        config.drawFunctionIndex = globals.random.nextInt(0, config.drawFunctions.length - 1);
        config.pow = globals.random.nextInt(2, 5);   
        config.cr = globals.random.nextRange(-1, 1);  
        config.ci = globals.random.nextRange(-1, 1);  
        config.hue = globals.random.nextInt(0, 360);

        const fractalFunction = config.fractalFunctions[config.fractalFunctionIndex];
        if (config.functionsWithTwoModes.includes(fractalFunction))
            config.mode = globals.random.nextBool()
        else
            config.mode = 1;
    }
    
    window.draw = () => {
        drawBackground(ctx, canvas);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const fractalFunction = config.fractalFunctions[config.fractalFunctionIndex];
        const drawFunction = config.drawFunctions[config.drawFunctionIndex];

        for (let x=0; x < width; x++){
            for (let y=0; y < height; y++){
                const rc = x * config.scale + config.offsetX;
                const ic = y * config.scale + config.offsetY;
                
                let value = fractalFunction(rc, ic);
                
                drawFunction(value, data, x, y);
            }
        }     
        ctx.putImageData(imageData, 0, 0);
    }

    window.trackMouse = (x, y) => {
        if (clicking) {
            if (config.mode) {
                let delta = lastPosY - y;
                if (delta !== 0) {
                    const zoomFactor = 1 + (delta > 0 ? -0.1 : 0.1);
                    config.scale = config.scale * zoomFactor;

                    config.offsetX = globals.initialClickCx - initialClickX * config.scale;
                    config.offsetY = globals.initialClickCy - initialClickY * config.scale;
                }
            } else {
                config.cr = Numbers.scale(x, 0, width, -1, 1);
                config.ci = Numbers.scale(y, 0, height, -1, 1);
            }

            lastPosY = y;
        }
    }

	window.clearCanvas = () => {
		Sound.error();
	}

	window.magic = () => {  
        const fractalFunction = config.fractalFunctions[config.fractalFunctionIndex];
        if (config.functionsWithTwoModes.includes(fractalFunction)){
            config.mode = !config.mode;
            Sound.tada();
        }else{
            Sound.error();
        }
	}

    window.upload = () => {
		Sound.error();
    }

    init();
}
