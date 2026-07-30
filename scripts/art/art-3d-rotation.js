{        
    const globals = {
        random: null,
        world: null,
        selectedFigure: null,
        selectedColor: "hsl(0, 100%, 50%)",
    };

    const config = {
        tool: 10, 
        displayMode: 1,
    };  

    let drawFace = (vertices, lightness, hue) => {
        let color = `hsl(${hue}, ${100}%, ${lightness}%)`;
        
        ctx.beginPath();
        let p = globals.world.worldToScreen(vertices[0]);
        ctx.moveTo(p[0], p[1]);
        
        for (let i = 1; i < vertices.length; i++) {
            p = globals.world.worldToScreen(vertices[i]);
            ctx.lineTo(p[0], p[1]);
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
                const viewVertices = faceIndices.map(i => 
                    globals.world.applyCameraTransform(figure.vertices[i])
                );

                if (!figure.shouldDrawFace(viewVertices)) return;

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

    let setZoom = (delta) => {
        let r = globals.world._orbitRadius;
        if (r === undefined) return;
        r += delta;
        if (r < 100) r = 100;
        if (r > 3000) r = 3000;
        globals.world._orbitRadius = r;
        globals.world.orbitCamera(0, 0);
    }

    let addSpecialControls = () => {
        let grow = () => setZoom(-50);
        Browser.addButton("btnGrow", "+", grow);

        let shrink = () => setZoom(50);
        Browser.addButton("btnShrink", "-", shrink);

        let _figureIndex = 0;
        let changeFigure = () => {
            config.tool = 10;
            Browser.setInfo("Add figure tool");       
            _figureIndex = (_figureIndex + 1) % primitives.length;
            globals.world.primitive = primitives[_figureIndex];
            document.getElementById('btnChangeFigure').textContent = globals.world.primitive.icon;
       }
        Browser.addButton("btnChangeFigure", globals.world.primitive.icon, changeFigure);
        
        let cycleCameraTool = () => {
            const labels = ['🎥', '💡'];
            const tools = [1, 2];
            let current = tools.indexOf(config.tool);
            if (current === -1 || current === 1) current = 0;
            else current++;
            config.tool = tools[current];
            document.getElementById('btnCycleCameraTool').textContent = labels[current];
            Browser.setInfo(current === 0 ? "Rotate camera tool" : "Move light tool");
        };
        Browser.addButton('btnCycleCameraTool', '🔄', cycleCameraTool);

        let cycleTransformTool = () => {
            const labels = ['📐', '↩️'];
            const tools = [3, 4];
            let current = tools.indexOf(config.tool);
            if (current === -1 || current === 1) current = 0;
            else current++;
            config.tool = tools[current];
            document.getElementById('btnCycleTransformTool').textContent = labels[current];
            Browser.setInfo(current === 0 ? "Scale figure tool" : "Rotate figure tool");
        };
        Browser.addButton('btnCycleTransformTool', '📐', cycleTransformTool);

        let cycleMoveTool = () => {
            const labels = ['X', 'Y', 'Z'];
            const tools = [5, 6, 7];
            let current = tools.indexOf(config.tool);
            if (current === -1 || current === 2) current = 0;
            else current++;
            config.tool = tools[current];
            document.getElementById('btnCycleMoveTool').textContent = labels[current];
            Browser.setInfo(`Move ${labels[current]} tool`);
        };
        Browser.addButton('btnCycleMoveTool', 'X', cycleMoveTool);

        let setDeleteTool = () => {    
            config.tool = 8;
            Browser.setInfo("Delete tool");
        }
        Browser.addButton("btnSetDeleteTool", "🗑", setDeleteTool);

        let downloadScene = () => {
            let data = {
                version: 1,
                camera: {
                    x: globals.world.cameraX, y: globals.world.cameraY, z: globals.world.cameraZ,
                    rotationX: globals.world.cameraRotationX, rotationZ: globals.world.cameraRotationZ
                },
                world: {
                    lightDirection: globals.world.lightDirection,
                    FOV: globals.world.FOV,
                    drawFigureEdges: globals.world.drawFigureEdges,
                    drawFigureFaces: globals.world.drawFigureFaces,
                    drawFigureVertices: globals.world.drawFigureVertices,
                    floorHue: globals.world.floorHue,
                    skyShift: globals.world.skyShift
                },
                primitive: globals.world.primitive,
                figures: globals.world.figures.map(f => ({
                    vertices: f.vertices, edges: f.edges, faces: f.faces,
                    hue: f.hue, solid: f.solid, doubleSided: f.doubleSided,
                    infinite: f.infinite, breakable: f.breakable,
                    rotationAccumX: f.rotationAccumX, rotationAccumY: f.rotationAccumY
                }))
            };
            let a = document.createElement('a');
            a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
            a.download = 'scene.json';
            a.click();
            URL.revokeObjectURL(a.href);
            Browser.setInfo("Scene downloaded");
        };
        Browser.addButton("btnDownloadScene", "💾", downloadScene);

        let uploadScene = () => {
            let input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = e => {
                let file = e.target.files[0];
                if (!file) return;
                let reader = new FileReader();
                reader.onload = event => {
                    try {
                        let data = JSON.parse(event.target.result);
                        if (!data.figures || !data.camera) { Browser.setInfo("Invalid scene file"); return; }
                        globals.world.figures = [];
                        data.figures.forEach(fd => {
                            let figure = new Figure(globals.world);
                            figure.vertices = fd.vertices;
                            figure.edges = fd.edges;
                            figure.faces = fd.faces;
                            figure.hue = fd.hue;
                            figure.solid = fd.solid !== undefined ? fd.solid : true;
                            figure.doubleSided = fd.doubleSided || false;
                            figure.infinite = fd.infinite || false;
                            figure.breakable = fd.breakable || false;
                            figure.rotationAccumX = fd.rotationAccumX || 0;
                            figure.rotationAccumY = fd.rotationAccumY || 0;
                            figure.setupCollision();
                            globals.world.figures.push(figure);
                        });
                        if (data.camera) {
                            globals.world.cameraX = data.camera.x;
                            globals.world.cameraY = data.camera.y;
                            globals.world.cameraZ = data.camera.z;
                            globals.world.cameraRotationX = data.camera.rotationX;
                            globals.world.cameraRotationZ = data.camera.rotationZ;
                        }
                        if (data.world) {
                            if (data.world.lightDirection) globals.world.lightDirection = data.world.lightDirection;
                            if (data.world.FOV) globals.world.FOV = data.world.FOV;
                            if (data.world.drawFigureEdges !== undefined) globals.world.drawFigureEdges = data.world.drawFigureEdges;
                            if (data.world.drawFigureFaces !== undefined) globals.world.drawFigureFaces = data.world.drawFigureFaces;
                            if (data.world.drawFigureVertices !== undefined) globals.world.drawFigureVertices = data.world.drawFigureVertices;
                            if (data.world.floorHue !== undefined) globals.world.floorHue = data.world.floorHue;
                            if (data.world.skyShift !== undefined) globals.world.skyShift = data.world.skyShift;
                        }
                        if (data.primitive) globals.world.primitive = data.primitive;
                        globals.selectedFigure = null;
                        Browser.setInfo("Scene loaded");
                    } catch (err) { Browser.setInfo("Error loading scene"); }
                };
                reader.readAsText(file);
            };
            input.click();
        };
        Browser.addButton("btnUploadScene", "📂", uploadScene);

        let setDisplayMode = () => {    
            config.displayMode++;
            if (config.displayMode == 5) config.displayMode = 1;

            globals.world.drawFigureVertices = config.displayMode == 1 || config.displayMode == 3;
            globals.world.drawFigureEdges =  config.displayMode == 2 || config.displayMode == 3;
            globals.world.drawFigureFaces = config.displayMode == 4;

            Browser.setInfo("Change display mode tool");
        }
        Browser.addButton("btnSetDisplayMode", "⌗", setDisplayMode);

        let toggleCanvasPanel = () => {
            config.tool = 9;
            Browser.setInfo("Color tool");

            let panel = document.getElementById('floatCanvasPanel');
            if (panel) {
                panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
                return;
            }

            let paletteWidth = 200;
            let paletteHeight = 200;
            panel = document.createElement('div');
            panel.id = 'floatCanvasPanel';
            Object.assign(panel.style, {
                position: 'fixed',
                right: '60px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: `${paletteWidth}px`,
                height: `${paletteHeight}px`,
                background: 'rgba(30,30,30,0.95)',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: '9999',
                overflow: 'hidden'
            });

            const c = document.createElement('canvas');
            c.id = 'miniCanvas';
            c.width = paletteWidth;
            c.height = paletteHeight;
            Object.assign(c.style, {
                width: `${paletteWidth}px`,
                height: `${paletteHeight}px`,
                display: 'block'
            });
            panel.appendChild(c);
            document.body.appendChild(panel);

            let getColor = (x, y) => {
                let hue = Numbers.scale(x, 0, paletteWidth, 0, 360)    
                let lightness = Numbers.scale(y, 0, paletteHeight, 0, 100)             
                let color = `hsl(${hue}, 100%, ${lightness}%)`;
                return color;
            }

            const ctx = c.getContext("2d");
            for (let x = 0; x < paletteWidth; x++) {
                for (let y = 0; y < paletteHeight; y++) { 
                    Drawing.drawSquare(ctx, x, y, 1, 0, getColor(x, y))
                }
            }

            let miniCanvas = document.getElementById("miniCanvas");
            var rect = miniCanvas.getBoundingClientRect();
            miniCanvas.addEventListener('click', function(event) {
                var x = event.clientX - rect.left;
                var y = event.clientY - rect.top;
               
                globals.selectedColor = getColor(x, y);

                panel.style.display = 'none';
            }, false);
        };
        Browser.addButton('btnCanvasToggle', '🎨', toggleCanvasPanel);
    }

    let randomize = () => {
		globals.world.primitive = primitives[globals.random.nextInt(0, primitives.length - 1)]
    }

    let init = () => {
        initCanvas();        
        globals.random = Objects.getRandomObject();
        globals.world = new Open3DWorld(width, height, globals.random, Drawing.drawLine, Drawing.drawDot, drawFace);
        globals.world.cameraY = -300;
        globals.world.cameraZ = -700;
        globals.world.cameraRotationX = -30;

        globals.world.orbitCamera(0, 0);
        randomize();
        addEvents();
        window.requestAnimationFrame(loop)

        addSpecialControls();
        Browser.setInfo("Add figure tool");
    }

    let getHue = (hslStr) => {
        const match = hslStr.match(/[\d.]+/);
        return match ? parseFloat(match[0]) : null;
    };

    let handleClick = (x, y) => {    
        switch (config.tool) {      
            case 9:
                if (globals.selectedFigure) {
                    globals.selectedFigure.hue = getHue(globals.selectedColor);
                }
                break;                
            case 10:
                globals.world.addFigure(x, y, globals.world.primitive, getHue(globals.selectedColor));  
                break;
            default:
                break;
        }
    } 
    
    let addEvents = () => {
        canvas.addEventListener('mousedown', function (e) {           
            selectFigure(e.offsetX, e.offsetY);
		});

        canvas.addEventListener('touchstart', function (e) {
            const rect = canvas.getBoundingClientRect();
            selectFigure(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top);
		}, { passive: true });

        canvas.addEventListener('mouseup', function (e) {
            handleDeleteFigure();
            globals.selectedFigure = null;
		});

        canvas.addEventListener('click', function (e) {
            if (globals._touchUsed) {
                globals._touchUsed = false;
                return;
            }
            if (!mouseMoved && !figureSelectedOnMousedown)
                handleClick(e.offsetX, e.offsetY);   
		});

		canvas.addEventListener('touchend', e => {
            globals._touchUsed = true;
            handleDeleteFigure();
            if (!mouseMoved) {
                const rect = canvas.getBoundingClientRect();
                const x = e.changedTouches[0].clientX - rect.left;
                const y = e.changedTouches[0].clientY - rect.top;
                handleClick(x, y);         
            }
		}, false);  
    }

    let handleDeleteFigure = () => {
        if (config.tool == 8 && globals.selectedFigure) {
            let index = globals.world.figures.indexOf(globals.selectedFigure);
            if (index > -1) globals.world.figures.splice(index, 1);
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
                case 1:              
                    globals.world.orbitCamera(movX / 3, -movY / 3);
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
