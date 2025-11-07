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

    static pointsInterpolation = (x1, y1, x2, y2, pointsNumber) => {
        const points = [];

        for (let i = 0; i <= pointsNumber; i++) {
            let t = i / pointsNumber;
            let x = x1 + t * (x2 - x1);
            let y = y1 + t * (y2 - y1);

            points.push({x: Math.floor(x), y: Math.floor(y)});
        }

        return points;
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

    static orientation = (ax, ay, bx, by, cx, cy) => {
        const val = (by - ay) * (cx - bx) - (bx - ax) * (cy - by);
        if (val === 0) return 0;       
        return val > 0 ? 1 : 2;         
    }

    static onSegment = (ax, ay, bx, by, cx, cy) => {
        return Math.min(ax, bx) <= cx && cx <= Math.max(ax, bx) &&
                Math.min(ay, by) <= cy && cy <= Math.max(ay, by);
    }

    static getSegmentsIntersectionPoint = (x1, y1, x2, y2, x3, y3, x4, y4) => {
        const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

        if (denom === 0) return null;

        const px = ((x1*y2 - y1*x2)*(x3 - x4) - (x1 - x2)*(x3*y4 - y3*x4)) / denom;
        const py = ((x1*y2 - y1*x2)*(y3 - y4) - (y1 - y2)*(x3*y4 - y3*x4)) / denom;

        const dentroLinea1 = (px >= Math.min(x1, x2) && px <= Math.max(x1, x2)) &&
                            (py >= Math.min(y1, y2) && py <= Math.max(y1, y2));
        const dentroLinea2 = (px >= Math.min(x3, x4) && px <= Math.max(x3, x4)) &&
                            (py >= Math.min(y3, y4) && py <= Math.max(y3, y4));

        if (dentroLinea1 && dentroLinea2) {
            return { x: px, y: py };
        }
        return null;
    }


    static segmentsIntersect = (x1, y1, x2, y2, x3, y3, x4, y4) => {
        const o1 = Trigonometry.orientation(x1, y1, x2, y2, x3, y3);
        const o2 = Trigonometry.orientation(x1, y1, x2, y2, x4, y4);
        const o3 = Trigonometry.orientation(x3, y3, x4, y4, x1, y1);
        const o4 = Trigonometry.orientation(x3, y3, x4, y4, x2, y2);

        if (o1 !== o2 && o3 !== o4) return true;

        if (o1 === 0 && Trigonometry.onSegment(x1, y1, x2, y2, x3, y3)) return true;
        if (o2 === 0 && Trigonometry.onSegment(x1, y1, x2, y2, x4, y4)) return true;
        if (o3 === 0 && Trigonometry.onSegment(x3, y3, x4, y4, x1, y1)) return true;
        if (o4 === 0 && Trigonometry.onSegment(x3, y3, x4, y4, x2, y2)) return true;

        return false;
    }



}