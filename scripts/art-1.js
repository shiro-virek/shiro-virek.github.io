{
	let width = 0;
	let height = 0;
	let angle = 0;	
	let lastPosY = 0;
	let lastPosX = 0;
	let CANVAS_ID = "myCanvas"
	let RAD_CONST = 0.0175;

	let ROTATE = true;
	let OPACITY = 0.5;
	let THICKNESS = 5;
	let LINE_1_LENGTH = 2;
 	let LINE_2_LENGTH = 3;
 	let ANGLE_1 = 10;
 	let ANGLE_2 = 120;
 	let ANGLE_3 = 240;
 	let COLOR_MAP_MAX = 500;

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
		ROTATE = getRandomBool();
		OPACITY = getRandomInt(1, 10) / 10;
		THICKNESS = getRandomInt(3, 100);
		LINE_1_LENGTH = getRandomInt(1, 10);
	 	LINE_2_LENGTH = getRandomInt(1, 10);
	 	ANGLE_1 = getRandomInt(1, 30);
	 	ANGLE_2 = getRandomInt(1, 360);
	 	ANGLE_3 = getRandomInt(1, 360);
	 	COLOR_MAP_MAX =  getRandomInt(1, 5000);
	}

	init = () => {	
		let canvas = document.getElementById(CANVAS_ID);

		randomize();

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
		let hue =  scale(distance, 0, 360, 0, COLOR_MAP_MAX);

		let color = `hsl(${hue}, 100%, 50%, ${OPACITY})`;
		let colorTrail = `hsl(${hue}, 100%, 50%, ${OPACITY})`;

		let lineWidth = scale(distance, 0, 100, 0, THICKNESS);			
		
		this.drawLine(lastPosX, lastPosY, xPointer, yPointer, lineWidth, color);	
		
		if (ROTATE){
			let angleRad = angle * RAD_CONST;
			let angleRad2 = (angle + ANGLE_2) * RAD_CONST;			
			let angleRad3 = (angle + ANGLE_3) * RAD_CONST;

			this.drawLine(xPointer, yPointer, 
				xPointer + parseInt((distance * trailFactor) * Math.cos(angleRad)), 
				yPointer + parseInt((distance * trailFactor) * Math.sin(angleRad)), 
				lineWidth, colorTrail);	

			this.drawLine(xPointer, yPointer, 
				xPointer + parseInt((distance * trailFactor * LINE_1_LENGTH) * Math.cos(angleRad2)), 
				yPointer + parseInt((distance * trailFactor * LINE_1_LENGTH) * Math.sin(angleRad2)), 
				lineWidth, colorTrail);					

			this.drawLine(xPointer, yPointer, 
				xPointer + parseInt((distance * trailFactor * LINE_2_LENGTH) * Math.cos(angleRad3)), 
				yPointer + parseInt((distance * trailFactor * LINE_2_LENGTH) * Math.sin(angleRad3)), 
				lineWidth, colorTrail);	
			
			if (angle >= 360 - ANGLE_1) {
				angle = 0;
			}else{
				angle += ANGLE_1;
			}
		}
							
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