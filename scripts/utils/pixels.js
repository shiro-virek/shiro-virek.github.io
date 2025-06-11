class Pixels {
    static setSinglePixel = (ctx, x, y, color) => {
        ctx.fillStyle = color; 
        ctx.fillRect(x, y, 1, 1); 
    }

    static setSinglePixel2 = (ctx, x, y, color) => {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x+1, y);
        ctx.strokeStyle = color;
        ctx.stroke();
    }

    static setPixelBatch = (ctx, imageData, x, y, r, g, b, a = 255) => {
        const pos = (y * canvas.width + x) * 4;

        imageData[pos] = r;  
        imageData[pos+1] = g;   
        imageData[pos+2] = b;           
        imageData[pos+3] = a; 
    }
}