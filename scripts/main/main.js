let width = 0;
let height = 0;
let halfWidth = 0;
let halfHeight = 0;
let lastPosY = 0;
let lastPosX = 0;
let canvas;
let ctx;
let lastRender = 0;
let uploader;
let uploadButton;
let clicking = false;  
let mouseMoved = false

width = window.innerWidth;
height = window.innerHeight;
halfWidth = width / 2;
halfHeight = height / 2;
lastPosY = 0;
lastPosX = 0;

let drawBackground = (ctx, canvas) => {
    if (canvas.getContext) {
        canvas.width = width;
        canvas.height = height;
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#000000';
        ctx.strokeRect(0, 0, width, height);
    }
}

let initCanvas = () => {
    uploader = document.getElementById('uploader');
    uploadButton = document.getElementById('uploadButton');
    uploadButton.addEventListener('click', function() {
        uploader.click();
    });
    canvas = document.getElementById("myCanvas");

    canvas.addEventListener('mousemove', e => {
        mouseMoved = true;
        window.trackMouse(e.offsetX, e.offsetY);
    }, false);

    canvas.addEventListener('touchstart', function (e) {
        mouseMoved = false; 
		window.trackMouse(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
        clicking = true;
    });

    canvas.addEventListener('touchmove', function (e) {
        e.preventDefault();
        mouseMoved = true;
		window.trackMouse(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
    });

    canvas.addEventListener('mousedown', e => {
        mouseMoved = false;
        clicking = true;
    }, false);

    canvas.addEventListener('mouseup', e => {
        clicking = false;
    }, false);

    canvas.addEventListener('touchend', e => {
        clicking = false;
    }, false);   

    if (canvas.getContext) {
        ctx = canvas.getContext('2d', { willReadFrequently: true })
        drawBackground(ctx, canvas);
    }
}