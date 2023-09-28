{
    let CANVAS_ID = "myCanvas"
    let RAD_CONST = 0.0175;

    let width = 0;
    let height = 0;    

	let lastRender = 0;

    let canvas;
    let ctx;

    class ThreeDWorld {
        constructor(){
            this.figures = [];
            this.FOV = 1000; 
            this.drawEdges = true;
        }

        draw = () => {
            if (this.drawEdges) 
                world.drawFigures();
            else
                world.drawFiguresVertices();
        }

        worldToScreen = (p) => { 
            let scale = this.FOV / (this.FOV + p[2]);
    
            let p1 = {
                'x': p[0] * scale + width/2,
                'y': p[1] * scale + height/2
            };
            return p1;
        }
    
        static sexagesimalToRadian = (degrees) => {
            return degrees * (Math.PI / 180);
        }
        
        addDistance = (distance) => {      
            if (this.FOV + distance > 0)    
                this.FOV += distance;
        }    
    
        drawFigures = () => {
            for (let i = world.figures.length - 1; i >= 0; i--) {
                world.figures[i].drawFigure(ctx);
            }
        }
        
        drawFiguresVertices = () => {    
            for (let i = world.figures.length - 1; i >= 0; i--) {
                world.figures[i].drawVertices(ctx);
            } 
        }         
    
        addCube(x, y){
            let cube = new Figure();
    
            let vertices = [
                    [0, 0, 0],
                    [30, 0, 0],
                    [0, 30, 0],
                    [30, 30, 0],
                    [0, 0, 30],
                    [30, 0, 30],
                    [0, 30, 30],
                    [30, 30, 30],
                ];    
    
            let edges = [
                    [0, 1, "#0000FF"],
                    [1, 3, "#0000FF"], 
                    [2, 3, "#0000FF"],
                    [0, 2, "#0000FF"], 
    
                    [4, 5, "#00FF00"],
                    [5, 7, "#00FF00"],
                    [7, 6, "#00FF00"],
                    [4, 6, "#00FF00"],                                          

                    [0, 4, "#FF0000"],
                    [1, 5, "#FF0000"],
                    [3, 7, "#FF0000"],
                    [2, 6, "#FF0000"]
                ];
    
            cube.vertices = vertices;
            cube.edges = edges;
                
            cube.translateX(x);
            cube.translateY(y);
    
            this.figures.push(cube);
        }
    }
    
    class Figure {
        constructor(){
            this.vertices = [];
            this.edges = [];
        }
        
        rotateZ = (angle) => {
            angle = sexagesimalToRadian(angle);
    
            for (var i = this.vertices.length - 1; i >= 0; i--) {
                var x = this.vertices[i][0] * Math.cos(angle) + this.vertices[i][1] * (-Math.sin(angle)); 
                this.vertices[i][1] = this.vertices[i][0] * Math.sin(angle) + this.vertices[i][1] * Math.cos(angle); //Y
                this.vertices[i][0] = x;
            }
        }
    
        rotateY = (angle) => {
            angle = sexagesimalToRadian(angle);
    
            for (var i = this.vertices.length - 1; i >= 0; i--) {
                var x = this.vertices[i][0] * Math.cos(angle) + this.vertices[i][2] * Math.sin(angle); 
                this.vertices[i][2] = this.vertices[i][0] * (-Math.sin(angle)) + this.vertices[i][2] * Math.cos(angle); //Z
                this.vertices[i][0] = x; 
            }
        }
    
        rotateX = (angle) => {
            angle = sexagesimalToRadian(angle);
    
            for (var i = this.vertices.length - 1; i >= 0; i--) {
                var y = this.vertices[i][1] * Math.cos(angle) + this.vertices[i][2] * (-Math.sin(angle)); 
                this.vertices[i][2] = this.vertices[i][1] * Math.sin(angle) + this.vertices[i][2] * Math.cos(angle); //Z
                this.vertices[i][1] = y; 
            }
        }
    
        translateX = (distance) => {               
            for (var i = this.vertices.length - 1; i >= 0; i--) {
                this.vertices[i][0] += distance; 
            }
        }
    
        translateY = (distance) => {               
            for (var i = this.vertices.length - 1; i >= 0; i--) {
                this.vertices[i][1] += distance; 
            }
        }
        
        translateZ = (distance) => {               
            for (var i = this.vertices.length - 1; i >= 0; i--) {
                this.vertices[i][2] += distance; 
            }    
        }

        
        scale = (factor) => {               
            for (var i = this.vertices.length - 1; i >= 0; i--) {
                this.vertices[i][0] *= factor; 
                this.vertices[i][1] *= factor; 
                this.vertices[i][2] *= factor; 
            }
    
        }                
        
        scaleX = (factor) => {               
            for (var i = this.vertices.length - 1; i >= 0; i--) {
                this.vertices[i][0] *= factor; 
            }    
        }          
    
        scaleY = (factor) => {               
            for (let i = this.vertices.length - 1; i >= 0; i--) {
                this.vertices[i][1] *= factor; 
            }    
        }          
    
        scaleZ = (factor) => {               
            for (let i = this.vertices.length - 1; i >= 0; i--) {
                this.vertices[i][2] *= factor; 
            }    
        }       
    
        shearX = (amount) => {
            for (let i = this.vertices.length - 1; i >= 0; i--) {
                this.vertices[i][1] = this.vertices[i][1] + amount * this.vertices[i][0];
                this.vertices[i][2] = this.vertices[i][2] + amount * this.vertices[i][0];
            }
        }
    
        shearY = (amount) => {
            for (let i = this.vertices.length - 1; i >= 0; i--) {
                this.vertices[i][0] = this.vertices[i][0] + amount * this.vertices[i][1];
                this.vertices[i][2] = this.vertices[i][2] + amount * this.vertices[i][1];
            }
        }
    
        shearZ = (amount) => {
            for (let i = this.vertices.length - 1; i >= 0; i--) {
                this.vertices[i][0] = this.vertices[i][0] + amount * this.vertices[i][2];
                this.vertices[i][1] = this.vertices[i][1] + amount * this.vertices[i][2];
            }
        }    
    
        drawEdge = (p0, p1, color) => { 
            let point2d0 = world.worldToScreen(p0);
            let point2d1 = world.worldToScreen(p1);
    
            Utils.drawLine(ctx, point2d0.x, point2d0.y, point2d1.x, point2d1.y, color);
        }

        
        drawVertex = (point, color) => { 
            let vertex = world.worldToScreen(point);
    
            Utils.drawDot(ctx, vertex.x, vertex.y, color);
        }

        drawFigure = () => {     
            for (let i = this.edges.length - 1; i >= 0; i--) {
                this.drawEdge(this.vertices[this.edges[i][0]], this.vertices[this.edges[i][1]], this.edges[i][2]);
            }
        }     
        
        drawVertices = () => {
            for (let i = this.vertices.length - 1; i >= 0; i--) {
                this.drawVertex(this.vertices[i]);
            }
        }

    }
    
	class Utils {

		static shuffleArray = (array) => {
			for (let i = array.length - 1; i > 0; i--) {
			    const j = Math.floor(Math.random() * (i + 1));
                const temp = array[i];
                array[i] = array[j];
                array[j] = temp;
			}
		}		  
		
		static getRandomInt = (min, max) => {
			return Math.floor(Math.random() * max) + min;
		}

		static getRandomFloat = (min, max, decimals) => {
			const str = (Math.random() * (max - min) + min).toFixed(
				decimals,
			);

			return parseFloat(str);
		}

		static getRandomBool = () => {
			return Math.random() < 0.5;
		}
		
		static nextCharacter = (c) => {
			return String.fromCharCode(c.charCodeAt(0) + 1);
		}
		
		static drawCircle = (ctx, x, y, radio, color = '#00FF00', fillColor = '#00FF00') => {
			ctx.strokeStyle = color;
			ctx.fillStyle = fillColor;
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.arc(x, y, radio, 0, 2 * Math.PI);
			ctx.fill();
			ctx.stroke();
		}

		static drawRectangle = (ctx, x, y, width, height, color = '#FFF', fillColor = '#00FF00') => {
			ctx.strokeStyle = color;
			ctx.fillStyle = fillColor;
			ctx.beginPath();
			ctx.rect(x, y, width, height);
			ctx.fill();
			ctx.stroke();
		}
            
        static drawLine = (ctx, x1, y1, x2, y2, color = '#FFF') => {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineWidth = "2"
            ctx.strokeStyle = color;
            ctx.stroke();
        }

        static drawDot = (ctx, x, y, color = '#FFF') => {
			ctx.fillStyle = color;
			ctx.beginPath();
			ctx.rect(x, y, 1, 1);
			ctx.fill();
		}
	}

    let init = () => {
        width = window.innerWidth;
        height = window.innerHeight;  

		canvas = document.getElementById(CANVAS_ID);
		if (canvas.getContext) 
			ctx = canvas.getContext('2d');

        world = new ThreeDWorld();
        randomize();
        addEvents();
    }

    let addEvents = () => {
        canvas.addEventListener('click', e => {
            world.addCube(e.offsetX, e.offsetY);            
        }, false);
    }

    let randomize = () => {	
        world.drawEdges = Utils.getRandomBool();
    }
        
    let drawBackground = (ctx, canvas) => {
        canvas.width = width;
        canvas.height = height;
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#000000';
        ctx.strokeRect(0, 0, width, height);
    }

    let draw = () => {	
        drawBackground(ctx, canvas);
        world.draw();
    }

    let loop = (timestamp) => {
        let progress = timestamp - lastRender;

        draw();

        lastRender = timestamp;
        window.requestAnimationFrame(loop);
    }

    init();

    window.requestAnimationFrame(loop);
}
