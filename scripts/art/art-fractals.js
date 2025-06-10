{    
    const globals = {
        random: null
    };

    const config = {
        randomize: true,
    };    
    
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
        Pixels.setSinglePixel(ctx, 20, 20, '#FFF');
        Pixels.setSinglePixel2(ctx, 30, 30, '#FFF');

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        Pixels.setPixelBatch(ctx, data, 40, 40, 255, 255, 255);

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
