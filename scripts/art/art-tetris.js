{
    const globals = {
        random: null,
        world: null,
        tetris: null,
    };

    const config = {
        randomize: true,
        side: 40,
    };    

    class Tetris {            
        static piece1 = [
            [1, 1, 1, 1]
        ];

        static piece2 = [
            [1, 1],
            [1, 1]
        ];

        static piece3 = [
            [0, 1, 0],
            [1, 1, 1]
        ];

        static piece4 = [
            [0, 1, 1],
            [1, 1, 0]
        ];

        static piece5 = [
            [1, 1, 0],
            [0, 1, 1]
        ];

        static piece6 = [
            [1, 1, 1],
            [1, 0, 0]
        ];

        static piece7 = [
            [1, 0, 0],
            [1, 1, 1]
        ];

        static pieces = [Tetris.piece1, Tetris.piece2, Tetris.piece3, Tetris.piece4, Tetris.piece5, Tetris.piece6, Tetris.piece7];

        update = (delta) => {
            this.fallAccum += this.fallSpeed * delta / 1000;

            let cells = Math.floor(this.fallAccum / config.side);

            if (cells > 0) {
                this.fallAccum %= config.side;
                globals.world.figures.forEach(element => {
                    element.translateY(cells * config.side);
                });
            }
        }

        newPiece = () => {
            let hue = globals.random.nextInt(0, 360);
            this.piece = Tetris.pieces[globals.random.nextInt(0, Tetris.pieces.length)];

            let offset = ((this.piece.length - 1) * config.side) / 2;
            let topY = yAtScreenY(-config.side, 0, 50);

            for (let x = 0; x < this.piece.length; x++){
                for (let y = 0; y < this.piece[x].length; y++){
                    if (this.piece[x][y] === 1){
                        //this.addBlock(x, y);
                        let figure = globals.world.addFigureAt(x * config.side - offset, y * config.side + topY, 50);
                        figure.hue = hue;
                    }
                }
            }

        }

        drawPiece = () => {
        }

        drawBoard = () => {

        }
        
        constructor () {
            this.board = [];
            this.fallSpeed = 120;
            this.fallAccum = 0;
            this.newPiece();
        }
        
    }

    let yAtScreenY = (screenY, worldX, worldZ) => {
        const w = globals.world;

        let angleZ = Trigonometry.sexagesimalToRadian(-w.cameraRotationZ);
        let sinZ = Math.sin(angleZ);
        let cosZ = Math.cos(angleZ);
        let z2 = (worldX - w.cameraX) * sinZ + (worldZ - w.cameraZ) * cosZ;

        let angleX = Trigonometry.sexagesimalToRadian(-w.cameraRotationX);
        let sinX = Math.sin(angleX);
        let cosX = Math.cos(angleX);

        let k = (screenY - height / 2) / w.FOV;

        let yRel = z2 * (sinX + k * cosX) / (cosX - k * sinX);

        return w.cameraY + yRel;
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
    

    let init = () => {
		globals.random = Objects.getRandomObject();
        if (config.randomize) randomize();
        
        globals.world = new Open3DWorld(width, height, globals.random, Drawing.drawLine, Drawing.drawDot, drawFace);

        globals.world.cameraY = -500;
        globals.world.cameraZ = -700;
        globals.world.cameraRotationX = -30;

        globals.world.orbitCamera(0, 0);

		globals.tetris = new Tetris();

        initCanvas();
        addEvents();
        window.requestAnimationFrame(loop);
    }

    let addEvents = () => {
    }

    let randomize = () => {
    }
    
    window.draw = (delta) => {
        drawBackground(ctx, canvas);

        globals.tetris.update(delta);

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