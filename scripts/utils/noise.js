class Noise {
    static simplexNoise = (x, y, z) => {
        const perm = new Uint8Array(512);
        const grad3 = [
            [1,1,0], [-1,1,0], [1,-1,0], [-1,-1,0],
            [1,0,1], [-1,0,1], [1,0,-1], [-1,0,-1],
            [0,1,1], [0,-1,1], [0,1,-1], [0,-1,-1]
        ];

        for (let i = 0; i < 512; i++) {
            perm[i] = Math.floor(Math.random() * 256);
        }

        function dot(g, x, y, z) {
            return g[0]*x + g[1]*y + g[2]*z;
        }

        const F3 = 1.0 / 3.0;
        const G3 = 1.0 / 6.0;

        let s = (x + y + z) * F3;
        let i = Math.floor(x + s);
        let j = Math.floor(y + s);
        let k = Math.floor(z + s);

        let t = (i + j + k) * G3;
        let X0 = i - t;
        let Y0 = j - t;
        let Z0 = k - t;
        let x0 = x - X0;
        let y0 = y - Y0;
        let z0 = z - Z0;

        let i1, j1, k1, i2, j2, k2;
        
        if (x0 >= y0) {
            if (y0 >= z0) { i1=1; j1=0; k1=0; i2=1; j2=1; k2=0; }
            else if (x0 >= z0) { i1=1; j1=0; k1=0; i2=1; j2=0; k2=1; }
            else { i1=0; j1=0; k1=1; i2=1; j2=0; k2=1; }
        } else {
            if (y0 < z0) { i1=0; j1=0; k1=1; i2=0; j2=1; k2=1; }
            else if (x0 < z0) { i1=0; j1=1; k1=0; i2=0; j2=1; k2=1; }
            else { i1=0; j1=1; k1=0; i2=1; j2=1; k2=0; }
        }

        let x1 = x0 - i1 + G3;
        let y1 = y0 - j1 + G3;
        let z1 = z0 - k1 + G3;
        let x2 = x0 - i2 + 2.0 * G3;
        let y2 = y0 - j2 + 2.0 * G3;
        let z2 = z0 - k2 + 2.0 * G3;
        let x3 = x0 - 1.0 + 3.0 * G3;
        let y3 = y0 - 1.0 + 3.0 * G3;
        let z3 = z0 - 1.0 + 3.0 * G3;

        let ii = i & 255;
        let jj = j & 255;
        let kk = k & 255;
        
        let gi0 = perm[ii + perm[jj + perm[kk]]] % 12;
        let gi1 = perm[ii + i1 + perm[jj + j1 + perm[kk + k1]]] % 12;
        let gi2 = perm[ii + i2 + perm[jj + j2 + perm[kk + k2]]] % 12;
        let gi3 = perm[ii + 1 + perm[jj + 1 + perm[kk + 1]]] % 12;

        let t0 = 0.6 - x0*x0 - y0*y0 - z0*z0;
        let n0 = t0 < 0 ? 0.0 : t0 * t0 * t0 * t0 * dot(grad3[gi0], x0, y0, z0);
        
        let t1 = 0.6 - x1*x1 - y1*y1 - z1*z1;
        let n1 = t1 < 0 ? 0.0 : t1 * t1 * t1 * t1 * dot(grad3[gi1], x1, y1, z1);
        
        let t2 = 0.6 - x2*x2 - y2*y2 - z2*z2;
        let n2 = t2 < 0 ? 0.0 : t2 * t2 * t2 * t2 * dot(grad3[gi2], x2, y2, z2);
        
        let t3 = 0.6 - x3*x3 - y3*y3 - z3*z3;
        let n3 = t3 < 0 ? 0.0 : t3 * t3 * t3 * t3 * dot(grad3[gi3], x3, y3, z3);

        return 32.0 * (n0 + n1 + n2 + n3);
    }

    static simplexNoiseNormalized(x, y, z) {
        return (Noise.simplexNoise(x, y, z) + 1) / 2;
    }

}