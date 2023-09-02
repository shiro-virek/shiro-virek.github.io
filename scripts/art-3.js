{	
	//ART-3

	let width = window.innerWidth;
	let height = window.innerHeight;
	let CANVAS_ID = "myCanvas"

	let PARTICLES_COUNT = 500;
	let MINIMUM_LIFE = 20;
	let MAXIMUM_LIFE = 100;
	let MINIMUM_DIAMETER = 5;
	let MAXIMUM_DIAMETER = 15;
	let MINIMUM_SPEED = 5;
	let MAXIMUM_SPEED = 10;
	let AMPLITUDE = 50;
	let ALL_SIN = false;

	let lastRender = 0

	let objects = [];

	const Figures = Object.freeze({
		Square: Symbol("square"),
		Circle: Symbol("circle")
	});

	class Particle {    
		constructor(){  
			this.setNewParticleObject();
		}    
	  
		setNewParticleObject(notFirstTime){
			this.notFirstTime = notFirstTime;
			this.sin = getRandomBool();
			this.yCenter = height + 100 - getRandomInt(1, 50);
			this.diameter = MAXIMUM_DIAMETER;
			this.radius = this.diameter / 2;  
			this.speed = getRandomInt(1, MAXIMUM_SPEED);
			this.life = getRandomInt(MINIMUM_LIFE, MAXIMUM_LIFE);
			this.xCenter = getRandomInt(1, width);
			var rand = getRandomInt(0, Object.keys(Figures).length);
			this.shape = Figures[Object.keys(Figures)[rand]];
			this.hue = getRandomInt(0, 255);
			this.angle = getRandomInt(0, 360);
		}

		getColor(){
			let alpha = this.life / MAXIMUM_LIFE;
			let hue = this.life * 3 * this.hue / MAXIMUM_LIFE;
			let saturation = this.life * 100 / (MAXIMUM_LIFE * 3);
			let light = this.life * 100 / (MAXIMUM_LIFE * 3);
			return `hsl(${hue}, ${saturation}%, ${light}%, ${alpha})`;
		}
	  
		getDiameter(){
			return this.life * MAXIMUM_DIAMETER / MAXIMUM_LIFE;
		}
	  
		update() {   
			this.yCenter -= this.speed;    

			if (this.sin || ALL_SIN)
				this.xMovement = (AMPLITUDE * (Math.sin(degToRad(this.yCenter)))) + this.xCenter; //float
			else
				this.xMovement = (AMPLITUDE * (Math.cos(degToRad(this.yCenter)))) + this.xCenter; //float

			this.angle++;

			if (this.life > 0)
				this.life--;
			else{
				this.setNewParticleObject(true);
			}
		} 
	} 

	getRandomBool = () => {
		return Math.random() < 0.5;
	}

	getRandomInt = (min, max) => {
		return Math.floor(Math.random() * max) + min;
	}

	degToRad = (deg) => {
	    return deg * (Math.PI / 180.0);
	}

	randomize = () => {
		PARTICLES_COUNT = getRandomInt(50, screen.height * screen.width / 1000);
		MINIMUM_LIFE = getRandomInt(10, 90)
		MAXIMUM_LIFE = getRandomInt(100, 200);
		MINIMUM_DIAMETER = getRandomInt(1, 10);
		MAXIMUM_DIAMETER = getRandomInt(12, 20);
		AMPLITUDE = getRandomInt(10, 100);
		ALL_SIN = getRandomBool();
	}

	addParticle = (mouseX, mouseY, keepSameSize = false) => {
		if (keepSameSize) objects.shift(); //REVISAR ESTA LINEA
		let obj = new Particle(true);
		obj.setNewParticleObject(true);
		obj.xCenter = mouseX;
		obj.yCenter = mouseY;
		objects.push(obj);
	}

	addParticles = () => {
		for (i = 0; i < PARTICLES_COUNT ; i++){  
			obj = new Particle(false);          
			objects.push(obj); 
		}
	}

	addEvents = () => {
		let canvas = document.getElementById(CANVAS_ID);
		
		canvas.addEventListener('mousemove', e => {
			trackMouse(e.offsetX, e.offsetY);
		}, false);

		canvas.addEventListener('touchstart', function(e){
			trackMouse(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
		});

		canvas.addEventListener('touchmove', function(e){
			e.preventDefault();
			trackMouse(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
		});	
	}

	init = () => {
		randomize();
		addParticles();
		addEvents();
		drawFrame();
	}

	drawFrame = () => {
		let canvas = document.getElementById(CANVAS_ID);

		if (canvas.getContext){
			canvas.width = width;
	  		canvas.height = height;
			let ctx = canvas.getContext('2d')
			ctx.fillStyle = "#000";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.lineWidth = 1;
			ctx.strokeStyle = '#000000';
			ctx.strokeRect(0, 0, width, height);
		}
	}

	drawCircle = (x, y, radio, color = '#00FF00', fillcolor = '#00FF00') => {
		let canvas = document.getElementById(CANVAS_ID);
		if (canvas.getContext){
			let ctx = canvas.getContext('2d');
			ctx.strokeStyle = color;
			ctx.fillStyle = color;
			ctx.beginPath();
			ctx.arc(x, y, radio, 0, 2 * Math.PI);
			ctx.fill();
		}
	}
	
	drawSquare = (x, y, side, angle, color = '#00FF00', fillcolor = '#00FF00') =>{
		let canvas = document.getElementById(CANVAS_ID);
		if (canvas.getContext){
			let ctx = canvas.getContext('2d');		
			ctx.save();
			ctx.strokeStyle = color;
			ctx.fillStyle = color;				
			ctx.beginPath();
			let halfSide = side / 2;	
			ctx.translate(x, y);
			ctx.rotate(angle * Math.PI / 180);
			ctx.rect(-halfSide, -halfSide, side, side);
			ctx.fill();
			ctx.restore();
		}
	}
			
	draw = () => {		
		drawFrame();

		for (i = 0; i < PARTICLES_COUNT; i++){ 
			objects[i].update();

			if (objects[i].notFirstTime){
				switch(objects[i].shape){
					case Figures.Circle:
						drawCircle(objects[i].xMovement, objects[i].yCenter,  objects[i].getDiameter(), objects[i].getColor()); 
						break;
					case Figures.Square:
						drawSquare(objects[i].xMovement, objects[i].yCenter,  objects[i].getDiameter(), objects[i].angle, objects[i].getColor()); 
						break;
				}
			}				  	 
		}
	}

	trackMouse = (mouseX, mouseY) => {
		addParticle(mouseX, mouseY, true);
	}

	loop = (timestamp) => {
		let progress = timestamp - lastRender;

		draw();

		lastRender = timestamp;
		window.requestAnimationFrame(loop);
	}

	init();

	window.requestAnimationFrame(loop)	
}
