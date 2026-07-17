class ThreeDWorld {
    constructor(width, height, random, drawLine, drawPoint, drawFace) {
        this.width = width;
        this.height = height;
        this.random = random;
        this.drawLine = drawLine;
        this.drawPoint = drawPoint;
        this.drawFace = drawFace;
        this.figures = [];
        this.cameraRotationX = 0; 
        this.cameraRotationZ = 0;
        this.cameraZ = 1000;
        this.FOV = 800;
        this.drawFigureEdges = true;
        this.drawFigureVertices = false;
        this.drawFigureFaces = false;
        this.primitive = primitives[0];
        this.rotationMode = 0;      
        this.cameraMode = 0;
        this.lightDirection = [0, 0, 1]  
    }
    
    draw = () => {
        if (this.drawFigureFaces)
            this.drawFaces();

        if (this.drawFigureEdges || (!this.drawFigureFaces && !this.drawFigureEdges && !this.drawFigureVertices))
            this.drawEdges();
        
        if (this.drawFigureVertices)
            this.drawVertices();
    }

    worldToScreen = (point) => {
        const rotatedPoint = this.applyCameraRotation(point); 
        
        const x = rotatedPoint[0];
        const y = rotatedPoint[1];
        const z = rotatedPoint[2];

        let scaleFactor = 0;

        if (this.cameraMode == 0){            
            let depth = z + this.cameraZ;
            if (depth < 1) depth = 1; 

            scaleFactor = this.FOV / depth;
        }else{
            if (z <= 1) return [-9999, -9999]; 

            scaleFactor = this.FOV / z;
        }

        
        const projectedX = (x * scaleFactor) + this.width / 2;
        const projectedY = (y * scaleFactor) + this.height / 2;
        
        return [projectedX, projectedY];    
    }

    worldToScreenOblique = (point, angleX, angleY) => {
        const radianX = (angleX * Math.PI) / 180;
        const radianY = (angleY * Math.PI) / 180;

        const projectedX = point[0] + point[2] * Math.tan(radianY);
        const projectedY = point[1] + point[2] * Math.tan(radianX);

        return [projectedX, projectedY];
    }

    worldToScreenIsometric = (point) => {
        const isoMatrix = [
            Math.sqrt(3) / 2, -1 / 2, 0,
            Math.sqrt(3) / 2, 1 / 2, 0,
            0, 0, 1
        ];

        const projectedX = isoMatrix[0] * point[0] + isoMatrix[1] * point[1] + isoMatrix[2] * point[2];
        const projectedY = isoMatrix[3] * point[0] + isoMatrix[4] * point[1] + isoMatrix[5] * point[2];
        const projectedZ = isoMatrix[6] * point[0] + isoMatrix[7] * point[1] + isoMatrix[8] * point[2];

        return [projectedX, projectedY];
    }

    drawFaces = () => {

        if (this.cameraMode == 0) {

            this.figures.forEach(figure => {
                figure.cachedZ = figure.getAverageZ();
            });

            this.figures.sort((a, b) => {
                if (isNaN(a.cachedZ)) return 1; 
                if (isNaN(b.cachedZ)) return -1;
                
                return b.cachedZ - a.cachedZ;
            });

            this.figures.forEach(figure => {
                figure.drawFaces(ctx);
            });

        }else{

            let allFaces = [];

            this.figures.forEach(figure => {
                figure.faces.forEach(faceIndices => {
                    const viewVertices = faceIndices.map(index => 
                        this.applyCameraTransform(figure.vertices[index])
                    );

                    let isBehindCamera = false;
                    for (let v of viewVertices) {
                        if (v[2] <= 1) {
                            isBehindCamera = true;
                            break;
                        }
                    }
                    if (isBehindCamera) return;

                    if (figure.shouldDrawFace(viewVertices)) {
                        let sumZ = 0;
                        viewVertices.forEach(v => sumZ += v[2]);
                        const avgZ = sumZ / viewVertices.length;

                        allFaces.push({
                            worldVertices: faceIndices.map(index => figure.vertices[index]),
                            viewZ: avgZ,
                            hue: figure.hue,
                            life: figure.isDebris ? figure.life : 1.0,
                            lightness: figure.getLightness(viewVertices)
                        });
                    }
                });
            });

            allFaces.sort((a, b) => b.viewZ - a.viewZ);

            allFaces.forEach(face => {
                this.drawSingleFace(face);
            });

        }

    }

    drawSingleFace = (face) => {
        const dist = face.viewZ;
        let fogAlpha = Numbers.scale(dist, 2000, 5000, 1, 0);
        if (fogAlpha < 0) fogAlpha = 0;

        let finalAlpha = fogAlpha * face.life;
        if (finalAlpha < 0) finalAlpha = 0;
        if (finalAlpha > 1) finalAlpha = 1;

        let enableFog = false;

        const color = `hsla(${face.hue}, 100%, ${face.lightness}%, ${enableFog ? finalAlpha.toFixed(2) : 1})`;
        
        ctx.beginPath();
        let screenPoint = this.worldToScreen(face.worldVertices[0]);
        ctx.moveTo(screenPoint[0], screenPoint[1]);
        
        for (let i = 1; i < face.worldVertices.length; i++) {
            screenPoint = this.worldToScreen(face.worldVertices[i]);
            ctx.lineTo(screenPoint[0], screenPoint[1]);
        }
        
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.strokeStyle = color; 
        ctx.lineWidth = 1;    
        ctx.fill();
        ctx.stroke();
    }

    drawEdges = () => {
        for (let i = this.figures.length - 1; i >= 0; i--) {
            this.figures[i].drawEdges(ctx);
        }
    }

    drawVertices = () => {
        for (let i = this.figures.length - 1; i >= 0; i--) {
            this.figures[i].drawVertices(ctx);
        }
    }

    addFigure(x, y) {
        let centeredX = x - this.width / 2;
        let centeredY = y - this.height / 2;

        let figure = new Figure(this);

        figure.vertices = Objects.clone(this.primitive.vertices);
        figure.edges = Objects.clone(this.primitive.edges);
        figure.faces = Objects.clone(this.primitive.faces);

        const scaleFactor = this.FOV / this.cameraZ;
        let worldX = centeredX / scaleFactor;
        let worldY = centeredY / scaleFactor;
        let worldZ = 0; 
        
        if (this.cameraRotationZ !== 0) {
            let angleZ = Trigonometry.sexagesimalToRadian(this.cameraRotationZ); 
            let newX = worldX * Math.cos(angleZ) + worldY * (-Math.sin(angleZ));
            let newY = worldX * Math.sin(angleZ) + worldY * Math.cos(angleZ);
            worldX = newX;
            worldY = newY;
        }

        if (this.cameraRotationX !== 0) {
            let angleX = Trigonometry.sexagesimalToRadian(this.cameraRotationX);
            let newY = worldY * Math.cos(angleX) + worldZ * (-Math.sin(angleX));
            let newZ = worldY * Math.sin(angleX) + worldZ * Math.cos(angleX);
            worldY = newY;
        }

        figure.translateX(worldX);
        figure.translateY(worldY);

        this.figures.push(figure);
    }

    applyCameraRotation = (point) => {
        let x = point[0];
        let y = point[1];
        let z = point[2];
                    
        let angleX = Trigonometry.sexagesimalToRadian(-this.cameraRotationX); 
        let newY = y * Math.cos(angleX) + z * (-Math.sin(angleX));
        let newZ = y * Math.sin(angleX) + z * Math.cos(angleX);
        y = newY;
        z = newZ;

        let angleZ = Trigonometry.sexagesimalToRadian(-this.cameraRotationZ);
        let newX = x * Math.cos(angleZ) + y * (-Math.sin(angleZ));
        newY = x * Math.sin(angleZ) + y * Math.cos(angleZ);
        x = newX;
        y = newY;
        
        return [x, y, z];
    
    }

    applyCameraTransform = (point) => {
        let x = point[0] - this.cameraX;
        let y = point[1] - this.cameraY;
        let z = point[2] - this.cameraZ;
        
        let angleZ = Trigonometry.sexagesimalToRadian(-this.cameraRotationZ);
        let cosZ = Math.cos(angleZ);
        let sinZ = Math.sin(angleZ);
        
        let nx = x * cosZ - z * sinZ;
        let nz = x * sinZ + z * cosZ;
        x = nx;
        z = nz;

        let angleX = Trigonometry.sexagesimalToRadian(-this.cameraRotationX);
        let cosX = Math.cos(angleX);
        let sinX = Math.sin(angleX);
        
        let ny = y * cosX - z * sinX;
        nz = y * sinX + z * cosX;
        y = ny;
        z = nz;
        
        return [x, y, z];
    }
                    
}



class Figure {
    constructor(world) {
        this.vertices = [];
        this.edges = [];
        this.faces = [];
        this.world = world;
        this.hue = this.world.random.nextInt(1, 360);
    }

    rotateZ = (angle) => {
        angle = Trigonometry.sexagesimalToRadian(angle);

        for (let i = this.vertices.length - 1; i >= 0; i--) {
            let x = this.vertices[i][0] * Math.cos(angle) + this.vertices[i][1] * (-Math.sin(angle));
            this.vertices[i][1] = this.vertices[i][0] * Math.sin(angle) + this.vertices[i][1] * Math.cos(angle); //Y
            this.vertices[i][0] = x;
        }
    }

    rotateY = (angle) => {
        angle = Trigonometry.sexagesimalToRadian(angle);

        for (let i = this.vertices.length - 1; i >= 0; i--) {
            let x = this.vertices[i][0] * Math.cos(angle) + this.vertices[i][2] * Math.sin(angle);
            this.vertices[i][2] = this.vertices[i][0] * (-Math.sin(angle)) + this.vertices[i][2] * Math.cos(angle); //Z
            this.vertices[i][0] = x;
        }
    }

    rotateX = (angle) => {
        angle = Trigonometry.sexagesimalToRadian(angle);

        for (let i = this.vertices.length - 1; i >= 0; i--) {
            let y = this.vertices[i][1] * Math.cos(angle) + this.vertices[i][2] * (-Math.sin(angle));
            this.vertices[i][2] = this.vertices[i][1] * Math.sin(angle) + this.vertices[i][2] * Math.cos(angle); //Z
            this.vertices[i][1] = y;
        }
    }

    translateX = (distance) => {
        for (let i = this.vertices.length - 1; i >= 0; i--) {
            this.vertices[i][0] += distance;
        }
    }

    translateY = (distance) => {
        for (let i = this.vertices.length - 1; i >= 0; i--) {
            this.vertices[i][1] += distance;
        }
    }

    translateZ = (distance) => {
        for (let i = this.vertices.length - 1; i >= 0; i--) {
            this.vertices[i][2] += distance;
        }
    }

    scale = (factor) => {
        for (let i = this.vertices.length - 1; i >= 0; i--) {
            this.vertices[i][0] *= factor;
            this.vertices[i][1] *= factor;
            this.vertices[i][2] *= factor;
        }
    }

    scaleX = (factor) => {
        for (let i = this.vertices.length - 1; i >= 0; i--) {
            this.vertices[i][0] *= factor;
        }
    }

    scaleY = (factor) => {
        for (let i = this.vertices.length - 1; i >= 0; i--) {
            this.vertices[i][1] *= factor;
        }
    }

    scaleZ = (factor) => {
        for (let i = this.vertices.length - 1; i >= 0; i--) {
            this.vertices[i][2] *= factor;
        }
    }

    shearX = (amount) => {
        for (let i = this.vertices.length - 1; i >= 0; i--) {
            this.vertices[i][1] = this.vertices[i][1] + amount * this.vertices[i][0];
            this.vertices[i][2] = this.vertices[i][2] + amount * this.vertices[i][0];
        }
    }

    shearY = (amount) => {
        for (let i = this.vertices.length - 1; i >= 0; i--) {
            this.vertices[i][0] = this.vertices[i][0] + amount * this.vertices[i][1];
            this.vertices[i][2] = this.vertices[i][2] + amount * this.vertices[i][1];
        }
    }

    shearZ = (amount) => {
        for (let i = this.vertices.length - 1; i >= 0; i--) {
            this.vertices[i][0] = this.vertices[i][0] + amount * this.vertices[i][2];
            this.vertices[i][1] = this.vertices[i][1] + amount * this.vertices[i][2];
        }
    }

    drawEdge = (p0, p1, color) => {
        let point2d0 = this.world.worldToScreen(p0);
        let point2d1 = this.world.worldToScreen(p1);

       this.world.drawLine(ctx, point2d0[0], point2d0[1], point2d1[0], point2d1[1], color);
    }

    drawVertex = (point, color) => {
        let vertex = this.world.worldToScreen(point);

        let newColor = `hsl(${Numbers.scale(point[2], -500, 500, 300, 360)}, ${100}%, ${50}%)`;

        this.world.drawPoint(ctx, vertex[0], vertex[1], newColor);
    }

    drawEdges = () => {
        for (let i = this.edges.length - 1; i >= 0; i--) {
            this.drawEdge(this.vertices[this.edges[i][0]], this.vertices[this.edges[i][1]]);
        }
    }

    drawVertices = () => {
        for (let i = this.vertices.length - 1; i >= 0; i--) {
            this.drawVertex(this.vertices[i]);
        }
    }

    drawFaces = () => {
        let facesToDraw = [];

        this.faces.forEach(faceIndices => {
            const rotatedVertices = faceIndices.map(index => 
                this.world.applyCameraRotation(this.vertices[index])
            );

            let faceLightness = 0;
            if (rotatedVertices.length >= 3) {
                faceLightness = this.getLightness([
                    rotatedVertices[0], 
                    rotatedVertices[1], 
                    rotatedVertices[2]
                ]);
            }

            for (let i = 1; i < rotatedVertices.length - 1; i++) {
                const tVerts = [
                    rotatedVertices[0],            
                    rotatedVertices[i],            
                    rotatedVertices[i + 1]         
                ];
                
                const tIndices = [
                    faceIndices[0],
                    faceIndices[i],
                    faceIndices[i + 1]
                ];

                let sumZ = tVerts[0][2] + tVerts[1][2] + tVerts[2][2];
                const avgZ = sumZ / 3;

                facesToDraw.push({
                    originalIndices: tIndices,
                    rotatedVertices: tVerts,
                    avgZ: avgZ,
                    lightness: faceLightness 
                });
            }
        });

        facesToDraw.sort((a, b) => b.avgZ - a.avgZ);

        facesToDraw.forEach(item => {
            if (this.shouldDrawFace(item.rotatedVertices)) {
                let vertices1 = [];
                for (let i = 0; i < item.originalIndices.length; i++) {
                    vertices1[i] = this.world.worldToScreen(this.vertices[item.originalIndices[i]]);
                }

                this.world.drawFace(vertices1, item.lightness, this.hue);                    
            }
        });
    }
        
    shouldDrawFace = (rotatedVertices) => {
        const vector1 = Trigonometry.subtractVectors(rotatedVertices[1], rotatedVertices[0]);
        const vector2 = Trigonometry.subtractVectors(rotatedVertices[2], rotatedVertices[0]);

        const normal = Trigonometry.crossProduct(vector1, vector2);
        const cameraDirection = [0, 0, 1];
        
        return Trigonometry.dotProduct(normal, cameraDirection) > 0;
    }

    getLightness = (rotatedVertices) => {
        const vector1 = Trigonometry.subtractVectors(rotatedVertices[1], rotatedVertices[0]);
        const vector2 = Trigonometry.subtractVectors(rotatedVertices[2], rotatedVertices[0]);
        
        let normal = Trigonometry.crossProduct(vector1, vector2);
    
        let magnitude = Math.sqrt(normal[0]*normal[0] + normal[1]*normal[1] + normal[2]*normal[2]);

        if (magnitude === 0) magnitude = 1;

        normal[0] /= magnitude;
        normal[1] /= magnitude;
        normal[2] /= magnitude;
        // -----------------------------------
    
        const dotProduct = Trigonometry.dotProduct(normal, this.world.lightDirection);
        
        const lightness = Numbers.scale(dotProduct, 0, 1, 20, 70); 

        if (lightness < 0) return 0;
        if (lightness > 100) return 100;
        return lightness;
    }
    
    getAverageZ = () => {
        let sumZ = 0;
        for (let i = 0; i < this.vertices.length; i++) {
            let rotatedVertex = this.world.applyCameraRotation(this.vertices[i]);
            sumZ += rotatedVertex[2];
        }
        return sumZ / this.vertices.length;
    }

}

class ThreeD {
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
        
    static calculateCameraPosition = (distance, theta, phi) => {
        const x = distance * Math.sin(theta) * Math.cos(phi);
        const y = distance * Math.sin(theta) * Math.sin(phi);
        const z = distance * Math.cos(theta);
        return [x, y, z];
    }
    
    static calculateFaceNormal = (vertices, face) => {
        if (face.length < 3) {
            throw new Error('Needs at least 3 vertices');
        }
    
        const v0 = vertices[face[0]];
        const v1 = vertices[face[1]];
        const v2 = vertices[face[2]];
    
        const u = Trigonometry.subtractVectors(v1, v0);
        const v = Trigonometry.subtractVectors(v2, v0);
    
        const normal = Trigonometry.crossProduct(u, v);
        return Trigonometry.normalizeVector(normal);
    }

    static generateSphere(radius = 30, latSegs = 8, lonSegs = 8) {
        const vertices = [];
        const edges = [];
        const faces = [];
        for (let lat = 0; lat <= latSegs; lat++) {
            const u = (lat / latSegs) * Math.PI;
            for (let lon = 0; lon <= lonSegs; lon++) {
                const v = (lon / lonSegs) * 2 * Math.PI;
                vertices.push([radius * Math.sin(u) * Math.cos(v), radius * Math.cos(u), radius * Math.sin(u) * Math.sin(v)]);
            }
        }
        for (let lat = 0; lat < latSegs; lat++) {
            for (let lon = 0; lon < lonSegs; lon++) {
                const v0 = lat * (lonSegs + 1) + lon;
                const v1 = v0 + 1;
                const v2 = (lat + 1) * (lonSegs + 1) + lon + 1;
                const v3 = v2 - 1;
                edges.push([v0, v1], [v1, v2], [v2, v3], [v3, v0]);
                faces.push([v0, v1, v2, v3]);
            }
        }
        return { vertices, edges, faces };
    }

    static generateCylinder(radius = 25, height = 40, segs = 12) {
        const vertices = [];
        const edges = [];
        const faces = [];
        const halfH = height / 2;
        for (let i = 0; i < segs; i++) {
            const angle = (i / segs) * 2 * Math.PI;
            vertices.push([radius * Math.cos(angle), halfH, radius * Math.sin(angle)]);
        }
        for (let i = 0; i < segs; i++) {
            const angle = (i / segs) * 2 * Math.PI;
            vertices.push([radius * Math.cos(angle), -halfH, radius * Math.sin(angle)]);
        }
        const topFace = [];
        for (let i = 0; i < segs; i++) topFace.push(i);
        faces.push(topFace);
        const bottomFace = [];
        for (let i = segs - 1; i >= 0; i--) bottomFace.push(segs + i);
        faces.push(bottomFace);
        for (let i = 0; i < segs; i++) {
            const next = (i + 1) % segs;
            edges.push([i, next]);
            edges.push([segs + i, segs + next]);
            edges.push([i, segs + i]);
            faces.push([i, next, segs + next, segs + i]);
        }
        return { vertices, edges, faces };
    }

    static generateTorus(ringRadius = 30, tubeRadius = 12, ringSegs = 12, tubeSegs = 8) {
        const vertices = [];
        const edges = [];
        const faces = [];
        for (let i = 0; i <= ringSegs; i++) {
            const u = (i / ringSegs) * 2 * Math.PI;
            for (let j = 0; j <= tubeSegs; j++) {
                const v = (j / tubeSegs) * 2 * Math.PI;
                vertices.push([(ringRadius + tubeRadius * Math.cos(v)) * Math.cos(u), tubeRadius * Math.sin(v), (ringRadius + tubeRadius * Math.cos(v)) * Math.sin(u)]);
            }
        }
        for (let i = 0; i < ringSegs; i++) {
            for (let j = 0; j < tubeSegs; j++) {
                const v0 = i * (tubeSegs + 1) + j;
                const v1 = v0 + 1;
                const v2 = (i + 1) * (tubeSegs + 1) + j + 1;
                const v3 = v2 - 1;
                edges.push([v0, v1], [v1, v2], [v2, v3], [v3, v0]);
                faces.push([v0, v1, v2, v3]);
            }
        }
        return { vertices, edges, faces };
    }

    static generateHeart(size = 30, uSegs = 16, vSegs = 10) {
        const vertices = [];
        const edges = [];
        const faces = [];
        for (let i = 0; i <= uSegs; i++) {
            const u = (i / uSegs) * 2 * Math.PI;
            for (let j = 0; j <= vSegs; j++) {
                const v = (j / vSegs) * Math.PI;
                const sv = Math.sin(v);
                const x = sv * (15 * Math.sin(u) - 4 * Math.sin(3 * u));
                const y = 8 * Math.cos(v);
                const z = sv * (15 * Math.cos(u) - 5 * Math.cos(2 * u) - 2 * Math.cos(3 * u) - Math.cos(4 * u));
                vertices.push([x * size / 15, y * size / 15, z * size / 15]);
            }
        }
        for (let i = 0; i < uSegs; i++) {
            for (let j = 0; j < vSegs; j++) {
                const v0 = i * (vSegs + 1) + j;
                const v1 = v0 + 1;
                const v2 = (i + 1) * (vSegs + 1) + j + 1;
                const v3 = v2 - 1;
                edges.push([v0, v1], [v1, v2], [v2, v3], [v3, v0]);
                faces.push([v0, v1, v2, v3]);
            }
        }
        return { vertices, edges, faces };
    }

    static generateInfinity(size = 30, tubeRadius = 8, ringSegs = 16, tubeSegs = 8) {
        const vertices = [];
        const edges = [];
        const faces = [];
        for (let i = 0; i <= ringSegs; i++) {
            const u = (i / ringSegs) * 2 * Math.PI;
            const denom = 1 + Math.sin(u) * Math.sin(u);
            const cx = size * Math.cos(u) / denom;
            const cy = size * Math.sin(u) * Math.cos(u) / denom;
            const du = 0.001;
            const ud = u + du;
            const denomD = 1 + Math.sin(ud) * Math.sin(ud);
            const tx = size * Math.cos(ud) / denomD - cx;
            const ty = size * Math.sin(ud) * Math.cos(ud) / denomD - cy;
            const tLen = Math.sqrt(tx * tx + ty * ty) || 1;
            const nx = -ty / tLen;
            const ny = tx / tLen;
            for (let j = 0; j <= tubeSegs; j++) {
                const v = (j / tubeSegs) * 2 * Math.PI;
                vertices.push([cx + tubeRadius * (Math.cos(v) * nx), cy + tubeRadius * (Math.cos(v) * ny), tubeRadius * Math.sin(v)]);
            }
        }
        for (let i = 0; i < ringSegs; i++) {
            for (let j = 0; j < tubeSegs; j++) {
                const v0 = i * (tubeSegs + 1) + j;
                const v1 = v0 + 1;
                const v2 = (i + 1) * (tubeSegs + 1) + j + 1;
                const v3 = v2 - 1;
                edges.push([v0, v1], [v1, v2], [v2, v3], [v3, v0]);
                faces.push([v0, v1, v2, v3]);
            }
        }
        return { vertices, edges, faces };
    }


}

let primitives = [
   {
    name: "cube",
            vertices: [
                [-20, -20, -20],
                [ 20, -20, -20],
                [ 20,  20, -20],
                [-20,  20, -20],
                [-20, -20,  20],
                [ 20, -20,  20],
                [ 20,  20,  20],
                [-20,  20,  20]
            ],
            edges: [
                [0,1],[1,2],[2,3],[3,0],
                [4,5],[5,6],[6,7],[7,4],
                [0,4],[1,5],[2,6],[3,7]
            ],
            faces: [
                [0,1,2,3],
                [4,7,6,5],
                [0,4,5,1],
                [3,7,4,0],
                [1,5,6,2],
                [3,2,6,7]
            ]
        },
        {
            name: "hex_prism",
            vertices: [
                [-15, 20, -26], [15, 20, -26], [30, 20, 0], 
                [15, 20, 26], [-15, 20, 26], [-30, 20, 0],
                [-15, -20, -26], [15, -20, -26], [30, -20, 0], 
                [15, -20, 26], [-15, -20, 26], [-30, -20, 0]
            ],
            edges: [
                [0,1],[1,2],[2,3],[3,4],[4,5],[5,0],
                [6,7],[7,8],[8,9],[9,10],[10,11],[11,6],
                [0,6],[1,7],[2,8],[3,9],[4,10],[5,11]
            ],
            faces: [
                [0, 1, 2, 3, 4, 5], 
                [11, 10, 9, 8, 7, 6],    
                [0, 6, 7, 1],
                [1, 7, 8, 2],
                [2, 8, 9, 3],
                [3, 9, 10, 4],
                [4, 10, 11, 5],
                [5, 11, 6, 0]
            ]
        },
        {
            name: "pyramid",
            vertices: [
                [-20, -20, -20], 
                [20, -20, -20],  
                [20, -20, 20],   
                [-20, -20, 20],  
                [0, 20, 0]       
            ],
            edges: [
                [0,1],[1,2],[2,3],[3,0],
                [0,4],[1,4],[2,4],[3,4]
            ],
            faces: [
                [3, 2, 1, 0],
                [0, 1, 4],   
                [1, 2, 4],   
                [2, 3, 4],  
                [3, 0, 4]     
            ]
        },
        {
            name: "octahedron",
            vertices: [
                [0, -30, 0], 
                [0, 30, 0], 
                [-20, 0, -20], 
                [20, 0, -20],  
                [20, 0, 20],   
                [-20, 0, 20]   
            ],
            edges: [
                [0,2],[0,3],[0,4],[0,5],
                [1,2],[1,3],[1,4],[1,5],
                [2,3],[3,4],[4,5],[5,2]
            ],
            faces: [
                [1, 2, 3], [1, 3, 4], [1, 4, 5], [1, 5, 2],
                [0, 3, 2], [0, 4, 3], [0, 5, 4], [0, 2, 5]
            ]
        },      
        {
            "name": "star",
            "vertices": [
                [0, 30, 0],    
                [7, 11, 0],    
                [29, 9, 0],    
                [11, -4, 0],   
                [18, -24, 0],  
                [0, -11, 0],   
                [-18, -24, 0], 
                [-11, -4, 0],  
                [-29, 9, 0],   
                [-7, 11, 0],  

                [0, 30, 20],   
                [7, 11, 20],   
                [29, 9, 20],   
                [11, -4, 20],  
                [18, -24, 20], 
                [0, -11, 20],  
                [-18, -24, 20],
                [-11, -4, 20], 
                [-29, 9, 20],  
                [-7, 11, 20]   
            ],
            "edges": [
                [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 0],
                [10, 11], [11, 12], [12, 13], [13, 14], [14, 15], [15, 16], [16, 17], [17, 18], [18, 19], [19, 10],
                [0, 10], [1, 11], [2, 12], [3, 13], [4, 14], [5, 15], [6, 16], [7, 17], [8, 18], [9, 19]
            ],
            "faces": [
                [0,9,1],[2,1,3],[4,3,5],[6,5,7],[8,7,9],
                [1,5,3],[1,7,5],[1,9,7],
                [10,11,19],[12,13,11],[14,15,13],[16,17,15],[18,19,17],
                [11,13,15],[11,15,17],[11,17,19],
                [0,1,11,10],[1,2,12,11],[2,3,13,12],[3,4,14,13],[4,5,15,14],
                [5,6,16,15],[6,7,17,16],[7,8,18,17],[8,9,19,18],[9,0,10,19]
            ]
        },       
        {
            name: "pyramid2",
            vertices: [
                [10, 0, 10], [10, 20, 20], [0, 20, 0], [20, 20, 0]
            ],
            edges: [
                [0, 1], [0, 2], [0, 3], [1, 2], [2, 3], [1, 3]
            ],
            faces: [
                [0,1,2],[0,3,1],[0,2,3],[1,3,2]
            ]
        },
        {
            name: "icosahedron",
            vertices: [
                [0, 16, 0], [14.304, 7.152, 0], [4.416, 7.152, 13.616],
                [-11.584, 7.152, 8.416], [-11.584, 7.152, -8.416], [4.416, 7.152, -13.616],
                [11.584, -7.152, 8.416], [-4.416, -7.152, 13.616], [-14.304, -7.152, 0],
                [-4.416, -7.152, -13.616], [11.584, -7.152, -8.416], [0, -16, 0]
            ],
            edges: [
                [0, 1], [0, 2], [0, 3], [0, 4], [0, 5],
                [1, 2], [1, 5], [1, 6], [1, 10],
                [2, 3], [2, 6], [2, 7],
                [3, 4], [3, 7], [3, 8],
                [4, 5], [4, 8], [4, 9],
                [5, 9], [5, 10],
                [6, 7], [6, 10], [6, 11],
                [7, 8], [7, 11],
                [8, 9], [8, 11],
                [9, 10], [9, 11],
                [10, 11]
            ],
            faces: [
                [0,2,1],[0,3,2],[0,4,3],[0,5,4],[0,1,5],
                [1,2,6],[2,3,7],[3,4,8],[4,5,9],[5,1,10],
                [2,7,6],[3,8,7],[4,9,8],[5,10,9],[1,6,10],
                [11,6,7],[11,7,8],[11,8,9],[11,9,10],[11,10,6]
            ]
        },
        {
            name: "sphere",
            ...ThreeD.generateSphere()
        },
        {
            name: "cylinder",
            ...ThreeD.generateCylinder()
        },
        {
            name: "torus",
            ...ThreeD.generateTorus()
        },
        {
            name: "heart",
            ...ThreeD.generateHeart()
        },
        {
            name: "infinity",
            ...ThreeD.generateInfinity()
        },
    ]