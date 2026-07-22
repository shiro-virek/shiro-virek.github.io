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

        initCanvas();
        addEvents();
        window.requestAnimationFrame(loop);        

        let side = 100;
        let rows = Math.floor(globals.world.width / side) + 1;
        let columns = Math.floor(globals.world.height / side) + 1;
        for (let x = 0; x < rows; x++){
            for (let z = 0; z < columns; z++){            
                let figure = globals.world.addFigure(x * side, z * side);
                figure.direction = globals.random.nextBool() ? -1 : 1;
                figure.maxZ = globals.random.nextInt(485, 500);
                figure.minZ = globals.random.nextInt(465, 485);
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
            if (averageZ > fig.maxZ) {
                fig.direction = -1;
                fig.maxZ = globals.random.nextInt(485, 500);
            }
            if  (averageZ < fig.minZ){
                fig.direction = 1;
                fig.minZ = globals.random.nextInt(465, 485);
            }

            fig.translateZ(fig.direction * 2);
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