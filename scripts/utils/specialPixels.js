class SpecialPixels {
    static getEmoji = (value) => {
        if (value >= 0 && value < 10)
            return `♣️`
        else if (value >= 10 && value < 20)
            return `🎱`
        else if (value >= 20 && value < 30)
            return `🌚`
        else if (value >= 30 && value < 40)
            return `😈`
        else if (value >= 40 && value < 50)            
            return `💩`
        else if (value >= 50 && value < 60)
            return `🍎`
        else if (value >= 60 && value < 70)
            return `😡`
        else if (value >= 70 && value < 80)
            return `😀`
        else if (value >= 80 && value < 90)
            return `🌝`
        else if (value >= 90 && value <= 100)
            return `💀`
        else return `💀`;
    }

    static getAscii = (value) => {
        if (value >= 0 && value < 10)
            return `@`
        else if (value >= 10 && value < 20)
            return `%`
        else if (value >= 20 && value < 30)
            return `$`
        else if (value >= 30 && value < 40)
            return `#`
        else if (value >= 40 && value < 50)            
            return `*`
        else if (value >= 50 && value < 60)
            return `+`
        else if (value >= 60 && value < 70)
            return `;`
        else if (value >= 70 && value < 80)
            return `:`
        else if (value >= 80 && value < 90)
            return `-`
        else if (value >= 90 && value <= 100)
            return `.`
        else return `.`;
    }

    static getAnsi = (value) => {
        if (value >= 0 && value < 20)
            return ` `
        else if (value >= 20 && value < 40)
            return `░`
        else if (value >= 40 && value < 60)
            return `▒`
        else if (value >= 60 && value < 80)            
            return `▓`
        else if (value >= 80 && value <= 100)
            return `█`
        else return `█`;
    }

    static getGameboy = (value) => {
        if (value >= 0 && value < 25)
            return `#0f380f`
        else if (value >= 25 && value < 50)
            return `#306230`
        else if (value >= 50 && value < 75)            
            return `#8bac0f`
        else if (value >= 75 && value <= 100)
            return `#9bbc0f`
        else return `#9bbc0f`;
    }

    static drawEmoji = (ctx, x, y, value, color = "#FFF", fontSize = 20) => {
        ctx.font = `${fontSize}px bold Arial`;
        ctx.fillStyle = color;
        ctx.fillText(SpecialPixels.getEmoji(value), x, y);
    }

    static drawAscii = (ctx, x, y, value, color = "#FFF", fontSize = 20) => {
        ctx.font = `${fontSize}px bold Arial`;
        ctx.fillStyle = color;
        ctx.fillText(SpecialPixels.getAscii(value), x, y);
    }

    static drawCharacter = (ctx, x, y, value, color = "#FFF", char = "*") => {
        ctx.font = `${value}px bold Arial`;
        ctx.fillStyle = color;
        ctx.fillText(char, x, y);
    }

    static drawAnsi = (ctx, x, y, value, color = "#FFF", fontSize = 20) => {
        ctx.font = `${fontSize}px bold Arial`;
        ctx.fillStyle = color;
        ctx.fillText(SpecialPixels.getAnsi(value), x, y);
    }

    static drawGameboy = (ctx, x, y, side, value) => {
        ctx.save();
        ctx.fillStyle = this.getGameboy(value);				
        ctx.beginPath();
        let halfSide = side / 2;	
        ctx.translate(x, y);
        ctx.rect(-halfSide, -halfSide, side, side);
        ctx.fill();
        ctx.restore();
    }

    static drawBar = (ctx, x, y, side, angle = 0, color = "#FFF") => {
        Drawing.drawRectangleRotated(ctx, x, y, side / 4, side, color, angle);   
    }

    static drawCRT = (ctx, x, y, size, r, g, b) => {
        let borderColor = '#000';
        let third = size / 3;
        let colorR = `hsl(${0}, 100%, ${Numbers.scale(r, 0, 255, 20, 70)}%)`;
        let colorG = `hsl(${120}, 100%, ${Numbers.scale(g, 0, 255, 20, 70)}%)`;
        let colorB = `hsl(${255}, 100%, ${Numbers.scale(b, 0, 255, 20, 70)}%)`;
        Drawing.drawRectangle(ctx, x, y, third, size, colorR)
        Drawing.drawRectangle(ctx, x + third, y, third, size, colorG)
        Drawing.drawRectangle(ctx, x + third * 2, y, third, size, colorB)
        Drawing.drawRectangleBorder(ctx, x, y, third, size, borderColor)
        Drawing.drawRectangleBorder(ctx, x + third, y, third, size, borderColor)
        Drawing.drawRectangleBorder(ctx, x + third * 2, y, third, size, borderColor)
    }

}