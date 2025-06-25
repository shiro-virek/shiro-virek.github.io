class Color {
    static getColorLightness = (r, g, b) => {
        return (0.21 * r) + (0.72 * g) + (0.07 * b)
    }

    static rgbToHsl = (r, g, b) => {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // gris
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d) + (g < b ? 6 : 0); break;
                case g: h = ((b - r) / d) + 2; break;
                case b: h = ((r - g) / d) + 4; break;
            }
            h *= 60;
        }

        return { h, s: s * 100, l: l * 100 };
    }

    static hslToRgb = (h, s, l) => {
        s /= 100;
        l /= 100;

        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;
        let r1, g1, b1;

        if (h < 60) {
            [r1, g1, b1] = [c, x, 0];
        } else if (h < 120) {
            [r1, g1, b1] = [x, c, 0];
        } else if (h < 180) {
            [r1, g1, b1] = [0, c, x];
        } else if (h < 240) {
            [r1, g1, b1] = [0, x, c];
        } else if (h < 300) {
            [r1, g1, b1] = [x, 0, c];
        } else {
            [r1, g1, b1] = [c, 0, x];
        }

        const r = Math.round((r1 + m) * 255);
        const g = Math.round((g1 + m) * 255);
        const b = Math.round((b1 + m) * 255);

        return { r, g, b };
    }


}