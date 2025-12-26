let currentScript = 0;
let scriptCount = 0;
let recording = false;
let recorder = null;

const art = [
                { "name": "confetti", "display": "Confetti"}, 
                { "name": "fire", "display": "Fire" }, 
                { "name": "rotators", "display": "Rotators"}, 
                { "name": "bokeh", "display": "Bokeh"},
                { "name": "skyscrapers", "display": "Skyscrapers"},
                { "name": "metro", "display": "Metro"},
                { "name": "3d-rotation", "display": "3D"},
                { "name": "chaos", "display": "Chaos"},
                { "name": "screen", "display": "Screen"},
                { "name": "conway", "display": "Conway"},
                { "name": "motion-matrix","display": "Motion matrix"},
                { "name": "bouncing-balls","display": "Bouncing balls"},
                { "name": "cthulhu", "display": "Cthulhu"},
                { "name": "crt","display": "CRT"},
                { "name": "screen-tones", "display": "Screen 2"},
                { "name": "rotators-solid", "display": "Rotators 2"},
                { "name": "3d-rotation-lights", "display": "3D w/lights"},
                { "name": "distortion","display": "Distortion"},
                { "name": "blinkenlights","display": "Blinkenlights"},
                { "name": "blinkenlights-mn", "display": "Cellular automata 2"},
                { "name": "shader", "display": "Shader"},
                { "name": "gravity-balls", "display": "Gravity balls"},
                { "name": "webcam", "display": "Webcam"},
                { "name": "fractals", "display": "Fractals"},
                { "name": "noise", "display": "Noise"},
                { "name": "tree", "display": "Tree"},
                { "name": "blinkenlights-mono", "display": "Cellular automata"},
                { "name": "clay", "display": "Clay"},
                { "name": "hopalong", "display": "Hopalong"},
                { "name": "lyapunov", "display": "Lyapunov"},
                { "name": "walker", "display": "Walker"},
                { "name": "streets", "display": "Streets"},
                { "name": "filters", "display": "Filters"},
                { "name": "screen-video", "display": "Video"},
                { "name": "clay-2", "display": "Clay 2"},
                { "name": "3d-fps", "display": "3D FPS"},
                { "name": "joystick", "display": "Joystick"},
                //{ "name": "elastic", "display": "Elastic"},
            ];
const scripts = [];

let reload = () => {
    location.href = `${window.location.origin}`;
}

let reloadParams = () => {
    location.href = `${window.location.origin}?art=${art[currentScript].name}`;
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
        scripts.push(`scripts/art/art-${element.name}.js`);
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
    let artItemIndex = 0;
    for (let index = 0; index < art.length; index++) {
        const item = art[index];
        if (item.name == artItem) artItemIndex = index;
    }

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
    Browser.setTitle(art[currentScript].display);
}

let loadNextScript = () =>{
    loadScript(increaseScriptIndex());
}

let loadPreviousScript = () =>{
    loadScript(decreaseScriptIndex());
}

let loadRandomScript = () =>{
    loadScript(randomScriptIndex());

    Url.setUrlParam('art', art[currentScript].name);
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
