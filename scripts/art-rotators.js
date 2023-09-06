{
	//ART-1

	let width = 0;
	let height = 0;
	let angle = 0;	
	let lastPosY = null;
	let lastPosX = null;

	let rotatorsLengths = [];
	let rotatorsAngles = [];

	let CANVAS_ID = "myCanvas"
	let RAD_CONST = 0.0175;

	let OPACITY = 0.5;
	let THICKNESS = 5;

 	let ANGLE_ROTATION = 10;

 	let COLOR_MAP_MAX = 500;
 	let ROTATORS = 3;

	getRandomBool = () => {
		return Math.random() < 0.5;
	}

	getRandomInt = (min, max) => {
		return Math.floor(Math.random() * max) + min;
	}

	scale = (number, inMin, inMax, outMin, outMax) => {
	    return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
	}

	randomize = () => {
		OPACITY = getRandomInt(1, 6) / 10;
		THICKNESS = getRandomInt(1, 30);
	 	ANGLE_ROTATION = getRandomInt(0, 20);
	 	COLOR_MAP_MAX = getRandomInt(1, 5000);

	 	ROTATORS = getRandomInt(0, 7);

	 	let rotatorsLength = 0
	 	let rotatorsAngle = 0;

	 	for (let i = 0; i < ROTATORS - 1; i++){
	 		rotatorsLength += getRandomInt(1, 1000)
	 		rotatorsAngle += getRandomInt(1, 180)
	 		rotatorsLengths.push(rotatorsLength);
	 		rotatorsAngles.push(rotatorsAngle);
	 	}
	}

	addEvents = () => {
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
	}

	init = () => {	
		randomize();
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

	drawLine = (x, y, x2, y2, width = 1, color = '#000000') => {
		let canvas = document.getElementById(CANVAS_ID);
		if (canvas.getContext){
			let ctx = canvas.getContext('2d');
			ctx.lineWidth = width;
			ctx.lineCap = 'round';
			ctx.strokeStyle = color;
			ctx.beginPath();
			ctx.moveTo(x, y);
	        ctx.lineTo(x2, y2);
			ctx.stroke();
		}
	}
			
	paint = (xPointer, yPointer) => {	
		if (lastPosX == 0) lastPosX = xPointer;
		if (lastPosY == 0) lastPosY = yPointer;

		let distance = Math.sqrt(Math.pow(lastPosX - xPointer, 2) + Math.pow(lastPosY - yPointer, 2))		
		let hue =  scale(distance, 0, 360, 0, COLOR_MAP_MAX);

		let color = `hsl(${hue}, 100%, 50%, ${OPACITY})`;

		let lineWidth = scale(distance, 1, 100, 0, THICKNESS);			
		
		this.drawLine(lastPosX, lastPosY, xPointer, yPointer, lineWidth, color);	
	
		let angleRad = angle * RAD_CONST;		

		this.drawLine(xPointer, yPointer, 
			xPointer + parseInt(distance * Math.cos(angleRad)), 
			yPointer + parseInt(distance * Math.sin(angleRad)), 
			lineWidth, color);			

		if (ROTATORS > 0)
			for (let i = 0; i < ROTATORS - 1; i++){
				let angleRad2 = (angle + rotatorsAngles[i]) * RAD_CONST;	
				this.drawLine(xPointer, yPointer, 
					xPointer + parseInt((distance * rotatorsLengths[i]) * Math.cos(angleRad2)), 
					yPointer + parseInt((distance * rotatorsLengths[i]) * Math.sin(angleRad2)), 
					lineWidth, color);	
			}
			
		angle += ANGLE_ROTATION;			
				
		lastPosX = xPointer;
		lastPosY = yPointer ; 			
	}

	width = window.innerWidth;
	height = window.innerHeight;
	angle = 0;	
	lastPosY = 0;
	lastPosX = 0;			

	init();

}