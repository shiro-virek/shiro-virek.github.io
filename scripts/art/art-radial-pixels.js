{
    const globals = {
        random: null
    };

    const config = {
        randomize: true,
    };    

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

        ctx.fillStyle="rgba(255,0,0,1)";  

        ctx.beginPath();
            
        var x = 200; // x coordinate
        var y = 200; // y coordinate
        var radius = 20; // Arc radius
        var wideness = 5;
        var startAngle = 0; // Starting point on circle
        var endAngle = 100 * Trigonometry.RAD_CONST; // End point on circle
   
        ctx.arc(x, y, radius, startAngle, endAngle, 0);

        let point = Trigonometry.newPointAngleDistance(x, y, endAngle, radius - wideness);


        ctx.arc(x, y, radius - wideness, endAngle, startAngle, 1);


        ctx.lineTo(point.x, point.y);


        //ctx.lineTo(x, y);

        ctx.fill();
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