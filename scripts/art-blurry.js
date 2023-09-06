{
	//ART-2

	let width = 0;
	let height = 0;
	let angle = 0;	
	let lastPosY = 0;
	let lastPosX = 0;
	let CANVAS_ID = "myCanvas"
	let ENTROPY_1 = 2;
	let CIRCLES = 5;

	init = () => {
		randomize();
		addEvents();
		drawFrame();
	}

	getRandomInt = (min, max) => {
		return Math.floor(Math.random() * max) + min;
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

	randomize = () => {	
		ENTROPY_1 = getRandomInt(1, 10);
		CIRCLES = getRandomInt(3, 10);
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
			
	paint = (xPointer, yPointer) => {	
		if (lastPosX == 0) lastPosX = xPointer;
		if (lastPosY == 0) lastPosY = yPointer;

		let distance = Math.sqrt(Math.pow(lastPosX - xPointer, 2) + Math.pow(lastPosY - yPointer, 2))		
		let color = `hsl(${parseInt(distance)}, 100%, 50%, 0.01)`;
		let size = 5;
		
		let steps = parseInt(distance / size)
		let xMod = 0;
		let yMod = 0;
		let x = 0;
		let y = 0;
		let angleCart = 0;

		if ((xPointer < lastPosX && yPointer > lastPosY) || (xPointer > lastPosX && yPointer < lastPosY)) {
			angleCart = Math.atan((xPointer - lastPosX) / (yPointer - lastPosY) ) + 1.5708;
		}
		else
		{
			angleCart = Math.atan((yPointer - lastPosY) / (xPointer - lastPosX));
		}

		for(i = 1; i <= steps; i++){
			if (xPointer < lastPosX){
				xMod = - parseInt((size * i) * Math.cos(angleCart)); 
			}else{
				xMod = parseInt((size * i) * Math.cos(angleCart));
			}
			
			if (yPointer < lastPosY){
				yMod = - parseInt((size * i) * Math.sin(angleCart));
			}else{
				yMod = parseInt((size * i) * Math.sin(angleCart));
			}	

			let entropy = ((Math.random() * ENTROPY_1) + 9) / 10;

			x = (lastPosX + xMod) * entropy;
			y = (lastPosY + yMod) * entropy;

			for (let i = 0; i <= CIRCLES; i++){
				this.drawCircle(x, y, size * i, color, color);
			}
		}

		lastPosX = xPointer;
		lastPosY = yPointer; 			
	}

	width = window.innerWidth;
	height = window.innerHeight;
	angle = 0;	
	lastPosY = 0;
	lastPosX = 0;			

	init();

}
