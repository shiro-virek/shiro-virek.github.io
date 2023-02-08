{
	let width = 0;
	let height = 0;
	let angle = 0;	
	let lastPosY = 0;
	let lastPosX = 0;
	let CANVAS_ID = "myCanvas"

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
			
	paint = (xPointer, yPointer) => {	
		let distance = Math.sqrt(Math.pow(lastPosX - xPointer, 2) + Math.pow(lastPosY - yPointer, 2))		
		let color = 'hsl(' + parseInt(distance * 360 / width) + ', 100%, 50%, 0.01)';
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

			let entropyX = ((Math.random() * 2) + 9) / 10 ;
			let entropyY = ((Math.random() * 2) + 9) / 10 ;

			x = (lastPosX + xMod) * entropyX;
			y = (lastPosY + yMod) * entropyY;

			this.drawCircle(x, y, size, color, color);		
			this.drawCircle(x, y, size * 2, color, color);
			this.drawCircle(x, y, size * 3, color, color);
			this.drawCircle(x, y, size * 4, color, color);
			this.drawCircle(x, y, size * 5, color, color);
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
