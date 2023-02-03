var width = window.innerWidth;
var height = window.innerHeight;
var CANVAS_ID = "myCanvas"

var OBJECTS_COUNT = 60;
var RINGS_DISTANCE = 20;
var RINGS_SPEED = 1;
var CENTER_MOVEMENT_SPEED = 1;
var MAX_DISTANCE_TO_CENTER = 30;
var TENTACLES_MOVEMENT = true;
var SHOW_RINGS = true;

var distanceToCenter = 0;
var movingToCenter = false; 
var colorFactor = 0;
var globalCounter = 0;
var objects = [];

var lastRender = 0
var mouseX;
var mouseY;

class TrailingObject {  

  constructor(speed, quadrant, mouseX, mouseY){
    this.speed = speed;               
    this.diameter = this.speed;
    this.radius = Math.floor(this.diameter / 2);
    this.quadrant = quadrant;

    this.xCenter = mouseX - this.radius;
    this.yCenter = mouseX - this.radius; 

  }  
  
  adjustQuadrant = () => {

    switch(this.quadrant){
      case 1:
        this.difX -= this.diameter + distanceToCenter;
        this.difY -= this.diameter + distanceToCenter;
      break;
      case 2:
        this.difX += this.diameter + distanceToCenter;
        this.difY -= this.diameter + distanceToCenter;
      break;
      case 3:
        this.difX -= this.diameter + distanceToCenter;
        this.difY += this.diameter + distanceToCenter;
      break;
      case 4:
        this.difX += this.diameter + distanceToCenter;
        this.difY += this.diameter + distanceToCenter;
      break;
    }
  }
  
  update = () => {      
  	mouseX = mouseX ? mouseX : 0;  	
  	mouseY = mouseY ? mouseY : 0;
	this.xCenter =  this.xCenter ?  this.xCenter : 0;  	
	this.yCenter = this.yCenter ? this.yCenter : 0;

    this.difX = mouseX - this.xCenter;
    this.difY = mouseY - this.yCenter;
    
    this.adjustQuadrant();
    
    this.xCenter += this.difX / this.speed;
    this.yCenter += this.difY / this.speed;  
  } 
} 

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

updateColorFactor = () => { 
  if (globalCounter % RINGS_SPEED == 0){
    if (colorFactor >= RINGS_DISTANCE) 
      colorFactor = 1;
    else
      colorFactor += 1;   
  }
}

updateDistanceToCenter = () => {  
  if (globalCounter % CENTER_MOVEMENT_SPEED == 0){
      if (distanceToCenter > MAX_DISTANCE_TO_CENTER)
        movingToCenter = true;
        
      if (distanceToCenter <= 0)
        movingToCenter = false;    
      
      if (movingToCenter) 
        distanceToCenter -= 1;
      else
        distanceToCenter += 1;   
  }

  console.log(distanceToCenter);
}

addParticles = () => {
  for (var i = OBJECTS_COUNT; i > 0 ; i--){  	
     objects.push(new TrailingObject(i, 1, mouseX, mouseY)); 
     objects.push(new TrailingObject(i, 2, mouseX, mouseY)); 
     objects.push(new TrailingObject(i, 3, mouseX, mouseY)); 
     objects.push(new TrailingObject(i, 4, mouseX, mouseY)); 
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
	addEvents();
	drawFrame();
	addParticles();
}

drawFrame = () => {
	let canvas = document.getElementById(CANVAS_ID);

	if (canvas.getContext){
		canvas.width = width;
  		canvas.height = height;
		let ctx = canvas.getContext('2d')
		ctx.fillStyle = "#000000";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.lineWidth = 1;
		ctx.strokeStyle = '#000000';
		ctx.strokeRect(0, 0, width, height);
	}
}

drawCircle = (x, y, radio, color = '#00FF00') => {
	let canvas = document.getElementById(CANVAS_ID);
	if (canvas.getContext){
		let ctx = canvas.getContext('2d');
		ctx.strokeStyle = "rgba(1, 1, 1, 0)";
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.arc(x, y, radio, 0, 2 * Math.PI);
		ctx.fill();
	}
}

isLight = (indexRing) => {    
  var result = false;  

  var iterations = OBJECTS_COUNT / RINGS_DISTANCE * 4;

  for (var i = 0; i <= iterations; i++){
    result = result || (indexRing >= colorFactor + (RINGS_DISTANCE * i) && indexRing < colorFactor + (RINGS_DISTANCE * i) + 4);
  }

  return result;
}
		
draw = () => {		
	drawFrame();

	for (var i = 0; i < OBJECTS_COUNT * 4; i++){ 
		objects[i].update();
	    colorValue = (i * 255 / (OBJECTS_COUNT * 4));

	    var color;
 
	    if (SHOW_RINGS && isLight(i))
	       color = new Color(0, colorValue + 20, 0, 255);
	    else
	       color = new Color(0, colorValue , 0, 255);
    
		drawCircle(objects[i].xCenter, objects[i].yCenter,  objects[i].diameter, color.getRGBA()); 
	}

	updateColorFactor();

	if (TENTACLES_MOVEMENT) updateDistanceToCenter();

	globalCounter++;  	
}

trackMouse = (x, y) => {
	mouseX = x;
	mouseY = y;
}

loop = (timestamp) => {
	var progress = timestamp - lastRender;

	draw();

	lastRender = timestamp;
	window.requestAnimationFrame(loop);
}

init();

window.requestAnimationFrame(loop)
