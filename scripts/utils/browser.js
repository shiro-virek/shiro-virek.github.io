class Browser {
    static sleep = (ms) => {
        let waitUntil = new Date().getTime() + ms;
        while(new Date().getTime() < waitUntil) continue;
    }

    static showSpinner = () => {
        document.getElementById('overlay').style.display = 'flex';
    }

    static hideSpinner = () => {
        document.getElementById('overlay').style.display = 'none';
    }
    
    static setProgress = (percent) => {
        percent = Math.max(0, Math.min(100, percent));
        document.getElementById("overlayProgress").style.width = percent + "%";
    }

    static resetProgress = () => {
        document.getElementById("overlayProgress").style.width = "0%";
    }

    static setTitle = (title) => {
        document.getElementById("artTitle").textContent = title;
    }

    static getCssVariable = (varName) => {
        const styles = getComputedStyle(document.documentElement);
        const variable = styles.getPropertyValue(varName).trim()
        return variable;
    }
    
    static addButton = (id, caption, action) => {
        const container = document.getElementById("specialControls");

        const button = document.createElement("button");
        button.textContent = caption;
        button.classList.add("animated-button");

        button.addEventListener("click", action);

        container.appendChild(button); 
        requestAnimationFrame(() => {
            button.classList.add("visible");
        });
    }

    static addJoystick = (originX, originY) => {
        const container = document.body;
        const button = document.createElement("button");

        button.classList.add("joystick");
        button.style.position = "absolute";
        
        button.style.left = `${originX}px`;
        button.style.top  = `${originY}px`;
        
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
            let deltaX = e.clientX - originX;
            let deltaY = e.clientY - originY;

            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            if (distance > maxRadius) {
                const angle = Math.atan2(deltaY, deltaX);
                
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
        });
    }

    static addMenu = (items) => {
        const container = document.getElementById("menuLateral");

        let menuItems = [...items].sort((a, b) => a.display.localeCompare(b.display));

        let addToMenu = (caption, link, action = null) => {
            const ul = document.createElement('ul');
            const li = document.createElement('li');

            let a = Object.assign(document.createElement('a'), {
                textContent: caption,
                href: link
            });

            if (action) a.addEventListener('click', action);
            li.appendChild(a);
            ul.appendChild(li);
            container.appendChild(ul);
        }

        menuItems.forEach(element => {
            addToMenu(element.display, `?art=${element.name}`);
        });

        addToMenu("Source code", '#', goToRepo);
    }
}