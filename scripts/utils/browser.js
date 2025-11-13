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
}