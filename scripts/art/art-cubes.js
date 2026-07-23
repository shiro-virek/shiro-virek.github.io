{
    const globals = {
        random: null,
        world: null,
    };

    const config = {
        randomize: true,
    };    

    let init = () => {
		globals.random = Objects.getRandomObject();
        if (config.randomize) randomize();
        globals.world = new OpenWorld(width, height, globals.random, Drawing.drawLine, Drawing.drawDot, drawFace);

        globals.world.cameraY = -300;
        globals.world.cameraZ = -700;
        globals.world.cameraRotationX = -30;

        initCanvas();
        addEvents();
        window.requestAnimationFrame(loop);        

        let side = 100;
        let rows = 7;
        let columns = 7;
        let offset = ((rows - 1) * side) / 2;
        for (let x = 0; x < rows; x++){
            for (let z = 0; z < columns; z++){            
                let figure = globals.world.addFigureAt(x * side - offset, 50, z * side - offset);
                figure.direction = globals.random.nextBool() ? -1 : 1;
                figure.mayY = globals.random.nextInt(50, 100);
                figure.minY = globals.random.nextInt(0, 50);
            }
        }
    }

    let addEvents = () => {
    }

    let randomize = () => {
    }

    let drawFace = (vertices, lightness, hue, alpha) => {
        const color = `hsla(${hue}, 100%, ${lightness}%, ${alpha})`;
        
        ctx.beginPath();
        let screenPoint = globals.world.worldToScreen(vertices[0]);
        ctx.moveTo(screenPoint[0], screenPoint[1]);
        
        for (let i = 1; i < vertices.length; i++) {
            screenPoint = globals.world.worldToScreen(vertices[i]);
            ctx.lineTo(screenPoint[0], screenPoint[1]);
        }
        
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.strokeStyle = color; 
        ctx.lineWidth = 1;    
        ctx.fill();
        ctx.stroke();
    }
    
    window.draw = () => {
        drawBackground(ctx, canvas);
        
        globals.world.figures.forEach(fig => {
            let averageZ = fig.getAverageZ();
            if (averageZ > fig.mayY) {
                fig.direction = -1;
                fig.mayY = globals.random.nextInt(50, 100);
            }
            if  (averageZ < fig.minY){
                fig.direction = 1;
                fig.minY = globals.random.nextInt(0, 50);
            }

            fig.translateY(fig.direction * 2);
        }); 
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