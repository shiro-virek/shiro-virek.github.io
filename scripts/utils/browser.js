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
}