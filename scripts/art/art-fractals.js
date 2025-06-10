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
