var width = 0;
var	height = 0;
var angle = 0;	
var lastPosY = 0;
var lastPosX = 0;
var CANVAS_ID = "myCanvas"

init = () => {	
	let canvas = document.getElementById(CANVAS_ID);

	canvas.addEventListener('mousemove', e => {
	  paint(e.offsetX, e.offsetY);
	}, false);

	canvas.addEventListener('touchstart', function(e){
		paint(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
	});

	canvas.addEventListener('touchmove', function(e){
	  e.preventDefault();
	  paint(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
	});

	drawFrame(canvas);
}

drawFrame = (canvas) => {
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

drawLine = (x, y, x2, y2, width = 1, color = '#000000') => {
	let canvas = document.getElementById(CANVAS_ID);
	if (canvas.getContext){
		let ctx = canvas.getContext('2d');
		ctx.lineWidth = width;
		ctx.strokeStyle = color;
		ctx.beginPath();
		ctx.moveTo(x, y);
        ctx.lineTo(x2, y2);
		ctx.stroke();
	}
}
		
paint = (xPointer, yPointer) => {	
	const trailFactor = 7;
	let distance = Math.sqrt(Math.pow(lastPosX - xPointer, 2) + Math.pow(lastPosY - yPointer, 2))		
	let color = 'hsl(' + parseInt(distance * 360 / 100) + ', 100%, 50%, 0.5)';
	let colorTrail = 'hsl(' + parseInt(distance * 360 / 100) + ', 100%, 50%, 0.5)';
	let size =  parseInt(distance / 5);
	let lineWidth = parseInt(distance / 5);			
	
	this.drawLine(lastPosX, lastPosY, xPointer, yPointer, lineWidth, color);	

	//Spinner auto-rotation/////////////////////////////////////
	
	let angleRad = angle * 0.0175;
	let angleRad2 = (angle + 120) * 0.0175;			
	let angleRad3 = (angle + 240) * 0.0175;

	this.drawLine(xPointer, yPointer, 
		xPointer + parseInt((distance * trailFactor) * Math.cos(angleRad)), 
		yPointer + parseInt((distance * trailFactor) * Math.sin(angleRad)), 
		lineWidth, colorTrail);	

	this.drawLine(xPointer, yPointer, 
		xPointer + parseInt((distance * trailFactor * 2) * Math.cos(angleRad2)), 
		yPointer + parseInt((distance * trailFactor * 2) * Math.sin(angleRad2)), 
		lineWidth, colorTrail);					

	this.drawLine(xPointer, yPointer, 
		xPointer + parseInt((distance * trailFactor * 3) * Math.cos(angleRad3)), 
		yPointer + parseInt((distance * trailFactor * 3) * Math.sin(angleRad3)), 
		lineWidth, colorTrail);	
	
	if (angle >= 350) {
		angle = 0;
	}else{
		angle += 10;
	}
	
	///////////////////////////////////////////////////////////
						
	lastPosX = xPointer;
	lastPosY = yPointer ; 			
}

width = window.innerWidth;
height = window.innerHeight;
angle = 0;	
lastPosY = 0;
lastPosX = 0;			

init();