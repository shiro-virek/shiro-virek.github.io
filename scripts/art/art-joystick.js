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
            this.color = `hsl(${globals.random.nextInt(0, 360)}, 100%, 50%)`; //Browser.getCssVariable("--main-color");
        }
        
        moveAuto(distance, delta) {
            let factor = delta / FRAME_TIME;
            this.x += Math.cos(this.rotationAngle) * distance * factor;
            this.y += Math.sin(this.rotationAngle) * distance * factor;
        }

        moveJoystick(delta) {
            let factor = delta / FRAME_TIME;
            this.x += (globals.joystick.deltaX / 10) * factor;
            this.y += (globals.joystick.deltaY / 10) * factor;
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

        updateMouth = (delta) => {
            let factor = delta / FRAME_TIME;
            if (this.openingMouth)
                if (this.mouthAngle < 2.5)
                    this.mouthAngle += 0.3 * factor
                else
                    this.openingMouth = false;
            else
                if (this.mouthAngle > 0)
                    this.mouthAngle -= 0.3 * factor
                else
                    this.openingMouth = true;
        }

        draw = (delta) => {
            this.updateMouth(delta);
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
        globals.v
        globals.foe = new Character(globals.random.nextInt(1, width), globals.random.nextInt(1, height));
        globals.foe.color = "#FFF";
    }
    
    window.draw = (delta) => {
        drawBackground(ctx, canvas);

        let factor = delta / FRAME_TIME;
        globals.character.rotationAngle = globals.joystick.angle;
        globals.foe.rotationAngle += (globals.random.nextBool()? 0.1 : -0.1) * factor;
        globals.foe.moveAuto(1, delta);
        globals.character.moveJoystick(delta);

        globals.character.checkWallCollision();
        globals.foe.checkWallCollisionBounce();

        globals.foe.draw(delta);        
        globals.character.draw(delta);
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

    init();
}