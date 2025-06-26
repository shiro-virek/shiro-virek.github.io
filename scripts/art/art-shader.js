{
    const globals = {
        gl: null,
        vertexShader: null,
        fragmentShader: null,
        program: null,
        positionBuffer: null,
        positionAttributeLocation: null,
        resolutionUniformLocation: null,
        timeUniformLocation: null,
        mouseUniformLocation: null,
        startTime: null,
        canvasShader: null,
    }

    const vertexShaderSource = `
    attribute vec4 a_position;
    void main() {
        gl_Position = a_position;
    }
    `;

    const fragmentShaderSource = `            
        #ifdef GL_ES
        precision mediump float;
        #endif

        uniform vec2 u_resolution;
        uniform vec2 u_mouse;
        uniform float u_time;

        void main() {
            vec2 st = gl_FragCoord.xy / u_resolution;
            vec2 mouse = u_mouse / u_resolution;
            gl_FragColor = vec4(st.x, mouse.y, mouse.x, 1.0);
        }
    `;


    const positions = [
        -1.0, -1.0,
        1.0, -1.0,
        -1.0, 1.0,
        1.0, 1.0,
    ];

    function compileShader(gl, source, type) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Error compilando el shader:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    function animate() {
        const currentTime = (Date.now() - globals.startTime) / 1000;
        globals.gl.uniform1f(globals.timeUniformLocation, currentTime);

        globals.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        globals.gl.clear(globals.gl.COLOR_BUFFER_BIT);
        globals.gl.drawArrays(globals.gl.TRIANGLE_STRIP, 0, 4);

        requestAnimationFrame(animate);
    }

    function resizeCanvas() {
        const canvas = globals.canvasShader;
        const width = window.innerWidth;
        const height = window.innerHeight;

        canvas.width = width;
        canvas.height = height;

        globals.gl.viewport(0, 0, width, height);

        globals.gl.uniform2f(globals.resolutionUniformLocation, width, height);
    }

    let init = () => {
        globals.canvasShader = document.getElementById("canvasShader");

        globals.gl = globals.canvasShader.getContext('webgl');

        if (!globals.gl) {
            console.error('WebGL no está disponible en tu navegador.');
            throw new Error('WebGL no está disponible.');
        }

        globals.vertexShader = compileShader(globals.gl, vertexShaderSource, globals.gl.VERTEX_SHADER);
        globals.fragmentShader = compileShader(globals.gl, fragmentShaderSource, globals.gl.FRAGMENT_SHADER);

        globals.program = globals.gl.createProgram();
        globals.gl.attachShader(globals.program, globals.vertexShader);
        globals.gl.attachShader(globals.program, globals.fragmentShader);
        globals.gl.linkProgram(globals.program);

        if (!globals.gl.getProgramParameter(globals.program, globals.gl.LINK_STATUS)) {
            console.error('Error enlazando el programa:', globals.gl.getProgramInfoLog(globals.program));
        }

        globals.gl.useProgram(globals.program);

        globals.positionBuffer = globals.gl.createBuffer();
        globals.gl.bindBuffer(globals.gl.ARRAY_BUFFER, globals.positionBuffer);
        globals.gl.bufferData(globals.gl.ARRAY_BUFFER, new Float32Array(positions), globals.gl.STATIC_DRAW);

        globals.positionAttributeLocation = globals.gl.getAttribLocation(globals.program, 'a_position');
        globals.gl.enableVertexAttribArray(globals.positionAttributeLocation);
        globals.gl.vertexAttribPointer(globals.positionAttributeLocation, 2, globals.gl.FLOAT, false, 0, 0);

        globals.resolutionUniformLocation = globals.gl.getUniformLocation(globals.program, 'u_resolution');
        globals.timeUniformLocation = globals.gl.getUniformLocation(globals.program, 'u_time');
        globals.mouseUniformLocation = globals.gl.getUniformLocation(globals.program, 'u_mouse');

        resizeCanvas();

        window.addEventListener('resize', resizeCanvas);

        globals.canvasShader.addEventListener('mousemove', (event) => {
            const rect = globals.canvasShader.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = globals.canvasShader.height - (event.clientY - rect.top);
            globals.gl.uniform2f(globals.mouseUniformLocation, mouseX, mouseY);
        });

        globals.startTime = Date.now();
    }

    window.clearCanvas = () => {
        Sound.error();
    }

    window.magic = () => {
        Sound.error();
    }

    window.upload = () => {
        Sound.error();
    }

    init();
    animate();
}