{
    const globals = {
        random: null,
        character: null,
        joystick: null,
    };

    const config = {
        randomize: true,
    };    

    class Character {
        constructor (x, y){
            this.x = x;
            this.y = y;
            this.radio = 15;
        }

        draw = () => {
            Drawing.drawCircle(ctx, this.x, this.y, this.radio, Browser.getCssVariable("--main-color"));
        }
    }

    let init = () => {
		globals.random = Objects.getRandomObject();
        if (config.randomize) randomize();
        initCanvas();
        addEvents();
        window.requestAnimationFrame(loop);
        addSpecialControls();
        globals.character = new Character(halfWidth, halfHeight);
    }

    let addSpecialControls = () => {
        globals.joystick = new Joystick(100, 100);
        globals.joystick.add();
    }

    let addEvents = () => {
    }

    let randomize = () => {
    }
    
    window.draw = () => {
        drawBackground(ctx, canvas);

        globals.character.x += globals.joystick.deltaX / 10;
        globals.character.y += globals.joystick.deltaY / 10;

        globals.character.draw();
    }

    window.trackMouse = (x, y) => {
        if (clicking) {  

        }
    }
    
    window.clearCanvas = () => {
		Sound.error();
    }

	window.magic = () => {  
		Sound.error();
	}

    window.upload = (e) => {
		Sound.error();        
    }

    init();
}