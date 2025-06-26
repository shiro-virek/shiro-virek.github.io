class Effects {

    static pincushion = (data, outputData, radius, distortionStrength, centerX, centerY) => {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < radius) {
                    const angle = Math.atan2(dy, dx);
                    const distortion = 1 - Math.pow(distance / radius, distortionStrength);
                    const newX = centerX + Math.cos(angle) * distortion * distance;
                    const newY = centerY + Math.sin(angle) * distortion * distance;

                    const index = (y * width + x) * 4;
                    const newIndex = (Math.round(newY) * width + Math.round(newX)) * 4;

                    outputData[index] = data[newIndex];         
                    outputData[index + 1] = data[newIndex + 1]; 
                    outputData[index + 2] = data[newIndex + 2]; 
                    outputData[index + 3] = data[newIndex + 3]; 
                } else {
                    const index = (y * width + x) * 4;
                    outputData[index] = data[index];         
                    outputData[index + 1] = data[index + 1]; 
                    outputData[index + 2] = data[index + 2]; 
                    outputData[index + 3] = data[index + 3]; 
                }
            }
        }
    }

    static barrel = (data, outputData, radius, distortionStrength, centerX, centerY) => {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < radius) {
                    const angle = Math.atan2(dy, dx);
                    const distortion = Math.pow(distance / radius, distortionStrength);
                    const newX = centerX + Math.cos(angle) * distortion * radius;
                    const newY = centerY + Math.sin(angle) * distortion * radius;

                    const index = (y * width + x) * 4;
                    const newIndex = (Math.round(newY) * width + Math.round(newX)) * 4;

                    outputData[index] = data[newIndex];         
                    outputData[index + 1] = data[newIndex + 1]; 
                    outputData[index + 2] = data[newIndex + 2]; 
                    outputData[index + 3] = data[newIndex + 3]; 
                } else {
                    const index = (y * width + x) * 4;
                    outputData[index] = data[index];         
                    outputData[index + 1] = data[index + 1]; 
                    outputData[index + 2] = data[index + 2];
                    outputData[index + 3] = data[index + 3]; 
                }
            }
        }
    }

    static twirl = (data, outputData, radius, strength, centerX, centerY) => {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < radius) {
                    const angle = Math.atan2(dy, dx);
                    const twistAngle = strength * Math.pow((radius - distance) / radius, 2);
                    const newAngle = angle + twistAngle;

                    const newX = centerX + Math.cos(newAngle) * distance;
                    const newY = centerY + Math.sin(newAngle) * distance;

                    const index = (y * width + x) * 4;
                    const newIndex = (Math.round(newY) * width + Math.round(newX)) * 4;

                    outputData[index] = data[newIndex];        
                    outputData[index + 1] = data[newIndex + 1]; 
                    outputData[index + 2] = data[newIndex + 2]; 
                    outputData[index + 3] = data[newIndex + 3]; 
                } else {
                    const index = (y * width + x) * 4;
                    outputData[index] = data[index];         
                    outputData[index + 1] = data[index + 1]; 
                    outputData[index + 2] = data[index + 2]; 
                    outputData[index + 3] = data[index + 3]; 
                }
            }
        }
    }

    static ripple = (data, outputData, amplitude, frequency, phase, centerX, centerY) => {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                const displacement = amplitude * Math.sin(frequency * distance - phase);

                const newX = x + (dx / distance) * displacement;
                const newY = y + (dy / distance) * displacement;

                if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                    const index = (y * width + x) * 4;
                    const newIndex = (Math.floor(newY) * width + Math.floor(newX)) * 4;

                    outputData[index] = data[newIndex];         
                    outputData[index + 1] = data[newIndex + 1];
                    outputData[index + 2] = data[newIndex + 2];
                    outputData[index + 3] = data[newIndex + 3];
                }
            }
        }
    }

    static ripple2 = (data, outputData, radius, distortionStrength, centerX, centerY) => {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < radius) {
                    const angle = Math.atan2(dy, dx);                    

                    const newX = x + Math.cos((angle + distance * distortionStrength) * Trigonometry.RAD_CONST) * 50;
                    const newY = y + Math.sin((angle + distance * distortionStrength) * Trigonometry.RAD_CONST) * 50;

                    const index = (y * width + x) * 4;
                    const newIndex = (Math.round(newY) * width + Math.round(newX)) * 4;

                    outputData[index] = data[newIndex];       
                    outputData[index + 1] = data[newIndex + 1]; 
                    outputData[index + 2] = data[newIndex + 2]; 
                    outputData[index + 3] = data[newIndex + 3]; 
                } else {
                    const index = (y * width + x) * 4;
                    outputData[index] = data[index];        
                    outputData[index + 1] = data[index + 1];
                    outputData[index + 2] = data[index + 2]; 
                    outputData[index + 3] = data[index + 3];
                }
            }
        }
    }

    static wobbly = (data, outputData, amplitude, frequency) => {  
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const offsetX = Math.sin(y * frequency) * amplitude;
                const offsetY = Math.cos(x * frequency) * amplitude;

                const newX = x + offsetX;
                const newY = y + offsetY;

                const clampedX = Math.max(0, Math.min(width - 1, Math.round(newX)));
                const clampedY = Math.max(0, Math.min(height - 1, Math.round(newY)));

                const index = (y * width + x) * 4;
                const newIndex = (clampedY * width + clampedX) * 4;

                outputData[index] = data[newIndex];        
                outputData[index + 1] = data[newIndex + 1]; 
                outputData[index + 2] = data[newIndex + 2];
                outputData[index + 3] = data[newIndex + 3]; 
            }
        }
    }

    static tvDistortion = (data, outputData, amplitude, frequency, waves, glitch, random) => {
        for (let y = 0; y < height; y++) {
            const offset = Math.floor(Math.sin(y * amplitude + Date.now() * frequency) * waves + (random.next() - 0.5) * glitch);

            for (let x = 0; x < width; x++) {
                let srcX = Math.min(width - 1, Math.max(0, x + offset));
                let srcIndex = (y * width + srcX) * 4;
                let destIndex = (y * width + x) * 4;

                outputData[destIndex] = data[srcIndex];       
                outputData[destIndex + 1] = data[srcIndex + 1];
                outputData[destIndex + 2] = data[srcIndex + 2]; 
                outputData[destIndex + 3] = data[srcIndex + 3]; 
            }
        }
    }

    static water = (data, outputData, amplitude, frequency, waves) => {
        for (let y = 0; y < height; y++) {
            const offset = Math.floor(Math.sin(y * amplitude + Date.now() * frequency) * waves);

            for (let x = 0; x < width; x++) {
                let srcX = Math.min(width - 1, Math.max(0, x + offset));
                let srcIndex = (y * width + srcX) * 4;
                let destIndex = (y * width + x) * 4;

                outputData[destIndex] = data[srcIndex];     
                outputData[destIndex + 1] = data[srcIndex + 1];
                outputData[destIndex + 2] = data[srcIndex + 2]; 
                outputData[destIndex + 3] = data[srcIndex + 3]; 
            }
        }
    }

    static negative = (data, outputData) => {
        for (let i = 0; i < data.length; i += 4) {
            outputData[i] = 255 - data[i];       
            outputData[i + 1] = 255 - data[i + 1]; 
            outputData[i + 2] = 255 - data[i + 2];
        }
    }    

    static separableBoxBlur = (data, outputData, radius) => {
        const tmp = new Uint8ClampedArray(data.length);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let r = 0, g = 0, b = 0, a = 0, count = 0;
                for (let dx = -radius; dx <= radius; dx++) {
                    let nx = x + dx;
                    if (nx >= 0 && nx < width) {
                        const idx = (y * width + nx) * 4;
                        r += data[idx];
                        g += data[idx + 1];
                        b += data[idx + 2];
                        a += data[idx + 3];
                        count++;
                    }
                }
                const i = (y * width + x) * 4;
                tmp[i]     = r / count;
                tmp[i + 1] = g / count;
                tmp[i + 2] = b / count;
                tmp[i + 3] = a / count;
            }
        }

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let r = 0, g = 0, b = 0, a = 0, count = 0;
                for (let dy = -radius; dy <= radius; dy++) {
                    let ny = y + dy;
                    if (ny >= 0 && ny < height) {
                        const idx = (ny * width + x) * 4;
                        r += tmp[idx];
                        g += tmp[idx + 1];
                        b += tmp[idx + 2];
                        a += tmp[idx + 3];
                        count++;
                    }
                }
                const i = (y * width + x) * 4;
                outputData[i]     = r / count;
                outputData[i + 1] = g / count;
                outputData[i + 2] = b / count;
                outputData[i + 3] = a / count;
            }
        }
    }

    static boxBlur = (data, outputData, radius) => {
        const src = data;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let r = 0, g = 0, b = 0, a = 0, count = 0;

                for (let dy = -radius; dy <= radius; dy++) {
                    for (let dx = -radius; dx <= radius; dx++) {
                        const nx = x + dx;
                        const ny = y + dy;

                        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                            const idx = (ny * width + nx) * 4;
                            r += src[idx];
                            g += src[idx + 1];
                            b += src[idx + 2];
                            a += src[idx + 3];
                            count++;
                        }
                    }
                }

                const i = (y * width + x) * 4;
                outputData[i]     = r / count;
                outputData[i + 1] = g / count;
                outputData[i + 2] = b / count;
                outputData[i + 3] = a / count;
            }
        }
    }

    static gaussianBlur = (data, outputData, radius, sigma) =>  {
        const src = data;
        const tmp = new Uint8ClampedArray(src.length);

        const kernel = Effects.createGaussianKernel(radius, sigma);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let r = 0, g = 0, b = 0, a = 0, wSum = 0;
                for (let k = -radius; k <= radius; k++) {
                    const nx = x + k;
                    if (nx >= 0 && nx < width) {
                        const weight = kernel[k + radius];
                        const idx = (y * width + nx) * 4;
                        r += src[idx]     * weight;
                        g += src[idx + 1] * weight;
                        b += src[idx + 2] * weight;
                        a += src[idx + 3] * weight;
                        wSum += weight;
                    }
                }
                const i = (y * width + x) * 4;
                tmp[i]     = r / wSum;
                tmp[i + 1] = g / wSum;
                tmp[i + 2] = b / wSum;
                tmp[i + 3] = a / wSum;
            }
        }

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let r = 0, g = 0, b = 0, a = 0, wSum = 0;
                for (let k = -radius; k <= radius; k++) {
                    const ny = y + k;
                    if (ny >= 0 && ny < height) {
                        const weight = kernel[k + radius];
                        const idx = (ny * width + x) * 4;
                        r += tmp[idx]     * weight;
                        g += tmp[idx + 1] * weight;
                        b += tmp[idx + 2] * weight;
                        a += tmp[idx + 3] * weight;
                        wSum += weight;
                    }
                }
                const i = (y * width + x) * 4;
                outputData[i]     = r / wSum;
                outputData[i + 1] = g / wSum;
                outputData[i + 2] = b / wSum;
                outputData[i + 3] = a / wSum;
            }
        }
    }

    static createGaussianKernel = (radius, sigma) => {
        const kernel = [];
        let sum = 0;
        for (let x = -radius; x <= radius; x++) {
            const weight = Math.exp(-(x * x) / (2 * sigma * sigma));
            kernel.push(weight);
            sum += weight;
        }
        
        return kernel.map(w => w / sum);
    }
    
}