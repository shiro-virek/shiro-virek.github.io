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

        radialPixel(200, 200, 20, 5, 0, 100, "rgba(255,0,0,1)");
    }

    let radialPixel = (x, y, radius, wideness, startAngle, endAngle, color) => {
        ctx.fillStyle = color;  

        ctx.beginPath();

        startAngle *= Trigonometry.RAD_CONST;
        endAngle *= Trigonometry.RAD_CONST; 
   
        ctx.arc(x, y, radius, startAngle, endAngle, 0);

        let point = Trigonometry.newPointAngleDistance(x, y, endAngle, radius - wideness);

        ctx.arc(x, y, radius - wideness, endAngle, startAngle, 1);

        ctx.lineTo(point.x, point.y);

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