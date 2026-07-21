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
        globals.world = new ThreeDWorld(width, height, globals.random, Drawing.drawLine, Drawing.drawDot, drawFace);

        globals.world.cameraMode = 1;
        globals.world.cameraX = 0;
        globals.world.cameraY = -200; 
        globals.world.cameraZ = 0;

        globals.world.cameraRotationX = -10;
        globals.world.cameraRotationZ = 0;

        globals.world.drawFigureFaces = true;
        globals.world.drawFigureEdges = false;
        globals.world.drawFigureVertices = false;

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