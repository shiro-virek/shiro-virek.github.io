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
        ctx.font = `${fontSize} bold Arial`;
        ctx.fillStyle = color;
        ctx.fillText(SpecialPixels.getEmoji(value), x, y);
    }

    static drawAscii = (ctx, x, y, value, color = "#FFF", fontSize = 20) => {
        ctx.font = `${fontSize} bold Arial`;
        ctx.fillStyle = color;
        ctx.fillText(SpecialPixels.getAscii(value), x, y);
    }

    static drawAnsi = (ctx, x, y, value, color = "#FFF", fontSize = 20) => {
        ctx.font = `${fontSize} bold Arial`;
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
}