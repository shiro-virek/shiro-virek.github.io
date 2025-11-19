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


}