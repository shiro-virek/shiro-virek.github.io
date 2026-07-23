{
    const globals = {
        random: null,
        world: null,
    };

    const config = {
        randomize: true,
        rainbow: true,
        animateRainbow: true,
        animateCamera: true,
        colorShift: 0,
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

        let side = 40;
        let rows = Math.floor(Math.max(width, height) / 70);
        let columns = Math.floor(Math.max(width, height) / 70);
        let offset = ((rows - 1) * side) / 2;
        for (let x = 0; x < rows; x++){
            for (let z = 0; z < columns; z++){            
                let figure = globals.world.addFigureAt(x * side - offset, 50, z * side - offset);
                figure.direction = globals.random.nextBool() ? -1 : 1;
                figure.yOffset = globals.random.nextRange(-15,15);
                figure.maxY = 30;
                figure.minY = -30;
                if (config.rainbow){
                    let hue = config.colorShift + Numbers.scale(x * z, 0, rows * columns, 0, 360);
                    if (hue > 0) hue = 360 - hue;
                    figure.hue = hue;
                }
            }
        }
    }

    let addEvents = () => {
    }

    let randomize = () => {
        config.colorShift = globals.random.nextInt(0, 360);
        config.rainbow = globals.random.nextBool();
        config.animateRainbow = globals.random.nextBool();
        config.animateCamera = globals.random.nextBool();
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
    
    window.draw = (delta) => {
        let factor = delta / FRAME_TIME;
        drawBackground(ctx, canvas);
        
        globals.world.figures.forEach(fig => {
            if (fig.yOffset > fig.maxY) {
                fig.direction = -1;
            }
            if (fig.yOffset < fig.minY) {
                fig.direction = 1;
            }
            fig.yOffset += fig.direction * 2 * factor;
            fig.translateY(fig.direction * 2 * factor);

            if (config.animateRainbow){
                fig.hue += 1;
                if (fig.hue > 360) fig.hue = 0;
            } 
        });

        if (config.animateCamera){
            let orbitAngle = performance.now() * 0.0005;
            let radius = 700;
            globals.world.cameraX = Math.cos(orbitAngle) * radius;
            globals.world.cameraZ = Math.sin(orbitAngle) * radius;
            globals.world.cameraRotationZ = orbitAngle * 180 / Math.PI + 90;
        }

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