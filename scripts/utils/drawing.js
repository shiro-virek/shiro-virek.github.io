class Drawing {
	static drawSquare = (ctx, x, y, side, angle, color = '#00FF00') =>{
        ctx.save();
        ctx.fillStyle = color;				
        ctx.beginPath();
        let halfSide = side / 2;	
        ctx.translate(x, y);
        ctx.rotate(angle * Math.PI / 180);
        ctx.rect(-halfSide, -halfSide, side, side);
        ctx.fill();
        ctx.restore();
	}

	static drawSquareBorder = (ctx, x, y, side, angle, color = '#00FF00') =>{
        ctx.save();
        ctx.strokeStyle = color;				
        ctx.beginPath();
        let halfSide = side / 2;	
        ctx.translate(x, y);
        ctx.rotate(angle * Math.PI / 180);
        ctx.rect(-halfSide, -halfSide, side, side);
        ctx.stroke();
        ctx.restore();
	}

    static drawCircle = (ctx, x, y, radio, color = '#00FF00') => {
        ctx.fillStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, radio, 0, 2 * Math.PI);
        ctx.fill();
    }

    static drawCircleBorder = (ctx, x, y, radio, color = '#00FF00') => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, radio, 0, 2 * Math.PI);
        ctx.stroke();
    }

    static drawRectangle = (ctx, x, y, width, height, color = '#FFF') => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.fill();
    }

    static drawRectangleBorder = (ctx, x, y, width, height, color = '#FFF') => {
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.stroke();
    }
        
    static drawRectangleRotated = (ctx, x, y, width, height, color = '#FFF', angle = 0) => {
        ctx.fillStyle = color;

        ctx.save();
        
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        ctx.translate(centerX, centerY);
        
        ctx.rotate(angle * Math.PI / 180);
        
        ctx.fillRect(-width / 2, -height / 2, width, height);

        ctx.restore();
    }

    static drawRectangleRotatedBorder = (ctx, x, y, width, height, color = '#FFF', angle = 0) => {
        ctx.strokeStyle = color;

        ctx.save();
        
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        ctx.translate(centerX, centerY);
        
        ctx.rotate(angle * Math.PI / 180);
        
        ctx.strokeRect(-width / 2, -height / 2, width, height);

        ctx.restore();
    }

    static drawPolygon = (ctx, x, y, r, sides, angle, color = '#00FF00') => {
        ctx.fillStyle = color;
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
    
        ctx.resetTransform();
    }

    static drawPolygonbBorder = (ctx, x, y, r, sides, angle, color = '#00FF00') => {
        ctx.strokeStyle = color;
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

    static drawLineFromAngle = (ctx, x, y, angleDeg, length = 100, color = '#FFF') => {
        const angleRad = angleDeg * Math.PI / 180;

        const x2 = x + Math.cos(angleRad) * length;
        const y2 = y + Math.sin(angleRad) * length;

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.moveTo(x, y);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

}
