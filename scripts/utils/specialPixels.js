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

    static drawEmoji = (ctx, x, y, value) => {
        ctx.font = "20px bold Arial";
        ctx.fillStyle = "#FFF";
        ctx.fillText(SpecialPixels.getEmoji(value), x, y);
    }

    static drawAscii = (ctx, x, y, value) => {
        ctx.font = "20px bold Arial";
        ctx.fillStyle = "#FFF";
        ctx.fillText(SpecialPixels.getAscii(value), x, y);
    }

    static drawAnsi = (ctx, x, y, value) => {
        ctx.font = "20px bold Arial";
        ctx.fillStyle = "#FFF";
        ctx.fillText(SpecialPixels.getAnsi(value), x, y);
    }
}