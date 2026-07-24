{        
    const globals = {
        random: null,
        world: null,
        selectedFigure: null,
    };

    const config = {
        tool: 1, // 0: rotate, 1: rotate2, 2: move light, 3: scale
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

    let figureSelectedOnMousedown = false;

    let selectFigure = (x, y) => {
        let minZ = Infinity;
        globals.selectedFigure = null;

        globals.world.figures.forEach((figure) => {
            figure.faces.forEach(faceIndices => {
                const rotatedVertices = faceIndices.map(i => 
                    globals.world.applyCameraRotation(figure.vertices[i])
                );

                if (!figure.shouldDrawFace(rotatedVertices)) return;

                const screenPoints = faceIndices.map(i => globals.world.worldToScreen(figure.vertices[i]));

                if (Trigonometry.isPointInPoly([x, y], screenPoints)) {
                    let avgZ = figure.getAverageZ();
                    if (avgZ < minZ) {
                        minZ = avgZ;
                        globals.selectedFigure = figure;                         
                    }
                }
            });
        });

        figureSelectedOnMousedown = globals.selectedFigure !== null;
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
            document.getElementById('btnChangeFigure').textContent = globals.world.primitive.icon;
       }
        Browser.addButton("btnChangeFigure", globals.world.primitive.icon, changeFigure);
        
        let setRotationTool = () => {       
            if (config.tool == 0){
                config.tool = 1;
                document.getElementById('btnSetRotationTool').textContent = '🔄';
                Browser.setInfo("Rotate camera 1 tool");
            }else{
                config.tool = 0;
                document.getElementById('btnSetRotationTool').textContent = '🔃';   
                Browser.setInfo("Rotate camera 2 tool"); 
            }                          
        }        
        Browser.addButton("btnSetRotationTool", "🔄", setRotationTool);

        let setMoveLightTool = () => {    
            config.tool = 2;
            Browser.setInfo("Move light tool");
        }
        Browser.addButton("btnSetMoveLightTool", "💡", setMoveLightTool);

        let setScaleTool = () => {    
            config.tool = 3;
            Browser.setInfo("Scale figure tool");
        }
        Browser.addButton("btnSetScaleTool", "📐", setScaleTool);

        let setRotateFigureTool = () => {    
            config.tool = 4;
            Browser.setInfo("Rotate figure tool");
        }
        Browser.addButton("btnSetRotateFigureTool", "↩️", setRotateFigureTool);

        let setMoveXTool = () => {    
            config.tool = 5;
            Browser.setInfo("Rotate Move X tool");
        }
        Browser.addButton("btnSetMoveXTool", "X", setMoveXTool);

        let setMoveYTool = () => {    
            config.tool = 6;
            Browser.setInfo("Move Y tool");
        }
        Browser.addButton("btnSetMoveYTool", "Y", setMoveYTool);

        let setMoveZTool = () => {    
            config.tool = 7;
            Browser.setInfo("Move Z tool");
        }
        Browser.addButton("btnSetMoveZTool", "Z", setMoveZTool);

        let setDeleteTool = () => {    
            config.tool = 8;
            Browser.setInfo("Delete tool");
        }
        Browser.addButton("btnSetDeleteTool", "🗑", setDeleteTool);
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
        Browser.setInfo("Rotate camera 1 tool");
    }

    let addEvents = () => {
        canvas.addEventListener('mousedown', function (e) {           
            selectFigure(e.offsetX, e.offsetY);
		});

        canvas.addEventListener('mouseup', function (e) {           
            globals.selectedFigure = null;
		});

		canvas.addEventListener('click', function (e) {
            handleDeleteFigure();

            if (!mouseMoved && !figureSelectedOnMousedown)
                globals.world.addFigure(e.offsetX, e.offsetY);   
		});

		canvas.addEventListener('touchend', e => {
            handleDeleteFigure();
            if (!mouseMoved)
                globals.world.addFigure(e.offsetX, e.offsetY);         
            globals.selectedFigure = null;            
		}, false);  
    }

    let handleDeleteFigure = () => {
        if (config.tool == 8 && globals.selectedFigure) {
            let index = globals.world.figures.indexOf(globals.selectedFigure);
            globals.world.figures.splice(index, 1);
        }
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
                case 3:
                    if (globals.selectedFigure) {
                        let factor = 1 + movY * 0.005;
                        if (factor > 0.01) globals.selectedFigure.scaleAroundCenter(factor);
                    }
                    break;
                case 4:
                    if (globals.selectedFigure) {
                        globals.selectedFigure.rotateYAroundCenter(movX);
                        globals.selectedFigure.rotateXAroundCenter(-movY);
                    }
                    break;
                case 5:
                    if (globals.selectedFigure) {
                        globals.selectedFigure.translateX(-movX);
                    }
                    break;
                case 6:
                    if (globals.selectedFigure) {
                        globals.selectedFigure.translateY(-movY);
                    }
                    break;
                case 7:
                    if (globals.selectedFigure) {
                        globals.selectedFigure.translateZ(movY);
                    }
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
