class Trigonometry {
    static RAD_CONST = 0.0175;

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

    static angleBetweenTwoPoints = (x1, y1, x2, y2) => {
        let angle = Math.atan2(y2 - y1, x2 - x1);
        angle *= 180 / Math.PI;
        if (angle < 0) angle = 360 + angle;
        return angle;
    }

    static distanceBetweenTwoPoints = (x1, y1, x2, y2) => {
        let deltaX = x2 - x1;
        let deltaY = y2 - y1;
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }

    static sexagesimalToRadian = (degrees) => {
        return degrees * (Math.PI / 180);
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

    static bresenhamLine = (x1, y1, x2, y2) => {
        const points = [];

        let dx = Math.abs(x2 - x1);
        let dy = Math.abs(y2 - y1);
        let sx = (x1 < x2) ? 1 : -1;
        let sy = (y1 < y2) ? 1 : -1;
        let err = dx - dy;

        while (true) {
            points.push({x: x1, y: y1});

            if (x1 === x2 && y1 === y2) break;
            let e2 = 2 * err;
            if (e2 > -dy) {
            err -= dy;
            x1 += sx;
            }
            if (e2 < dx) {
            err += dx;
            y1 += sy;
            }
        }

        return points;
    }
}