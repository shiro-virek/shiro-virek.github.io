{
    let canvasShader = null;
    let gl = null;
    let vertexShader = null;
    let fragmentShader = null;
    let program = null;
    let positionBuffer = null;
    let positionAttributeLocation = null;
    let resolutionUniformLocation = null;
    let timeUniformLocation = null;
    let startTime = null;

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
      uniform float u_time;

      vec3 hsb2rgb(in vec3 c) {
        vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
        rgb = rgb * rgb * (3.0 - 2.0 * rgb);
        return c.z * mix(vec3(1.0), rgb, c.y);
      }

      void main() {
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
        const currentTime = (Date.now() - startTime) / 1000;
        gl.uniform1f(timeUniformLocation, currentTime);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        requestAnimationFrame(animate);
    }

	let init = () => {
		canvasShader = document.getElementById("canvasShader");

        gl = canvasShader.getContext('webgl');

        if (!gl) {
        console.error('WebGL no está disponible en tu navegador.');
        throw new Error('WebGL no está disponible.');
        }


        vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
        fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);

        program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);


        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Error enlazando el programa:', gl.getProgramInfoLog(program));
        }
    
        gl.useProgram(program);
    
        positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    
        resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
        timeUniformLocation = gl.getUniformLocation(program, 'u_time');
        
        gl.viewport(0, 0, canvasShader.width, canvasShader.height);
        gl.uniform2f(resolutionUniformLocation, canvasShader.width, canvasShader.height);

        startTime = Date.now();
	}

    init();
    animate();
}