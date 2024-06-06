{
	let CANVAS_ID = "myCanvas"
	let DRAW_QUADTREE = true;
	let RAD_CONST = 0.0175;

	let hue = 20;
	let radius = 20;
	let width = 0;
	let height = 0;
	let ballCollection;	
	let lastRender = 0;


	class Ball {
		constructor(x, y) {
			this.x = x;
			this.y = y;
			this.radius = radius;
			this.mass = this.radius * 2;			
			this.speedY =  Utils.getRandomFloat(1, 5, 2);
			this.speedX = Utils.getRandomFloat(1, 5, 2);
		}

		draw = (ctx) => {
			let value = Utils.scale(Math.abs(this.speedX)+Math.abs(this.speedY), 0, 10, 0, 100);
			let color = `hsl(${hue}, ${100}%, ${value}%)`;

			let angle = Utils.angleBetweenTwoPoints(this.prevX, this.prevY, this.x, this.y);
			let distance = Utils.distanceBetweenTwoPoints(this.x, this.y, this.prevX, this.prevY);
			
			for (let index = 1; index < 5; index++) {

				let color2 = `hsl(${hue}, ${100}%, ${value}%, ${1.0 / index})`;
					
				let trailPoint = Utils.polarToCartesian(distance + ((index - 1) * 5), angle * RAD_CONST) ;

				Utils.drawCircle(ctx, this.x - trailPoint.x, this.y - trailPoint.y, this.radius * (1.0 - (index / 30)), color2, color2);
			}

			Utils.drawCircle(ctx, this.x, this.y, this.radius, color, color);
		}

		move() {   
			this.prevX = this.x;
			this.prevY = this.y;
			this.x += this.speedX;
			this.y += this.speedY;        
		} 

		checkCollisionsBalls() {    
			let returnObjects = [];
			
			ballCollection.quad.retrieve(returnObjects, this);

			for (const element of returnObjects) {
				let ball = element;          
					  
				if (ball == this)
				  continue;
						
				let newVelX1 = 0;
				let newVelY1 = 0;
				let newVelX2 = 0;
				let newVelY2 = 0;  
				let catX = Math.abs(ball.x - this.x);
				let catY = Math.abs(ball.y - this.y);
				let distance = Math.sqrt(catX * catX + catY * catY);
					  
				if (distance < ball.radius + this.radius){             
				  newVelX1 = (this.speedX * (this.mass - ball.mass) + (2 * ball.mass * ball.speedX)) / (this.mass + ball.mass);
				  newVelY1 = (this.speedY * (this.mass - ball.mass) + (2 * ball.mass * ball.speedY)) / (this.mass + ball.mass);
				  
				  newVelX2 = (ball.speedX * (ball.mass - this.mass) + (2 * this.mass * this.speedX)) / (ball.mass + this.mass);
				  newVelY2 = (ball.speedY * (ball.mass - this.mass) + (2 * this.mass * this.speedY)) / (ball.mass + this.mass);
				  
				  this.x += newVelX1;
				  this.y += newVelY1;
				  ball.x += newVelX2;
				  ball.y += newVelY2;
				  
				  this.speedX = newVelX1;
				  this.speedY = newVelY1;
				  ball.speedX = newVelX2;
				  ball.speedY = newVelY2;
				}
			}
			   
		
		  } 
		
		  checkCollisionsWalls(){       
			if ((this.getRight() > width)){
			  this.speedX = -Math.abs(this.speedX);
			}
			
			 if (this.getLeft() < 0){
			  this.speedX = Math.abs(this.speedX);
			}
			
			if ((this.getBottom() > height)){       
			  this.speedY = -Math.abs(this.speedY);
			} 
			
			if ((this.getTop() < 0)){ 
			  this.speedY = Math.abs(this.speedY);
			} 
			
			if (this.speedX > 0 && this.speedX < 1) this.speedX = 1;
			if (this.speedY > 0 && this.speedY < 1) this.speedY = 1;
		  }
	

		getTop = () => this.y - this.radius;
		getBottom = () => this.y + this.radius;
		getLeft = () => this.x - this.radius;
		getRight = () => this.x + this.radius;
	}

	class BallCollection {
		constructor(){
			this.balls = [];
			this.quad = Quadtree.generateQuadtree(width, height);
		}			

		drawBalls = (ctx) => {
			for (const ball of ballCollection.balls) {
				ball.move();           
				ball.checkCollisionsBalls();       
				ball.checkCollisionsWalls();  
				ball.draw(ctx);
			}
		}
		
		addBall = (x, y) => {
			let ball = new Ball(x, y);
				
			ballCollection.balls.push(ball);	
		}

		populateQuadTree = () => {
			this.quad.clear();
			for (const ball of ballCollection.balls) {
				this.quad.insert(ball);
			}
		}

		draw = (ctx) => {
			if (this.balls.length > 0) {
				if (DRAW_QUADTREE) 
					this.quad.drawQuadtree(ctx);
				this.drawBalls(ctx);
				this.populateQuadTree();			
			}
		}
	}

	class Rectangle {
		constructor(x, y, w, h) {
			this.x = x;
			this.y = y;
			this.width = w;
			this.height = h;
		}

		getWidth = () => this.width;
		getHeight = () => this.height;
		getX = () => this.x;
		getY = () => this.y;
		getTop = () => this.y;
		getBottom = () => this.y + this.height;
		getLeft = () => this.x;
		getRight = () => this.x + this.width;
	}

	class Quadtree {
		constructor(level, bounds) {

			this.MAX_OBJECTS = 5;
			this.MAX_LEVELS = 6;

			this.lines = [];

			this.level = level;
			this.bounds = bounds;
			this.nodes = new Array(4);
		}

		clear = () => {
			this.lines = [];

			for (let i = 0; i < this.nodes.length; i++) {
				if (this.nodes[i] != null) {
					this.nodes[i] = null;
				}
			}
		}

		split = () => {
			let subWidth = Math.floor(this.bounds.getWidth() / 2);
			let subHeight = Math.floor(this.bounds.getHeight() / 2);
			let x = this.bounds.getX();
			let y = this.bounds.getY();

			this.nodes[0] = new Quadtree(this.level + 1, new Rectangle(x + subWidth, y, subWidth, subHeight));
			this.nodes[1] = new Quadtree(this.level + 1, new Rectangle(x, y, subWidth, subHeight));
			this.nodes[2] = new Quadtree(this.level + 1, new Rectangle(x, y + subHeight, subWidth, subHeight));
			this.nodes[3] = new Quadtree(this.level + 1, new Rectangle(x + subWidth, y + subHeight, subWidth, subHeight));
		}

		getIndex = (rectangle) => {
			let index = -1;
			let verticalMidsegment = this.bounds.getX() + (this.bounds.getWidth() / 2);
			let horizontalMidsegment = this.bounds.getY() + (this.bounds.getHeight() / 2);

			let topQuadrant = (rectangle.getTop() < horizontalMidsegment && rectangle.getBottom() < horizontalMidsegment);
			let bottomQuadrant = (rectangle.getTop() > horizontalMidsegment);

			if (rectangle.getLeft() < verticalMidsegment && rectangle.getRight() < verticalMidsegment) {
				if (topQuadrant) {
					index = 1;
				}
				else if (bottomQuadrant) {
					index = 2;
				}
			}

			else if (rectangle.getLeft() > verticalMidsegment) {
				if (topQuadrant) {
					index = 0;
				}
				else if (bottomQuadrant) {
					index = 3;
				}
			}

			return index;
		}

		insert = (rectangle) => {
			if (this.nodes[0] != null) {
				let index = this.getIndex(rectangle);

				if (index != -1) {
					this.nodes[index].insert(rectangle);

					return;
				}
			}

			this.lines.push(rectangle);

			if (this.lines.length > this.MAX_OBJECTS && this.level < this.MAX_LEVELS) {
				if (this.nodes[0] == null) {
					this.split();
				}

				let i = 0;
				while (i < this.lines.length) {
					let index = this.getIndex(this.lines[i]);
					if (index != -1) {
						let removedItem = this.lines[i];
						this.lines.splice(i, 1);
						this.nodes[index].insert(removedItem);
					}
					else {
						i++;
					}
				}
			}
		}

		retrieve = (returnObjects, rectangle) => {
			let index = this.getIndex(rectangle);
			if (index != -1 && this.nodes[0] != null) {
				this.nodes[index].retrieve(returnObjects, rectangle);
			}

			returnObjects.push(...this.lines);

			return returnObjects;
		}
		
		static generateQuadtree = (width, height) => {
			return new Quadtree(0, new Rectangle(0, 0, width, height));
		}

		drawQuadtree = (ctx) => {
			if (this.quad != null) {
				if (this.quad.bounds != null) {
					ctx.strokeStyle = "#333";
					ctx.lineWidth = 1;
					ctx.strokeRect(this.quad.bounds.x, this.quad.bounds.y, this.quad.bounds.width, this.quad.bounds.height);
				}
				if (this.quad.nodes != null) {
					this.quad.nodes.forEach(function (node) {
						drawQuadtree(ctx, node);
					});
				}
			}
		}
	}

	class Utils {
		static polarToCartesian(r, theta) {
			let x = r * Math.cos(theta);
			let y = r * Math.sin(theta);
			return { x: x, y: y };
		}

		static cartesianToPolar(x, y) {
			let r = Math.sqrt(x * x + y * y);
			let theta = Math.atan2(y, x);
			return { r: r, theta: theta };
		}

		static distanceBetweenTwoPoints(x1, y1, x2, y2) {
			let deltaX = x2 - x1;
			let deltaY = y2 - y1;
			return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
		}

		static scale = (number, inMin, inMax, outMin, outMax) => {
            return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
        }

		static shuffleArray = (array) => {
			for (let i = array.length - 1; i > 0; i--) {
			  const j = Math.floor(Math.random() * (i + 1));
			  const temp = array[i];
			  array[i] = array[j];
			  array[j] = temp;
			}
		}	
		
		
        static angleBetweenTwoPoints(x1, y1, x2, y2) {
            var angle = Math.atan2(y2 - y1, x2 - x1);
            angle *= 180 / Math.PI;
            if (angle < 0) angle = 360 + angle;
            return angle;
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
	}

	let init = () => {
		width = window.innerWidth;
		height = window.innerHeight;
		ballCollection = new BallCollection()		
		randomize();
		addEvents();
	}

	let addEvents = () => {
		let canvas = document.getElementById(CANVAS_ID);

		canvas.addEventListener('click', e => {
			ballCollection.addBall(e.offsetX, e.offsetY);
		}, false);
	}
	
	let randomize = () => {	
		hue = Utils.getRandomInt(0, 255);
		radius = Utils.getRandomInt(5, 25);
	}
		
	let drawFrame = (ctx, canvas) => {
		canvas.width = width;
		canvas.height = height;
		ctx.fillStyle = "#000";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.lineWidth = 1;
		ctx.strokeStyle = '#000000';
		ctx.strokeRect(0, 0, width, height);
	}
		
	let draw = () => {	
		let canvas = document.getElementById(CANVAS_ID);
		if (canvas.getContext) {
			let ctx = canvas.getContext('2d')		
			drawFrame(ctx, canvas);
			ballCollection.draw(ctx);
		}
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

