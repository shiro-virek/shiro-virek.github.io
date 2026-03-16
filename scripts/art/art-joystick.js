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
        
        moveAuto(distance) {
            this.x += Math.cos(this.rotationAngle) * distance;
            this.y += Math.sin(this.rotationAngle) * distance;
        }

        moveJoystick() {
            this.x += globals.joystick.deltaX / 10;
            this.y += globals.joystick.deltaY / 10;
        }

        checkWallCollision() {
            if (this.x - this.radius <= 0)
                this.x = this.radius;
            if (this.x + this.radius >= width) 
                this.x = width - this.radius;
            if (this.y - this.radius <= 0) 
                this.y = this.radius;
            if (this.y + this.radius >= height) 
                this.y = height - this.radius;
        }

        checkWallCollisionBounce() {
            if (this.x - this.radius <= 0){
                this.x = this.radius + 10;
                  this.rotationAngle += 3.14;

            }
            if (this.x + this.radius >= width) {
                this.x = width - this.radius - 10;
                  this.rotationAngle += 3.14;

            }
            if (this.y - this.radius <= 0) {
                this.y = this.radius + 10;
                  this.rotationAngle += 3.14;

            }
            if (this.y + this.radius >= height) {
                this.y = height - this.radius - 10;
                  this.rotationAngle += 3.14;
            }
          
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

        globals.character.rotationAngle = globals.joystick.angle;
        globals.foe.rotationAngle += globals.random.nextBool()? 0.1 : -0.1;
        globals.foe.moveAuto(1);
        globals.character.moveJoystick();

        globals.character.checkWallCollision();
        globals.foe.checkWallCollisionBounce();

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