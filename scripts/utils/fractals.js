class Fractals {

    static mandelbrot = (rc, ic, maxIterations, pow) => {
        let zr = 0;
        let zi = 0;
        
        for (let i = 0; i < maxIterations; i++) {
            let zr_pow = zr;
            let zi_pow = zi;
            
            let rTemp = zr;
            let iTemp = zi;
            
            for (let j = 1; j < pow; j++) {
                const newR = rTemp * zr_pow - iTemp * zi_pow;
                const newI = rTemp * zi_pow + iTemp * zr_pow;
                rTemp = newR;
                iTemp = newI;
            }
            
            zr = rTemp + rc;
            zi = iTemp + ic;
            
            if (zr * zr + zi * zi > 4) {
                return i;
            }
        }
        
        return 0;
    }

    static julia = (zr, zi, maxIterations, pow, cr, ci) => {
        for (let i = 0; i < maxIterations; i++) {
            let zr_pow = zr;
            let zi_pow = zi;
            
            let rTemp = zr;
            let iTemp = zi;
            
            for (let j = 1; j < pow; j++) {
                const newR = rTemp * zr_pow - iTemp * zi_pow;
                const newI = rTemp * zi_pow + iTemp * zr_pow;
                rTemp = newR;
                iTemp = newI;
            }
            
            zr = rTemp + cr;
            zi = iTemp + ci;
            
            if (zr * zr + zi * zi > 4) {
                return i;
            }
        }
        
        return 0;
    }
}