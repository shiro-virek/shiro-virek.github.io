class Drawing {
	static drawSquare = (ctx, x, y, side, angle, color = '#00FF00', fillcolor = '#00FF00') =>{
        ctx.save();
        ctx.strokeStyle = color;
        ctx.fillStyle = color;				
        ctx.beginPath();
        let halfSide = side / 2;	
        ctx.translate(x, y);
        ctx.rotate(angle * Math.PI / 180);
        ctx.rect(-halfSide, -halfSide, side, side);
        ctx.fill();
        ctx.restore();
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

    static drawRectangleR = (ctx, x, y, width, height, color = '#FFF', fillColor = '#00FF00', angle = 0) => {
        ctx.strokeStyle = color;
        ctx.fillStyle = fillColor;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle * Math.PI / 180);
        ctx.fillRect(0, 0, width, height);

        ctx.restore();
    }

    static drawPolygon = (ctx, x, y, r, sides, angle, color = '#00FF00', fillColor = '#00FF00') => {
        ctx.strokeStyle = color;
        ctx.fillStyle = fillColor;
        ctx.beginPath();

        ctx.translate(x, y);

        let radAngle = Trigonometry.sexagesimalToRadian(angle);
    
        for (let i = 0; i < sides; i++) {
            const rotation = ((Math.PI * 2) / sides) * i + radAngle;
    
            if (i === 0) {
                ctx.moveTo(r * Math.cos(rotation), r * Math.sin(rotation));
            } else {
                ctx.lineTo(r * Math.cos(rotation), r * Math.sin(rotation));
            }
        }
    
        ctx.fill();
        ctx.stroke();
    
        ctx.resetTransform();
    }

    static drawDot = (ctx, x, y, color = '#FFF') => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, 2 * Math.PI, false);
        ctx.fill();
    }

    static drawLine = (ctx, x1, y1, x2, y2, lineWidth, color = '#FFF') => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = lineWidth
        ctx.strokeStyle = color;
        ctx.stroke();
    }
}
