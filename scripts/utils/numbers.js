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
}