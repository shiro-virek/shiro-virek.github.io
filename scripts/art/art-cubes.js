{
    const globals = {
        random: null,
        world: null,
    };

    const config = {
        randomize: true,
    };    

    let drawFace = (vertices, lightness, hue) => {
  
    }

    let init = () => {
		globals.random = Objects.getRandomObject();
        if (config.randomize) randomize();
        globals.world = new FPSWorld(width, height, globals.random, Drawing.drawLine, Drawing.drawDot, drawFace);

        initCanvas();
        addEvents();
        window.requestAnimationFrame(loop);        

        globals.world.addFigure(500, 500);
    }

    let addEvents = () => {
    }

    let randomize = () => {
    }
    
    window.draw = () => {
        drawBackground(ctx, canvas);
        globals.world.draw();
    }

    window.trackMouse = (x, y) => {
        if (clicking) {  

        }
    }
    
    window.clearCanvas = () => {
		Sound.error();
    }

    init();
}