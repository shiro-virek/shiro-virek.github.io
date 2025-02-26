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
                "bouncing-balls",
                "cthulhu",
                "crt",
                "ledscreen-tones", 
                "rotators-solid",
                "3d-rotation-lights", 
                "distortion",
                "blinkenlights",
                "blinkenlights-mn",
                "shader"
            ];
const scripts = [];

let reload = () => {
    location.href = `${window.location.origin}`;
}

let reloadParams = () => {
    location.href = `${window.location.origin}?art=${art[currentScript]}`;
}

let goToRepo = () => {
    window.open('https://github.com/shiro-virek/shiro-virek.github.io', '_blank');
}

let downloadPicture = () => {
    var canvas = document.getElementById("myCanvas");
    var image = canvas.toDataURL();
    var aDownloadLink = document.createElement('a');
    aDownloadLink.download = 'ccl.png';
    aDownloadLink.href = image;
    aDownloadLink.click();
}

let initScripts = () =>{	
    art.forEach(element => {					
        scripts.push(`scripts/art/art-${element}.js`);
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
    let artItem = Url.getUrlParam("art");					
    let artItemIndex = art.indexOf(artItem);
    if (artItemIndex >= 0){						
        let randomButton = document.getElementById("randomButton");
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

    Url.setUrlParam('art', art[currentScript]);
}

let loadScriptByUrl = () => {				
    loadScript(setScriptIndexByURL());
}

window.addEventListener('load', () => {
    initScripts();			

    if (Url.hasUrlParam('art')){
        loadScriptByUrl();
    } else {			
        loadRandomScript();
    }
});
