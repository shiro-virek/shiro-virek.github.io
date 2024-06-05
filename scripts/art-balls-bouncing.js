{
	let CANVAS_ID = "myCanvas"
	let DRAW_QUADTREE = true;

	let width = 0;
	let height = 0;
	let ballCollection;	
	let lastRender = 0

	class Ball {
		constructor(x, y) {
			this.x = x;
			this.y = y;
		}

		draw = (ctx) => {
			Utils.drawCircle(ctx, this.x, this.y, 20, "#000", "#FFF");
		}

		getTop = () => this.y;
		getBottom = () => this.y;
		getLeft = () => this.x;
		getRight = () => this.x;
	}

	class BallCollection {
		constructor(){
			this.balls = [];
			this.quad = Quadtree.generateQuadtree(width, height);
		}			

		
		drawBalls = (ctx) => {
			for (const ball of ballCollection.balls) {
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
