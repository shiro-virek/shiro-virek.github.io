{        
    const globals = {
        random: null,
        world: null,
    };

    const config = {
        tool: 1, // 0: rotate, 1: rotate2, 2: move light
    };  

    let drawFace = (vertices, lightness, hue) => {
        let color = `hsl(${hue}, ${100}%, ${lightness}%)`;
        
        ctx.beginPath();            
        ctx.moveTo(vertices[0][0], vertices[0][1]);
        
        for (let i = 1; i < vertices.length; i++) {
            ctx.lineTo(vertices[i][0], vertices[i][1]);
        }
        ctx.closePath();
        
        ctx.fillStyle = color;
        ctx.strokeStyle = color; 
        ctx.fill();
        ctx.stroke();
    }

    let addSpecialControls = () => {
        let grow = () => {
            globals.world.cameraZ -= 10;
            if (globals.world.cameraZ < 100) globals.world.cameraZ = 100;
        }
        Browser.addButton("btnGrow", "+", grow);

        let shrink = () => {
            globals.world.cameraZ += 10;
            if (globals.world.cameraZ < 100) globals.world.cameraZ = 100;
        }
        Browser.addButton("btnShrink", "-", shrink);

        let changeFigure = () => {
            globals.world.primitive = primitives[globals.random.nextInt(0, primitives.length - 1)];
        }
        Browser.addButton("btnChangeFigure", "🔴", changeFigure);
        
        let setRotationTool = () => {    
            config.tool = 0;
        }        
        Browser.addButton("btnSetRotationTool", "🔄", setRotationTool);

        let setRotation2Tool = () => {    
            config.tool = 1;
        }
        Browser.addButton("btnSetRotation2Tool", "🔄", setRotation2Tool);

        let setMoveLightTool = () => {    
            config.tool = 2;
        }
        Browser.addButton("btnSetMoveLightTool", "💡", setMoveLightTool);
    }

    let randomize = () => {
		globals.world.primitive = primitives[globals.random.nextInt(0, primitives.length - 1)]
        globals.world.drawFigureEdges = globals.random.nextBool();
        globals.world.drawFigureVertices = globals.random.nextBool();
        globals.world.drawFigureFaces = !(globals.world.drawFigureEdges || globals.world.drawFigureVertices);
    }

    let init = () => {
        initCanvas();        
        globals.random = Objects.getRandomObject();
        globals.world = new ThreeDWorld(width, height, globals.random, Drawing.drawLine, Drawing.drawDot, drawFace);
        randomize();
        addEvents();
        window.requestAnimationFrame(loop)

        addSpecialControls();
    }

    let addEvents = () => {
		canvas.addEventListener('touchend', e => {
            if (!mouseMoved)
                globals.world.addFigure(e.offsetX, e.offsetY);
		}, false);  

		canvas.addEventListener('click', function (e) {
            if (!mouseMoved)
                globals.world.addFigure(e.offsetX, e.offsetY);
		});
    }

    let moveLight = (cx, cy) => {
       lightX = cx - width / 2;
       lightY = cy - height / 2;
       lightZ = 100;
       const len = Math.hypot(lightX, lightY, lightZ);
       globals.world.lightDirection[0] = lightX / len;
       globals.world.lightDirection[1] = lightY / len;
       globals.world.lightDirection[2] = lightZ / len;
    }
    
    window.trackMouse = (x, y) => {        
        if (clicking) {
            switch (config.tool) {
                case 0:
                    globals.world.cameraRotationZ += movX * 0.1; 
                    globals.world.cameraRotationX += movY * 0.1; 

                    const maxPitch = 89;
                    if (globals.world.cameraRotationX > maxPitch) globals.world.cameraRotationX = maxPitch;
                    if (globals.world.cameraRotationX < -maxPitch) globals.world.cameraRotationX = -maxPitch;
                    break;
                case 1:              
                    globals.world.figures.forEach(figure => {
                        figure.rotateX(movY);
                        figure.rotateY(movX);
                    });
                    break;
                case 2: 
                    moveLight(width - x, height - y);
                    break;
                default:
                    break;
            }
        }
    }

    window.draw = () => {
        drawBackground(ctx, canvas);
        globals.world.draw();
    }

	window.clearCanvas = () => {		
        globals.world.figures = [];
	}

    init();    
}
