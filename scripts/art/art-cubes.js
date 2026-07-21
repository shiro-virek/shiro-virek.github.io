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
        globals.world = new OpenWorld(width, height, globals.random, Drawing.drawLine, Drawing.drawDot, drawFace);

        initCanvas();
        addEvents();
        window.requestAnimationFrame(loop);        

        let side = 100;
        let rows = Math.floor(globals.world.width / side);
        let columns = Math.floor(globals.world.height / side);
        for (let x = 0; x < rows; x++){
            for (let z = 0; z < columns; z++){            
                globals.world.addFigure(x * side, z * side);
            }
        }
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
            globals.world.rotate(-movY / 50, -movX / 50);
        }
    }
    
    window.clearCanvas = () => {
		Sound.error();
    }

    init();
}