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

      #define TWO_PI 6.28318530718

      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_time;

      vec3 hsb2rgb(in vec3 c) {
        vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
        rgb = rgb * rgb * (3.0 - 2.0 * rgb);
        return c.z * mix(vec3(1.0), rgb, c.y);
      }

      void main() {
        vec2 mouse = u_mouse/u_resolution;
        vec2 st = gl_FragCoord.xy / u_resolution;
        vec3 color = vec3(0.0);

        vec2 toCenter = vec2(0.5) - st;
        float angle = atan(toCenter.y, toCenter.x) + u_time;
        float radius = length(toCenter) * 2.0;

        color = hsb2rgb(vec3((angle / TWO_PI) + 0.5, radius, 1.0));

        if (radius < 1.0) {
          gl_FragColor = vec4(color, 1.0);
        } else {
          gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
        }
      }
    `;

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


    const positions = [
      -1.0, -1.0,
      1.0, -1.0,  
      -1.0, 1.0,  
      1.0, 1.0,  
    ];
    
    function animate() {
        const currentTime = (Date.now() - globals.startTime) / 1000;
        globals.gl.uniform1f(globals.timeUniformLocation, currentTime);

        globals.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        globals.gl.clear(globals.gl.COLOR_BUFFER_BIT);
        globals.gl.drawArrays(globals.gl.TRIANGLE_STRIP, 0, 4);

        requestAnimationFrame(animate);
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
        
        globals.gl.viewport(0, 0, globals.canvasShader.width, globals.canvasShader.height);
        globals.gl.uniform2f(globals.resolutionUniformLocation, globals.canvasShader.width, canvasShader.height);

        globals.startTime = Date.now();
	}

    init();
    animate();
}