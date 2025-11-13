class SpecialPixels {
    static getEmoji = (value) => {
        if (value >= 0 && value < 25)
            return `♣️`
        else if (value >= 25 && value < 50)
            return `🎱`
        else if (value >= 50 && value < 75)
            return `🌚`
        else if (value >= 75 && value < 100)
            return `😈`
        else if (value >= 100 && value < 120)            
            return `💩`
        else if (value >= 125 && value <= 150)
            return `🍎`
        else if (value >= 150 && value <= 175)
            return `😡`
        else if (value >= 175 && value <= 200)
            return `😀`
        else if (value >= 200 && value <= 225)
            return `🌝`
        else if (value >= 225 && value <= 255)
            return `💀`
        else return `💀`;
    }

    static getAscii = (value) => {
        if (value >= 0 && value < 25)
            return `@`
        else if (value >= 25 && value < 50)
            return `%`
        else if (value >= 50 && value < 75)
            return `$`
        else if (value >= 75 && value < 100)
            return `#`
        else if (value >= 100 && value < 120)            
            return `*`
        else if (value >= 125 && value <= 150)
            return `+`
        else if (value >= 150 && value <= 175)
            return `;`
        else if (value >= 175 && value <= 200)
            return `:`
        else if (value >= 200 && value <= 225)
            return `-`
        else if (value >= 225 && value <= 255)
            return `.`
        else return `.`;
    }

    static getAnsi = (value) => {
        if (value >= 0 && value < 50)
            return ` `
        else if (value >= 50 && value < 100)
            return `░`
        else if (value >= 100 && value < 150)
            return `▒`
        else if (value >= 150 && value < 200)            
            return `▓`
        else if (value >= 200 && value <= 255)
            return `█`
        else return `█`;
    }

    static getGameboy = (value) => {
        if (value >= 0 && value < 65)
            return `#0f380f`
        else if (value >= 65 && value < 130)
            return `#306230`
        else if (value >= 130 && value < 195)            
            return `#8bac0f`
        else if (value >= 195 && value <= 255)
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