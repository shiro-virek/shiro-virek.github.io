{        
    const globals = {
        random: null,
        world: null,
    };

    const config = {
    };    

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

        let toggleRotation = () => {
            globals.world.rotationMode = globals.world.rotationMode == 1 ? 0 : 1;
        }
        Browser.addButton("btnToggleRotation", "🔄", toggleRotation);
        
        let changeFigure = () => {
            globals.world.figureInfo = figureTypes[globals.random.nextInt(0, figureTypes.length - 1)];
        }
        Browser.addButton("btnChangeFigure", "🔴", changeFigure);
    }

    let randomize = () => {
		globals.random = Objects.getRandomObject();
    }

    let init = () => {
        initCanvas();
        randomize();
        globals.world = new ThreeDWorld(globals.random);
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

    window.trackMouse = (x, y) => {        
        if (clicking) {
            if (globals.world.rotationMode) {    
                globals.world.cameraRotationZ += movX * 0.1; 
                globals.world.cameraRotationX += movY * 0.1; 

                const maxPitch = 89;
                if (globals.world.cameraRotationX > maxPitch) globals.world.cameraRotationX = maxPitch;
                if (globals.world.cameraRotationX < -maxPitch) globals.world.cameraRotationX = -maxPitch;
                
            } else {               
                globals.world.figures.forEach(figure => {
                    figure.rotateX(movY);
                    figure.rotateY(movX);
                });
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
