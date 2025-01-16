let currentScript = 0;
let scriptCount = 0;
const art = [
                "confetti", 
                "fire", 
                "rotators", 
                "bokeh", 
                "skyscrapers", 
                "metro", 
                "3d-rotation", 
                "chaos", 
                "ledscreen", 
                "conway", 
                "motion-matrix",
                "balls-bouncing",
                "cthulhu",
                "crt",
                "ledscreen-tones",
                "3d-rotation-solid", 
                "rotators-solid"
            ];
const scripts = [];

let reload = () => {
    location.href = `${window.location.origin}`;
}

let reloadParams = () => {
    location.href = `${window.location.origin}?art=${art[currentScript]}`;
}

let goToRepo = () => {
    window.open('https://github.com/shiro-virek/creative-coding-lab', '_blank');
}

let downloadPicture = () => {
    var canvas = document.getElementById("myCanvas");
    var image = canvas.toDataURL();
    var aDownloadLink = document.createElement('a');
    aDownloadLink.download = 'eap.png';
    aDownloadLink.href = image;
    aDownloadLink.click();
}

let initScripts = () =>{	
    art.forEach(element => {					
        scripts.push(`scripts/art-${element}.js`);
    });											
        
    scriptCount = scripts.length;				
}

let removeCanvasListeners = () =>{				
    var canvas = document.getElementById('myCanvas');
    canvas.replaceWith(canvas.cloneNode(true));
}

let removePreviousScript = () =>{				
    var previousScript = document.getElementById("artScript");
    if (previousScript){
        previousScript.outerHTML = "";
        previousScript.remove();
    }
}

let setScriptIndexByURL = () =>{					
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    let artItem = urlParams.get("art");					
    let artItemIndex = art.indexOf(artItem);
    if (artItemIndex >= 0){						
        let randomButton = document.getElementById("randomButton");
        //randomButton.innerHTML = '🔄';
        currentScript = artItemIndex;
    } else {					
        randomScriptIndex();
    }
}

let increaseScriptIndex = () =>{				
    if (currentScript < scriptCount - 1)
        currentScript++;
    else
        currentScript = 0;
}

let decreaseScriptIndex = () =>{				
    if (currentScript > 0)
        currentScript--;
    else
        currentScript = scriptCount - 1;
}

let randomScriptIndex = () =>{	
    currentScript = Math.floor(Math.random() * scriptCount);
}

let setCurrentScript = () => {				
    var js = document.createElement("script");
    js.id = "artScript";
    js.src = scripts[currentScript];
    js.setAttribute("type", "text/javascript");
    js.setAttribute("async", true);

    document.body.appendChild(js); 
}

let loadScript = (getScriptIndexFunction) =>{
    removeCanvasListeners();
    removePreviousScript();
    getScriptIndexFunction;
    setCurrentScript();
}

let loadNextScript = () =>{
    loadScript(increaseScriptIndex());
}

let loadPreviousScript = () =>{
    loadScript(decreaseScriptIndex());
}

let loadRandomScript = () =>{
    loadScript(randomScriptIndex());
}

let loadScriptByUrl = () => {				
    loadScript(setScriptIndexByURL());
}

window.addEventListener('load', () => {
    initScripts();			

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    if (urlParams.has('art')){
        loadScriptByUrl();
    } else {					
        loadRandomScript();
    }
});
