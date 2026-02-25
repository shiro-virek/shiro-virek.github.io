class Numbers {
    static scale = (number, inMin, inMax, outMin, outMax) => {
        return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    }

    static absoluteSubstraction(number, substract) {
        const absValue = Math.abs(number);
        const result = absValue - substract;
        return number >= 0 ? result : -result;
    }

    static absoluteSum(number, add) {
        const absValue = Math.abs(number);
        const result = absValue + add;
        return number >= 0 ? result : -result;
    }

    static complexPow =  (re, im, power) => {
        const r = Math.hypot(re, im);
        const theta = Math.atan2(im, re);
        const rP = Math.pow(r, power);
        const thetaP = theta * power;
        return {
        re: rP * Math.cos(thetaP),
        im: rP * Math.sin(thetaP)
        };
    }

    static easings = {
        linear: (t) => t,
        easeInQuad: (t) => t * t,
        easeOutQuad: (t) => t * (2 - t),
        easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        easeInCubic: (t) => t * t * t,
        easeOutCubic: (t) => (--t) * t * t + 1,
        easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
        easeInQuart: (t) => t * t * t * t,
        easeOutQuart: (t) => 1 - (--t) * t * t * t,
        easeInOutQuart: (t) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
        easeInBack: (t) => {
            const c1 = 1.70158;
            const c3 = c1 + 1;
            return c3 * t * t * t - c1 * t * t;
        },
        easeOutBack: (t) => {
            const c1 = 1.70158;
            const c3 = c1 + 1;
            return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
        }
    };
}