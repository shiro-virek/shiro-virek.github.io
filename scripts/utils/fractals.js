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

}