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

    static setInfo = (title) => {
        document.getElementById("artInfo").textContent = title;
    }

    static getCssVariable = (varName) => {
        const styles = getComputedStyle(document.documentElement);
        const variable = styles.getPropertyValue(varName).trim()
        return variable;
    }
    
    static addButton = (id, caption, action, x = 0, y = 0, width = 0, height = 0) => {
        const container = document.getElementById("specialControls");

        const button = document.createElement("button");
        button.id = id;
        button.textContent = caption;
        button.classList.add("animated-button");

        if (x !== 0 || y !== 0) {
            button.style.position = "fixed";
            button.style.left = `${x}px`;
            button.style.top  = `${y}px`;
        }

        if (width !== 0 || height !== 0) {
            button.style.width = `${width}px`;
            button.style.height = `${height}px`;
        }

        button.addEventListener("pointerdown", action);

        container.appendChild(button);
        requestAnimationFrame(() => {
            button.classList.add("visible");
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