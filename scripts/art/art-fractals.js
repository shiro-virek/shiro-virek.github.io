{    
    const globals = {
        random: null
    };

    const config = {
        randomize: true,
    };    

    let isInMandelbrotSet = (rc, ic, maxIterations = 50) => {
        let zr = 0;
        let zi = 0;
        
        for (let iterations = 0; iterations < maxIterations; iterations++) {
            const zrNew = zr * zr - zi * zi + rc;
            const ziNew = 2 * zr * zi + ic;
            
            zr = zrNew;
            zi = ziNew;
            
            if (zr * zr + zi * zi > 4) {
                return false;
            }
        }
        
        return true;
    }


    let isInJuliaSet = (zr, zi, cr, ci, maxIterations = 50) => {
        for (let i = 0; i < maxIterations; i++) {
            const zrNew = zr * zr - zi * zi + cr;
            const ziNew = 2 * zr * zi + ci;

            zr = zrNew;
            zi = ziNew;

            if (zr * zr + zi * zi > 4) {
                return false;
            }
        }

        return true;
    }


    let init = () => {
		globals.random = Objects.getRandomObject();
        initCanvas();
        addEvents();
        window.requestAnimationFrame(loop);
    }

    let addEvents = () => {

        canvas.addEventListener('click', e => {
            
        }, false);
    }

    let randomize = () => {
    
    }

    let draw = () => {
        drawBackground(ctx, canvas);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
            
        const scale = 0.005;
        const offsetX = -width * scale / 2;
        const offsetY = -height * scale / 2;

        const cr = -0.7; 
        const ci = 0.27; 
        
        for (let x=0; x < width; x++){
            for (let y=0; y < height; y++){
                const rc = x * scale + offsetX;
                const ic = y * scale + offsetY;

                const zr = x * scale + offsetX;
                const zi = y * scale + offsetY;

                //if (isInMandelbrotSet(rc, ic)){
                if (isInJuliaSet(zr, zi, cr, ci)){
                    Pixels.setPixelBatch(ctx, data, x, y, 255, 255, 255);
                }else{
                    Pixels.setPixelBatch(ctx, data, x, y, 0, 0, 0);
                }                
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

    init();

	window.clearCanvas = () => {  
	}
}
