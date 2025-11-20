let canvas;
let ctx;
let width = 0;
let height = 0;
let halfWidth = 0;
let halfHeight = 0;
let mouseX = 0;
let mouseY = 0;
let lastPosY = 0;
let lastPosX = 0;
let initialClickX = 0;
let initialClickY = 0;
let movX = 0;
let movY = 0;
let lastRender = 0;
let uploader;
let uploadButton;
let clicking = false;  
let mouseMoved = false;
let touches = null;

width = window.innerWidth;
height = window.innerHeight;
halfWidth = width / 2;
halfHeight = height / 2;
lastPosY = 0;
lastPosX = 0;

let drawBackground = (ctx, canvas, opacity = 1) => {
    if (ctx) {
        ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
        ctx.fillRect(0, 0, width, height);
    }
}

let initCanvas = () => {
    Browser.addMenu(art);

    uploader = document.getElementById('uploader');
    uploadButton = document.getElementById('uploadButton');
    uploadButton.addEventListener('click', function() {
        uploader.click();
    });
    canvas = document.getElementById("myCanvas");

    canvas.addEventListener('mousemove', e => {
        if (lastPosX == 0) lastPosX = e.offsetX;
        if (lastPosY == 0) lastPosY = e.offsetY;
        mouseX = e.offsetX;
        mouseY = e.offsetY;
        movX = lastPosX - e.offsetX;
        movY = lastPosY - e.offsetY;
        mouseMoved = true;
        window.trackMouse(e.offsetX, e.offsetY);
        lastPosX = e.offsetX;
        lastPosY = e.offsetY;
    }, false);

    canvas.addEventListener('touchstart', function (e) { 
        if (lastPosX == 0) lastPosX = e.changedTouches[0].pageX;
        if (lastPosY == 0) lastPosY = e.changedTouches[0].pageY;
        mouseX = e.changedTouches[0].pageX;
        mouseY = e.changedTouches[0].pageY;
        movX = lastPosX - e.changedTouches[0].pageX;
        movY = lastPosY - e.changedTouches[0].pageY;
        initialClickX = e.changedTouches[0].pageX;
        initialClickY = e.changedTouches[0].pageY;
        mouseMoved = false; 
		touches = e.touches;
		window.trackMouse(e.changedTouches[0].pageX, e.changedTouches[0].pageY); 
        clicking = true;
        lastPosX = e.changedTouches[0].pageX;
        lastPosY = e.changedTouches[0].pageY;
    });

    canvas.addEventListener('touchmove', function (e) {
        e.preventDefault();
        if (lastPosX == 0) lastPosX = e.changedTouches[0].pageX;
        if (lastPosY == 0) lastPosY = e.changedTouches[0].pageY;
        mouseX = e.changedTouches[0].pageX;
        mouseY = e.changedTouches[0].pageY;
        movX = lastPosX - e.changedTouches[0].pageX;
        movY = lastPosY - e.changedTouches[0].pageY;
        mouseMoved = true;
		touches = e.touches;
		window.trackMouse(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
        lastPosX = e.changedTouches[0].pageX;
        lastPosY = e.changedTouches[0].pageY;
    });

    canvas.addEventListener('mousedown', e => {
        mouseMoved = false;
        clicking = true;
        if (lastPosX == 0) lastPosX = e.offsetX;
        if (lastPosY == 0) lastPosY = e.offsetY;
        mouseX = e.offsetX;
        mouseY = e.offsetY;
        movX = lastPosX - e.offsetX;
        movY = lastPosY - e.offsetY;
        initialClickX = e.offsetX;
        initialClickY = e.offsetY;
        lastPosX = e.offsetX;
        lastPosY = e.offsetY;
    }, false);

    canvas.addEventListener('mouseup', e => {
        clicking = false;
    }, false);

    canvas.addEventListener('touchend', e => {
        clicking = false;
    }, false);   

    if (canvas.getContext) {
        ctx = canvas.getContext('2d', { willReadFrequently: true })
        canvas.width = width;
        canvas.height = height;
    }
}

let loop = (timestamp) => {
    let progress = timestamp - lastRender;

    window.draw();

    lastRender = timestamp;
    window.requestAnimationFrame(loop);
}