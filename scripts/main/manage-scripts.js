let currentScript = 0;
let scriptCount = 0;
let recording = false;
let recorder = null;

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
                "shader",
                "gravity-balls",
                "webcam",
                "fractals", 
                "noise",
                "tree",
                "blinkenlights-mono",
                "gel",
                "hopalong",
                "lyapunov",
                "walker",
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
    let seed = Url.getUrlParam("seed");
    aDownloadLink.download = seed ? `${seed}.png` : 'ccl.png';
    aDownloadLink.href = image;
    aDownloadLink.click();
}

let initRecorder = () => {
    let chunks = [];
    var canvas = document.getElementById('myCanvas');
    const stream = canvas.captureStream(60);
    recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm; codecs=vp9',
        videoBitsPerSecond: 50_000_000
    });

    recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
        chunks.push(e.data);
        }
    };

    recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ani.webm';
        a.click();
    };
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

let recordVideo = () => {
    if (!recording){     
        initRecorder();
        document.getElementById('recordButton').textContent = '◼️';
        recorder.start();
        recording = true;
    }else{
        document.getElementById('recordButton').textContent = '📹';
        recorder.stop();
        recording = false;
    }
};

window.addEventListener('load', () => {
    initScripts();	

    if (Url.hasUrlParam('art')){
        loadScriptByUrl();
    } else {			
        loadRandomScript();
    }
});
