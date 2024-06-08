{
    class ThreeDWorld {
        constructor(){
            this.figures = [];
            this.FOV = 2000; 
            this.drawEdges = true;
            this.figureTypes = [];
            this.setFigureTypes();            
            this.figureInfo = {};
        }

        draw = () => {
            if (this.drawEdges) 
                this.drawFigures();
            else
                this.drawFiguresVertices();
        }

        setFigureTypes = () => {
            let letterV = { 
                vertices: [
                    [0, 0, 0],
                    [30, 0, 0],
                    [60, 0, 0],
                    [90, 0, 0],

                    [45, 35, 0],
                    [45, 75, 0],

                    [0, 0, 20],
                    [30, 0, 20],
                    [60, 0, 20],
                    [90, 0, 20],

                    [45, 35, 20],
                    [45, 75, 20]
                ],
                edges : [
                    [6, 7, "#00FF00"],
                    [7, 10, "#00FF00"],
                    [10, 8, "#00FF00"],
                    [8, 9, "#00FF00"],
                    [6, 11, "#00FF00"],
                    [11, 9, "#00FF00"],

                    //Z              
                    [0, 6, "#0000FF"],
                    [1, 7, "#0000FF"], 
                    [2, 8, "#0000FF"],
                    [3, 9, "#0000FF"], 
                    [4, 10, "#0000FF"],
                    [5, 11, "#0000FF"],
            
                    [0, 1, "#FF0000"],
                    [1, 4, "#FF0000"],
                    [4, 2, "#FF0000"],
                    [2, 3, "#FF0000"],
                    [0, 5, "#FF0000"],
                    [5, 3, "#FF0000"]
                ]

            };

            this.figureTypes.push(letterV);

            let cube = { 
                vertices: [
                    [0, 0, 0],
                    [30, 0, 0],
                    [0, 30, 0],
                    [30, 30, 0],
                    [0, 0, 30],
                    [30, 0, 30],
                    [0, 30, 30],
                    [30, 30, 30],
                ],
                edges : [

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
                ]

            };

            this.figureTypes.push(cube);
        
            let pyramid = { 
                vertices: [
                    [10, 0, 10],
                    [0, 20, 20],
                    [20, 20, 20],
                    [0, 20, 0],
                    [20, 20, 0]
                ],
                edges : [

                    [0, 1, "#0000FF"],
                    [0, 2, "#0000FF"], 
                    [0, 3, "#0000FF"],
                    [0, 4, "#0000FF"], 
                    [1, 2, "#00FF00"],
                    [2, 4, "#00FF00"],
                    [3, 4, "#00FF00"],
                    [3, 1, "#00FF00"]    
                ]

            };

            this.figureTypes.push(pyramid);

            let pyramid2 = { 
                vertices: [
                    [10, 0, 10],
                    [10, 20, 20],
                    [0, 20, 0],
                    [20, 20, 0]
                ],
                edges : [

                    [0, 1, "#0000FF"],
                    [0, 2, "#0000FF"], 
                    [0, 3, "#0000FF"],
                    [1, 2, "#00FF00"], 
                    [2, 3, "#00FF00"],
                    [1, 3, "#00FF00"]  
                ]

            };

            this.figureTypes.push(pyramid2);
        }

        worldToScreen = (point) => { 
            const scaleFactor = this.FOV / (this.FOV + point[2]);
            const projectedX = point[0] * scaleFactor;
            const projectedY = point[1] * scaleFactor;
            let p1 = {
                'x': projectedX,
                'y': projectedY
            };

            return p1;
        }

        worldToScreenOblique = (point, angleX, angleY) => {
            const radianX = (angleX * Math.PI) / 180;
            const radianY = (angleY * Math.PI) / 180;

            const projectedX = point[0] + point[2] * Math.tan(radianY);
            const projectedY = point[1] + point[2] * Math.tan(radianX);

            let p1 = {
                'x': projectedX,
                'y': projectedY
            };

            return p1;
        }    

        worldToScreenIsometric = (point) => {
            const isoMatrix = [
                Math.sqrt(3) / 2, -1 / 2, 0,
                Math.sqrt(3) / 2, 1 / 2, 0,
                0, 0, 1
            ];
        
            const projectedX = isoMatrix[0] * point[0] + isoMatrix[1] * point[1] + isoMatrix[2] * point[2];
            const projectedY = isoMatrix[3] * point[0] + isoMatrix[4] * point[1] + isoMatrix[5] * point[2];
            const projectedZ = isoMatrix[6] * point[0] + isoMatrix[7] * point[1] + isoMatrix[8] * point[2];
            
            let p1 = {
                'x': projectedX,
                'y': projectedY
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
            for (let i = this.figures.length - 1; i >= 0; i--) {
                this.figures[i].drawFigure(ctx);
            }
        }
        
        drawFiguresVertices = () => {    
            for (let i = this.figures.length - 1; i >= 0; i--) {
                this.figures[i].drawVertices(ctx);
            } 
        }         
    
        addFigure(x, y){
            let figure = new Figure();            
    
            figure.vertices = Utils.clone(this.figureInfo.vertices);
            figure.edges = Utils.clone(this.figureInfo.edges);
                
            figure.translateX(x);
            figure.translateY(y);
    
            this.figures.push(figure);
        }
    }
    
    class Figure {
        constructor(){
            this.vertices = [];
            this.edges = [];
        }
        
        rotateZ = (angle) => {
            angle = ThreeDWorld.sexagesimalToRadian(angle);
    
            for (let i = this.vertices.length - 1; i >= 0; i--) {
                let x = this.vertices[i][0] * Math.cos(angle) + this.vertices[i][1] * (-Math.sin(angle)); 
                this.vertices[i][1] = this.vertices[i][0] * Math.sin(angle) + this.vertices[i][1] * Math.cos(angle); //Y
                this.vertices[i][0] = x;
            }
        }
    
        rotateY = (angle) => {
            angle = ThreeDWorld.sexagesimalToRadian(angle);
    
            for (let i = this.vertices.length - 1; i >= 0; i--) {
                let x = this.vertices[i][0] * Math.cos(angle) + this.vertices[i][2] * Math.sin(angle); 
                this.vertices[i][2] = this.vertices[i][0] * (-Math.sin(angle)) + this.vertices[i][2] * Math.cos(angle); //Z
                this.vertices[i][0] = x; 
            }
        }
    
        rotateX = (angle) => {
            angle = ThreeDWorld.sexagesimalToRadian(angle);
    
            for (let i = this.vertices.length - 1; i >= 0; i--) {
                let y = this.vertices[i][1] * Math.cos(angle) + this.vertices[i][2] * (-Math.sin(angle)); 
                this.vertices[i][2] = this.vertices[i][1] * Math.sin(angle) + this.vertices[i][2] * Math.cos(angle); //Z
                this.vertices[i][1] = y; 
            }
        }
    
        translateX = (distance) => {               
            for (let i = this.vertices.length - 1; i >= 0; i--) {
                this.vertices[i][0] += distance; 
            }
        }
    
        translateY = (distance) => {               
            for (let i = this.vertices.length - 1; i >= 0; i--) {
                this.vertices[i][1] += distance; 
            }
        }
        
        translateZ = (distance) => {               
            for (let i = this.vertices.length - 1; i >= 0; i--) {
                this.vertices[i][2] += distance; 
            }    
        }

        
        scale = (factor) => {               
            for (let i = this.vertices.length - 1; i >= 0; i--) {
                this.vertices[i][0] *= factor; 
                this.vertices[i][1] *= factor; 
                this.vertices[i][2] *= factor; 
            }
    
        }                
        
        scaleX = (factor) => {               
            for (let i = this.vertices.length - 1; i >= 0; i--) {
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

            let newColor = `hsl(${Utils.scale(point[2], -500, 500, 300, 360)}, ${100}%, ${50}%)`;           
    
            Utils.drawDot(ctx, vertex.x, vertex.y, newColor);
        }

        drawFigure = () => {     
            for (let i = this.edges.length - 1; i >= 0; i--) {
                this.drawEdge(this.vertices[this.edges[i][0]], this.vertices[this.edges[i][1]]);
            }
        }     
        
        drawVertices = () => {
            for (let i = this.vertices.length - 1; i >= 0; i--) {
                this.drawVertex(this.vertices[i]);
            }
        }
    }
    
    let init = () => {
        initCanvas();
        world = new ThreeDWorld();
        randomize();
        addEvents();
    }

    let addEvents = () => {
        canvas.addEventListener('click', e => {
            world.addFigure(e.offsetX, e.offsetY);            
        }, false);

		canvas.addEventListener('mousemove', e => {
			trackMouse(e.offsetX, e.offsetY);
		}, false);
        
		canvas.addEventListener('touchstart', function(e){            
            world.addFigure(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
		});

		canvas.addEventListener('touchmove', function(e){
			e.preventDefault();
			trackMouse(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
		});	
    }

    let trackMouse = (x, y) => {		
        if (lastPosX == 0) lastPosX = x;
		if (lastPosY == 0) lastPosY = y;

        let movX = lastPosX - x;
        let movY = lastPosY - y;

        world.figures.forEach(figure => {
            figure.rotateX(movY);
            figure.rotateY(movX);
        });
        
		lastPosX = x;
		lastPosY = y;
    }

    let randomize = () => {	
        world.drawEdges = Utils.getRandomBool();
        world.figureInfo = world.figureTypes[Utils.getRandomInt(0, world.figureTypes.length - 1)];
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
