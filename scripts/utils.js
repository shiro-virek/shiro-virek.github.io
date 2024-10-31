class Utils {
    static getColorLightness = (r, g, b) => {
      return (0.21 * r) + (0.72 * g) + (0.07 * b)
    }

	static degToRad = (deg) => {
	    return deg * (Math.PI / 180.0);
	}

    static polarToCartesian = (r, theta) => {
        let x = r * Math.cos(theta);
        let y = r * Math.sin(theta);
        return { x: x, y: y };
    }

    static cartesianToPolar = (x, y) => {
        let r = Math.sqrt(x * x + y * y);
        let theta = Math.atan2(y, x);
        return { r: r, theta: theta };
    }

    static sleep = (ms) => {
        let waitUntil = new Date().getTime() + ms;
        while(new Date().getTime() < waitUntil) continue;
    }

    static angleBetweenTwoPoints = (x1, y1, x2, y2) => {
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

    static distanceBetweenTwoPoints = (x1, y1, x2, y2) => {
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

    static drawPolygon = (ctx, x, y, r, sides, color = '#00FF00', fillColor = '#00FF00') => {
        ctx.strokeStyle = color;
        ctx.fillStyle = fillColor;
        ctx.beginPath();

        ctx.translate(x, y);
    
        for (let i = 0; i < sides; i++) {
            const rotation = ((Math.PI * 2) / sides) * i;
    
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

    static sexagesimalToRadian = (degrees) => {
        return degrees * (Math.PI / 180);
    }

    static calculateCenter = (vertices, face) => {
        let center = [0, 0, 0];
        face.forEach(index => {
            center[0] += vertices[index][0];
            center[1] += vertices[index][1];
            center[2] += vertices[index][2];
        });
        center[0] /= face.length;
        center[1] /= face.length;
        center[2] /= face.length;
        return center;
    }

    static dotProduct = (v1, v2) => {
        return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
    }
    
    static addVectors = (v1, v2) => {
        return [
            v1[0] + v2[0],
            v1[1] + v2[1],
            v1[2] + v2[2]
        ];
    }
        
    static calculateCameraPosition = (distance, theta, phi) => {
        const x = distance * Math.sin(theta) * Math.cos(phi);
        const y = distance * Math.sin(theta) * Math.sin(phi);
        const z = distance * Math.cos(theta);
        return [x, y, z];
    }
        
    static subtractVectors = (v1, v2) => {
        return [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]];
    }
    
    static crossProduct = (v1, v2) => {
        return [
            v1[1] * v2[2] - v1[2] * v2[1],
            v1[2] * v1[0] - v1[0] * v2[2],
            v1[0] * v2[1] - v1[1] * v2[0]
        ];
    }
    
    static normalizeVector = (v) => {
        const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        if (length === 0) return [0, 0, 0];
        return [v[0] / length, v[1] / length, v[2] / length];
    }
    
    static calculateFaceNormal = (vertices, face) => {
        if (face.length < 3) {
            throw new Error('Se necesitan al menos 3 vértices para definir una cara.');
        }
    
        const v0 = vertices[face[0]];
        const v1 = vertices[face[1]];
        const v2 = vertices[face[2]];
    
        const u = Utils.subtractVectors(v1, v0);
        const v = Utils.subtractVectors(v2, v0);
    
        const normal = Utils.crossProduct(u, v);
        return Utils.normalizeVector(normal);
    }

}