{
    const globals = {
        random: null,
        character: null,
        foe: null,
        points: 0,
        joystick: null,
    };

    const config = {
        randomize: true,
    };    

    class Character {
        constructor (x, y){
            this.x = x;
            this.y = y;
            this.radius = 15;
            this.mouthAngle = 1;
            this.rotationAngle = 0;
            this.openingMouth = true;
            this.color = Browser.getCssVariable("--main-color");
        }
        
        move(distance) {
            this.x += Math.cos(this.rotationAngle) * distance;
            this.y += Math.sin(this.rotationAngle) * distance;
        }

        updateMouth = () => {
            if (this.openingMouth)
                if (this.mouthAngle < 2.5)
                    this.mouthAngle += 0.3
                else
                    this.openingMouth = false;
            else
                if (this.mouthAngle > 0)
                    this.mouthAngle -= 0.3
                else
                    this.openingMouth = true;
        }

        draw = () => {
            this.updateMouth();
            Drawing.drawPacman(ctx, this.x, this.y, this.radius, this.mouthAngle, this.rotationAngle, this.color);
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
        globals.joystick = new Joystick(100, height - 100);
        globals.joystick.add();
    }

    let addEvents = () => {
    }

    let randomize = () => {
        globals.foe = new Character(globals.random.nextInt(1, width), globals.random.nextInt(1, height));
        globals.foe.color = "#FFF";
    }
    
    window.draw = () => {
        drawBackground(ctx, canvas);

        globals.character.x += globals.joystick.deltaX / 10;
        globals.character.y += globals.joystick.deltaY / 10;
        if (globals.character.x - globals.character.radius <= 0)
            globals.character.x = globals.character.radius;
        if (globals.character.x + globals.character.radius >= width) 
            globals.character.x = width - globals.character.radius;
        if (globals.character.y - globals.character.radius <= 0) 
            globals.character.y = globals.character.radius;
        if (globals.character.y + globals.character.radius >= height) 
            globals.character.y = height - globals.character.radius;

        globals.character.rotationAngle = globals.joystick.angle;
        globals.foe.rotationAngle += globals.random.nextBool()? 0.05 : -0.05;
        globals.foe.move(1);

        globals.foe.draw();        
        globals.character.draw();
        Browser.setInfo(`${globals.points}`);

        if (Collisions.checkCircleCollision(globals.character, globals.foe)) {
            globals.points++;
            Sound.ping(200);
            randomize();
        }
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