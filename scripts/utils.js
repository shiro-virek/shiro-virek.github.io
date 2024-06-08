class Utils {
	static degToRad = (deg) => {
	    return deg * (Math.PI / 180.0);
	}

    static polarToCartesian(r, theta) {
        let x = r * Math.cos(theta);
        let y = r * Math.sin(theta);
        return { x: x, y: y };
    }

    static cartesianToPolar(x, y) {
        let r = Math.sqrt(x * x + y * y);
        let theta = Math.atan2(y, x);
        return { r: r, theta: theta };
    }

    static sleep(ms){
        let waitUntil = new Date().getTime() + ms;
        while(new Date().getTime() < waitUntil) continue;
    }

    static angleBetweenTwoPoints(x1, y1, x2, y2) {
        let angle = Math.atan2(y2 - y1, x2 - x1);
        angle *= 180 / Math.PI;
        if (angle < 0) angle = 360 + angle;
        return angle;
    }
    
    static clone = (original) => {
        return JSON.parse(JSON.stringify(original));
    }

    static nextCharacter = (c) => {
        return String.fromCharCode(c.charCodeAt(0) + 1);
    }

    static distanceBetweenTwoPoints(x1, y1, x2, y2) {
        let deltaX = x2 - x1;
        let deltaY = y2 - y1;
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }

    static getRandomFromArray = (array) => {
        return array[(Math.floor(Math.random() * array.length))];
    }

    static scale = (number, inMin, inMax, outMin, outMax) => {
        return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    }

    static shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }	
        
    static angleBetweenTwoPoints(x1, y1, x2, y2) {
        var angle = Math.atan2(y2 - y1, x2 - x1);
        angle *= 180 / Math.PI;
        if (angle < 0) angle = 360 + angle;
        return angle;
    }
    
    static getRandomInt = (min, max) => {
        return Math.floor(Math.random() * max) + min;
    }

    static getRandomFloat = (min, max, decimals) => {
        const str = (Math.random() * (max - min) + min).toFixed(
            decimals,
        );

        return parseFloat(str);
    }

    static getRandomBool = () => {
        return Math.random() < 0.5;
    }
    
    static nextCharacter = (c) => {
        return String.fromCharCode(c.charCodeAt(0) + 1);
    }
    
    static drawCircle = (ctx, x, y, radio, color = '#00FF00', fillColor = '#00FF00') => {
        ctx.strokeStyle = color;
        ctx.fillStyle = fillColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, radio, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }

    static drawRectangle = (ctx, x, y, width, height, color = '#FFF', fillColor = '#00FF00') => {
        ctx.strokeStyle = color;
        ctx.fillStyle = fillColor;
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.fill();
        ctx.stroke();
    }

    static drawDot = (ctx, x, y, color = '#FFF') => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, 2 * Math.PI, false);
        ctx.fill();
    }

    static drawLine = (ctx, x1, y1, x2, y2, color = '#FFF') => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = "2"
        ctx.strokeStyle = color;
        ctx.stroke();
    }
}