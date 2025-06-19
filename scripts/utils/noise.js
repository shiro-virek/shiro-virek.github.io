class Noise {
    constructor() {
        this.seed();
    }

    randVect = () => {
        let theta = Math.random() * 2 * Math.PI;
        return { x: Math.cos(theta), y: Math.sin(theta), z: Math.sin(theta * 1.3) };
    }

    dotProdGrid = (x, y, z, vx, vy, vz) => {
        const key = `${vx},${vy},${vz}`;
        let gVect;
        const dVect = { x: x - vx, y: y - vy, z: z - vz };

        if (this.gradients[key]) {
            gVect = this.gradients[key];
        } else {
            gVect = this.randVect();
            this.gradients[key] = gVect;
        }

        return (
            dVect.x * gVect.x +
            dVect.y * gVect.y +
            dVect.z * gVect.z
        );
    }

    smootherStep = (x) => {
        return 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;
    }

    interp = (x, a, b) => {
        return a + this.smootherStep(x) * (b - a);
    }

    seed = () => {
        this.gradients = {};
        this.memory = {};
    }

    get = (x, y, z = 0) => {
        const key = `${x},${y},${z}`;
        if (this.memory.hasOwnProperty(key)) {
            return this.memory[key];
        }

        const xf = Math.floor(x);
        const yf = Math.floor(y);
        const zf = Math.floor(z);

        const v000 = this.dotProdGrid(x, y, z, xf,     yf,     zf);
        const v100 = this.dotProdGrid(x, y, z, xf + 1, yf,     zf);
        const v010 = this.dotProdGrid(x, y, z, xf,     yf + 1, zf);
        const v110 = this.dotProdGrid(x, y, z, xf + 1, yf + 1, zf);
        const v001 = this.dotProdGrid(x, y, z, xf,     yf,     zf + 1);
        const v101 = this.dotProdGrid(x, y, z, xf + 1, yf,     zf + 1);
        const v011 = this.dotProdGrid(x, y, z, xf,     yf + 1, zf + 1);
        const v111 = this.dotProdGrid(x, y, z, xf + 1, yf + 1, zf + 1);

        const x00 = this.interp(x - xf, v000, v100);
        const x10 = this.interp(x - xf, v010, v110);
        const x01 = this.interp(x - xf, v001, v101);
        const x11 = this.interp(x - xf, v011, v111);

        const y0 = this.interp(y - yf, x00, x10);
        const y1 = this.interp(y - yf, x01, x11);

        const v = this.interp(z - zf, y0, y1);

        this.memory[key] = v;
        return v;
    }
}
