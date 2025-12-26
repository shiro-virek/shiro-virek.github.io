{
    const globals = {
        random: null
    };

    const config = {
        randomize: true,
    };    

    let init = () => {
		globals.random = Objects.getRandomObject();
        if (config.randomize) randomize();
        initCanvas();
        addEvents();
        window.requestAnimationFrame(loop);
    }

    let addEvents = () => {
    }

    let randomize = () => {
    }
    
    window.draw = () => {
        drawBackground(ctx, canvas);
    }

    window.trackMouse = (x, y) => {
        if (clicking) {  

        }
    }
    
    window.clearCanvas = () => {
		Sound.error();
    }

	window.magic = () => {  
		Sound.error();
	}

    window.upload = (e) => {
		Sound.error();        
    }

    init();
}