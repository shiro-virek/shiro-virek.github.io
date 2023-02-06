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
			
	paint = (xPointer, yPointer) => {	
		const trailFactor = 7;
		let distance = Math.sqrt(Math.pow(lastPosX - xPointer, 2) + Math.pow(lastPosY - yPointer, 2))		
		let color = 'hsl(' + parseInt(distance * 360 / 100) + ', 100%, 50%, 0.1)';
		let colorTrail = 'hsl(' + parseInt(distance * 360 / 100) + ', 100%, 50%, 0.5)';
		let size =  parseInt(distance / 5);
		let lineWidth = parseInt(distance / 5);			
		
		this.drawLine(lastPosX, lastPosY, xPointer, yPointer, lineWidth, color);	
							
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
