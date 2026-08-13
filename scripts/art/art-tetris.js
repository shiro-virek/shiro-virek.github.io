{
    const globals = {
        random: null
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

        static pieces = [piece1, piece2, piece3, piece4, piece5, piece6, piece7];

        constructor () {
            this.piece = Tetris.pieces[globals.random.nextInt(0, Tetris.pieces.length)];
            this.x = 0;
            this.y = 0;
        }
    }


    let init = () => {
		globals.random = Objects.getRandomObject();
        if (config.randomize) randomize();
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