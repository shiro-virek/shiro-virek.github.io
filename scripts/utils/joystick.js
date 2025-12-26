class Joystick {
    constructor (originX, originY) {
        this.originX = originX;
        this.originY = originY;
        this.angle = 0;
        this.force = 0;
        this.deltaX = 0;
        this.deltaY = 0;
    }

    add = () => {
        const container = document.body;
        const button = document.createElement("button");

        button.classList.add("joystick");
        button.style.position = "absolute";
        
        button.style.left = `${this.originX}px`;
        button.style.top  = `${this.originY}px`;
        
        button.style.transform = "translate(-50%, -50%) translate(0px, 0px)"; 

        container.appendChild(button); 

        const stiffness = 0.05; 
        const friction = 0.85; 
        const maxRadius = 60; 

        let posX = 0, posY = 0;       
        let velX = 0, velY = 0;       
        let targetX = 0, targetY = 0; 
        
        let animating = false;
        let dragFrame; 

        const updateVisuals = () => {
            button.style.transform = `translate(-50%, -50%) translate(${posX}px, ${posY}px)`;
        }

        const physicsLoop = () => {
            const distanceX = targetX - posX;
            const distanceY = targetY - posY;

            const forceX = distanceX * stiffness;
            const forceY = distanceY * stiffness;

            velX += forceX;
            velY += forceY;

            velX *= friction;
            velY *= friction;

            posX += velX;
            posY += velY;

            updateVisuals();

            if (Math.abs(velX) < 0.01 && Math.abs(velY) < 0.01 && Math.abs(distanceX) < 0.1) {
                animating = false; 
                posX = 0; posY = 0; 
                updateVisuals();
            } else {
                dragFrame = requestAnimationFrame(physicsLoop);
            }
        }

        const moveButton = (e) => {
            let deltaX = (e.clientX ? e.clientX : e.changedTouches[0].pageX) - this.originX;
            let deltaY = (e.clientY ? e.clientY : e.changedTouches[0].pageY) - this.originY;

            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const angle = Math.atan2(deltaY, deltaX);

            this.force = distance;
            this.angle = angle;
            this.deltaX = deltaX;
            this.deltaY = deltaY;

            if (distance > maxRadius) {
                
                deltaX = Math.cos(angle) * maxRadius;
                deltaY = Math.sin(angle) * maxRadius;
            }

            posX = deltaX;
            posY = deltaY;

            velX = 0;
            velY = 0;

            updateVisuals();
        };

        const stopDrag = () => {
            document.removeEventListener("mousemove", moveButton);
            document.removeEventListener("mouseup", stopDrag);
            
            targetX = 0; 
            targetY = 0;

            this.deltaX = 0;
            this.deltaY = 0;
            this.force = 0;
            this.angle = 0;
            
            if (!animating) {
                animating = true;
                physicsLoop();
            }
        };

        button.addEventListener("mousedown", () => {
            cancelAnimationFrame(dragFrame);
            animating = false;

            document.addEventListener("mousemove", moveButton);
            document.addEventListener("mouseup", stopDrag);

            document.addEventListener("touchmove", moveButton);
            document.addEventListener("touchend", stopDrag);
        });
    }

}