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
        radialPixel(200, 200, 20, 5, 100, 190, "rgba(255,255,0,1)");
        radialPixel(200, 200, 20, 5, 190, 360, "rgba(0,255,255,1)");

        radialPixel(200, 200, 15, 5, 0, 100, "rgba(255,0,255,1)");
        radialPixel(200, 200, 15, 5, 100, 190, "rgba(0,255,0,1)");
        radialPixel(200, 200, 15, 5, 190, 360, "rgba(255,255,255,1)");

        radialPixel(200, 200, 10, 5, 0, 100, "rgba(255,0,0,1)");
        radialPixel(200, 200, 10, 5, 100, 190, "rgba(255,255,0,1)");
        radialPixel(200, 200, 10, 5, 190, 360, "rgba(0,255,255,1)");

        radialPixel(200, 200, 5, 5, 0, 100, "rgba(255,0,255,1)");
        radialPixel(200, 200, 5, 5, 100, 190, "rgba(0,255,0,1)");
        radialPixel(200, 200, 5, 5, 190, 360, "rgba(255,255,255,1)");

    }

    let getArcEndPoint = (c1,c2,radius,angle) => {
        return [c1+Math.cos(angle)*radius,c2+Math.sin(angle)*radius];
    }

    let radialPixel = (x, y, radius, wideness, startAngle, endAngle, color) => {
        ctx.fillStyle = color;  

        ctx.beginPath();
        startAngle *= Trigonometry.RAD_CONST;
        endAngle *= Trigonometry.RAD_CONST; 
  
        ctx.arc(x, y, radius, startAngle, endAngle, 0);
        ctx.arc(x, y, radius - wideness, endAngle, startAngle, 1);

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