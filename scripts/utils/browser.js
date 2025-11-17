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
}