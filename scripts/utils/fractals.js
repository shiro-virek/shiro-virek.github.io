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

    static tricorn = (px, py, maxIterations, pow) => {
        let x = 0;
        let y = 0;
        let iteration = 0;

        while (x * x + y * y <= 4 && iteration < maxIterations) {
            let r = Math.sqrt(x * x + y * y);
            let theta = Math.atan2(y, x);

            theta = -theta;

            r = Math.pow(r, pow);
            theta = theta * pow;

            let xTemp = r * Math.cos(theta) + px;
            let yTemp = r * Math.sin(theta) + py;

            x = xTemp;
            y = yTemp;
            iteration++;
        }

        if (iteration === maxIterations) {
            return 0;
        } else {
            return iteration;
        }
    }

    static newtonRoots = [
        { re: 1, im: 0 },
        { re: -0.5, im: Math.sqrt(3) / 2 },
        { re: -0.5, im: -Math.sqrt(3) / 2 }
    ];

    static newton = (x, y, maxIterations, pow) => {
        let z = { re: x, im: y };
        let tolerance = 1e-6;

        for (let i = 0; i < maxIterations; i++) {
            const p = 4;

            let r = Math.hypot(z.re, z.im);
            let theta = Math.atan2(z.im, z.re);

            let f_r = Math.pow(r, pow);
            let f_theta = theta * pow;
            let f_re = f_r * Math.cos(f_theta) - 1;
            let f_im = f_r * Math.sin(f_theta);

            let df_r = pow * Math.pow(r, pow - 1);
            let df_theta = theta * (pow - 1);
            let df_re = df_r * Math.cos(df_theta);
            let df_im = df_r * Math.sin(df_theta);

            let denom = df_re * df_re + df_im * df_im;
            let num_re = f_re * df_re + f_im * df_im;
            let num_im = f_im * df_re - f_re * df_im;

            z.re -= num_re / denom;
            z.im -= num_im / denom;

            for (const root of Fractals.newtonRoots) {
                let dx = z.re - root.re;
                let dy = z.im - root.im;
                if (dx * dx + dy * dy < tolerance)
                    return i;
            }
        }

        return maxIterations;
    }

    static burningShip = (px, py, maxIterations, pow) => {
        let iteration = 0;
        let x = 0;
        let y = 0;
        while (x * x + y * y <= 4 && iteration < maxIterations) {
            let xtemp = x * x - y * y + px;
            y = Math.abs(2 * x * y) + py;
            x = Math.abs(xtemp);
            iteration++;
        }

        return iteration;
    }

    static phoenix = (px, py, maxIterations, pow, cr, ci) => {
        let zx = 0;
        let zy = 0;
        let zxPrev = 0;
        let zyPrev = 0;

        let iteration = 0;
        const pRe = cr;
        const pIm = ci;

        while (zx * zx + zy * zy <= 4 && iteration < maxIterations) {
            let r = Math.sqrt(zx * zx + zy * zy);
            let theta = Math.atan2(zy, zx);

            r = Math.pow(r, pow);
            theta = theta * pow;

            let zxk = r * Math.cos(theta);
            let zyk = r * Math.sin(theta);

            zxk += px;
            zyk += py;

            zxk += pRe * zxPrev - pIm * zyPrev;
            zyk += pRe * zyPrev + pIm * zxPrev;

            zxPrev = zx;
            zyPrev = zy;
            zx = zxk;
            zy = zyk;

            iteration++;
        }

        return iteration;
    }

    static lambda = (px, py, maxIterations, pow, cr, ci) => {
        const escapeRadius = 20;
        const zoom = 3;
        const centerX = 0;
        const centerY = 0;
        const xMin = centerX - zoom;
        const xMax = centerX + zoom;
        const yMin = centerY - zoom;
        const yMax = centerY + zoom;
        const lambdaRe = xMin + (px / width) * (xMax - xMin);
        const lambdaIm = yMin + (py / height) * (yMax - yMin);
        let zRe = 0.5;
        let zIm = 0.0;
        let iteration = 0;
        let escaped = false;
        pow = 2;
        maxIterations = 100;

        while (iteration < maxIterations) {
            const r = Math.hypot(zRe, zIm);
            const theta = Math.atan2(zIm, zRe);
            const rP = Math.pow(r, pow);
            const thetaP = theta * pow;
            const zpRe = rP * Math.cos(thetaP);
            const zpIm = rP * Math.sin(thetaP);

            const oneMinusZpRe = 1 - zpRe;
            const oneMinusZpIm = -zpIm;

            let multRe = zRe * oneMinusZpRe - zIm * oneMinusZpIm;
            let multIm = zRe * oneMinusZpIm + zIm * oneMinusZpRe;

            let newZRe = lambdaRe * multRe - lambdaIm * multIm;
            let newZIm = lambdaRe * multIm + lambdaIm * multRe;

            zRe = newZRe;
            zIm = newZIm;

            if (zRe * zRe + zIm * zIm > escapeRadius * escapeRadius) {
                escaped = true;
                break;
            }

            iteration++;
        }

        return escaped ? iteration : 0;
    }

    static nova = (zx, zy, maxIterations, pow, cr, ci) => {
        let iteration = 0;
        let converged = false;

        const escapeRadius = 1e6;
        const cRe = cr;  
        const cIm = ci;  

        while (iteration < maxIterations && zx * zx + zy * zy < escapeRadius) {
            const zp = Numbers.complexPow(zx, zy, pow);
            const zp1 = Numbers.complexPow(zx, zy, pow - 1);

            const fRe = zp.re - 1;
            const fIm = zp.im;

            const dfRe = pow * zp1.re;
            const dfIm = pow * zp1.im;

            const denom = dfRe * dfRe + dfIm * dfIm;
            let fracRe = (fRe * dfRe + fIm * dfIm) / denom;
            let fracIm = (fIm * dfRe - fRe * dfIm) / denom;

            let corrRe = cRe * fracRe - cIm * fracIm;
            let corrIm = cRe * fracIm + cIm * fracRe;

            zx -= corrRe;
            zy -= corrIm;

            if (Math.hypot(zp.re - 1, zp.im) < 1e-3 ||
                Math.hypot(zp.re + 0.5, zp.im - Math.sqrt(3) / 2) < 1e-3 ||
                Math.hypot(zp.re + 0.5, zp.im + Math.sqrt(3) / 2) < 1e-3) {
                converged = true;
                break;
            }

            iteration++;
        }

        return converged ? iteration : 0;
    }

    static magnetType1 = (zx, zy, maxIterations, pow, cr, ci) => {
        const qRe = cr;
        const qIm = ci;
        const escapeRadius = 10;
        let iteration = 0;

        while (zx * zx + zy * zy < escapeRadius * escapeRadius && iteration < maxIterations) {
            const num = Numbers.complexPow(zx, zy, pow);
            num.re += zx;
            num.im += zy;

            const zPow = Numbers.complexPow(zx, zy, pow - 1);
            const denRe = qRe * zPow.re - qIm * zPow.im + 1;
            const denIm = qRe * zPow.im + qIm * zPow.re;

            const denomMagSq = denRe * denRe + denIm * denIm;
            let newZx = (num.re * denRe + num.im * denIm) / denomMagSq;
            let newZy = (num.im * denRe - num.re * denIm) / denomMagSq;

            zx = newZx;
            zy = newZy;

            iteration++;
        }

        return iteration;
    }
}