{

	let width = window.innerWidth;
	let height = window.innerHeight;
	let CANVAS_ID = "myCanvas"

	let PARTICLES_COUNT = 1000;
	let MINIMUM_LIFE = 50;
	let MAXIMUM_LIFE = 100;
	let MINIMUM_DIAMETER = 5;
	let MAXIMUM_DIAMETER = 15;
	let AMPLITUDE = 50;
	let ALL_SIN = false;

	let lastRender = 0

	let objects = [];

	class Color{
		constructor(r, g, b, a){
			this.red = r;
			this.green = g;
			this.blue = b;
			this.alpha = a;
		}

		getRGBA(){
			return `rgba(${this.red}, ${this.green}, ${this.blue}, ${this.alpha})`;
		}
	}

	class Particle {    
		constructor(){  
			this.setNewFireObject();
		}    
	  
		setNewFireObject(notFirstTime){
			this.notFirstTime = notFirstTime;
			this.sin = getRandomBool();
			this.yCenter = height + 100 - getRandomInt(1, 50);
			this.diameter = MAXIMUM_DIAMETER;
			this.radius = this.diameter / 2;  
			this.speed = 5;
			this.life = getRandomInt(MINIMUM_LIFE, MAXIMUM_LIFE);
			this.xCenter = getRandomInt(1, width);
		}

		getColor(){
			let alpha = this.life * 255 / MAXIMUM_LIFE;
			let green = (this.life / 2) * 255 / MAXIMUM_LIFE;
			let col = new Color(255,green,0, alpha);    
			return col;
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


			if (this.life > 0)
				this.life--;
			else{
				this.setNewFireObject(true);
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
		PARTICLES_COUNT = getRandomInt(50, 1000);
		MINIMUM_LIFE = getRandomInt(10, 90)
		MAXIMUM_LIFE = getRandomInt(100, 200);
		MINIMUM_DIAMETER = getRandomInt(1, 10);
		MAXIMUM_DIAMETER = getRandomInt(12, 20);
		AMPLITUDE = getRandomInt(10, 100);
		ALL_SIN = getRandomBool();
	}

	addFire = (mouseX, mouseY) => {
		let obj = new Particle(true);
		obj.setNewFireObject(true);
		obj.xCenter = mouseX;
		obj.yCenter = mouseY;
		objects.push(obj);
		PARTICLES_COUNT++; 
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
			ctx.fillStyle = "#333";
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
			
	draw = () => {		
		drawFrame();

		for (i = 0; i < PARTICLES_COUNT; i++){ 
			objects[i].update();

			if (objects[i].notFirstTime)
				drawCircle(objects[i].xMovement, objects[i].yCenter,  objects[i].getDiameter(), objects[i].getColor().getRGBA());   	 
		}
	}

	trackMouse = (mouseX, mouseY) => {
		addFire(mouseX, mouseY);
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
