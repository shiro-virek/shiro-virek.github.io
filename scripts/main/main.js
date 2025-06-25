let width = 0;
let height = 0;
let halfWidth = 0;
let halfHeight = 0;
let lastPosY = 0;
let lastPosX = 0;
let canvas;
let ctx;
let lastRender = 0;

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
    canvas = document.getElementById(Screen.CANVAS_ID);
    if (canvas.getContext) {
        ctx = canvas.getContext('2d', { willReadFrequently: true })
        drawBackground(ctx, canvas);
    }
}