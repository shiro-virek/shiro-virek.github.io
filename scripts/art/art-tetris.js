{
    const globals = {
        random: null,
        world: null,
    };

    const config = {
        randomize: true,
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

        newPiece = () => {
            this.piece = Tetris.pieces[globals.random.nextInt(0, Tetris.pieces.length)];

            let side = 40;
            let offset = ((this.piece.length - 1) * side) / 2;

            for (let x = 0; x < this.piece.length; x++){
                for (let y = 0; y < this.piece[x].length; y++){
                    if (this.piece[x][y] === 1){
                        //this.addBlock(x, y);
                        let figure = globals.world.addFigureAt(x * side - offset, 50, y * side - offset);
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
            this.newPiece();
        }
        
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

        globals.world.cameraY = -300;
        globals.world.cameraZ = -700;
        globals.world.cameraRotationX = -30;

        globals.world.orbitCamera(0, 0);

		this.tetris = new Tetris();

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