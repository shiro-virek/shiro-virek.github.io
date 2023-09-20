{
	let width = 0;
	let height = 0;
	let lastPosY = 0;
	let lastPosX = 0;
	let CANVAS_ID = "myCanvas"
	let LINES_COUNT = 0;
	let RAD_CONST = 0.0175;
	let LINE_THICKNESS = 10;
	let ALPHABETIC_SYMBOL = false;

	let lastRender = 0

	let objects = [];
	
	const LineTypes = Object.freeze({
		Regular: Symbol("regular")
	});

	class Point{
		constructor(x, y){
			this.x = x;
			this.y = y;	
		}
	}

	class Station{
		constructor(x, y){
			this.x = x;
			this.y = y;	
		}
	}

	class Line{
		constructor(x, y){
			this.x = x;
			this.y = y;			
			this.points = [];	
			this.stations = [];
			this.symbol = ALPHABETIC_SYMBOL ? "A" : 1;
		}		

		randomize = () => {
			this.lineThickness = LINE_THICKNESS;
			this.hue = getRandomInt(1, 360);			
			this.saturation = 100;
			this.light = getRandomInt(20, 80);	
		
			if (objects.length > 0)
				if (ALPHABETIC_SYMBOL)
					this.symbol = nextCharacter(objects[objects.length - 1].symbol)
				else
					this.symbol = objects[objects.length - 1].symbol + 1;

			let lastX = this.x;
			let lastY = this.y;
			let lastDirection = 0; 
			let baseDirection = 45 * getRandomInt(0, 7);
			let numberOfPoints  = getRandomInt(3, 12);

			let firstPoint = new Point(this.x, this.y);			
			this.points.push(firstPoint);
			let firstStation = new Station(this.x, this.y);
			this.stations.push(firstStation);

			for (let index = 0; index < numberOfPoints; index++) {
				let length = getRandomInt(20, 200);
				let direction = baseDirection + this.getDirection(lastDirection);
	
				let deltaX = Math.cos(direction * RAD_CONST) * length;
				let deltaY = Math.sin(direction * RAD_CONST) * length;

				let newX = lastX + deltaX;				
				let newY = lastY + deltaY;	
				let point = new Point(newX, newY);			

				if (newX < 0 || newX > width || newY < 0 || newY > height) 
					continue;

				this.points.push(point);	

				lastX = newX;
				lastY = newY;

				lastDirection = direction;
			}			

			let lastStation = new Station(lastX, lastY);
			this.stations.push(lastStation);			
		}

		getDirection = (lastDirection) => {
			return  45 * getRandomInt(0, 3);
		}

		drawMetroLine = (ctx) => {				
			ctx.lineCap = "round";
			ctx.lineWidth = this.lineThickness;
			ctx.strokeStyle = this.colorBase();
			ctx.beginPath();
			ctx.moveTo(this.x, this.y);

			this.drawSegments(ctx);
			this.drawStations(ctx);
		
		}	

		drawSegments = (ctx) => {
			for (let index = 0; index < this.points.length; index++) {
				const element = this.points[index];
				ctx.lineTo(element.x, element.y); 
			}
			ctx.stroke(); 	
		}

		drawStations = (ctx) => {

			//ctx.isPointInPath(20, 50)

			for (let index = 0; index < this.stations.length; index++) {
				const element = this.stations[index];
				drawCircle(ctx, element.x, element.y, 3, "#FFF", "#FFF");
			}
		}		

		colorBase = () => `hsl(${this.hue}, ${this.saturation}%, ${this.light}%)`; 
	}

	init = () => {
		randomize();
		addEvents();
		drawFrame();
	}

	randomize = () => {
		ALPHABETIC_SYMBOL = getRandomBool();
	}

	getRandomInt = (min, max) => {
		return Math.floor(Math.random() * max) + min;
	}

	getRandomFloat = (min, max, decimals) => {
		const str = (Math.random() * (max - min) + min).toFixed(
		  decimals,
		);
	  
		return parseFloat(str);
	}

	getRandomBool = () => {
		return Math.random() < 0.5;
	}

	addEvents = () => {
		let canvas = document.getElementById(CANVAS_ID);

		canvas.addEventListener('click', e => {
			addMetroLine(e.offsetX, e.offsetY);
		}, false);
	}

	getNumberOfStations = () => {
		let numberOfStations = 0;
		objects.forEach((element) => numberOfStations += element.stations.length);
		return numberOfStations;
	}	

	getNumberOfLines = () => {
		return objects.length;
	}	

	getLinesLength = () => {
		let linesLength = 0;
		for (let i = 0; i < LINES_COUNT; i++){
			for (let j = 1; j < objects[i].points.length; j++){
				linesLength += Math.floor(Math.sqrt(Math.pow(objects[i].points[j].x - objects[i].points[j-1].x, 2) + Math.pow(objects[i].points[j].y - objects[i].points[j-1].y, 2)));
			}
		}	
		return Math.floor(linesLength / 100);
	}

	drawLinesInfo = (ctx, canvas) => {
		let marginTop = 30;
		let marginLeft = 30;
		let symbolSide = 15;
		let lineHeight = 20;
		let headerHeight = 80;
		let padding = 10;
		
		ctx.fillStyle = "#FFF";
		let frameWidth = 100;
		let frameHeight = marginTop + headerHeight + LINES_COUNT * lineHeight;
		ctx.fillRect(marginLeft, marginTop, frameWidth, frameHeight);
		ctx.lineWidth = 1;
		ctx.strokeStyle = '#000000';
		ctx.strokeRect(marginLeft, marginTop, frameWidth, frameHeight);

		ctx.font = "10px Arial";
		ctx.fillStyle = "#000";	
		ctx.fillText(`City Metro System`, marginLeft + padding, marginTop + padding * 2); 
		ctx.fillText(`Stations: ${getNumberOfStations()}`, marginLeft + padding, marginTop + padding * 2 + lineHeight); 
		ctx.fillText(`Lines: ${getNumberOfLines()}`, marginLeft + padding, marginTop + padding * 2 + lineHeight * 2); 
		ctx.fillText(`Length: ${getLinesLength()} km.`, marginLeft + padding, marginTop + padding * 2 + lineHeight * 3); 

		for (let i = 0; i < LINES_COUNT; i++){
			drawRectangle(ctx, marginLeft + padding, marginTop + headerHeight + padding + i * lineHeight, symbolSide, symbolSide, '#000', objects[i].colorBase());
			ctx.fillStyle = "#000";			
			ctx.fillText(`Line ${objects[i].symbol}`, marginLeft + symbolSide + padding * 2, marginTop + headerHeight + padding * 2 + i * lineHeight); 
		}	
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

	drawCircle = (ctx, x, y, radio, color = '#00FF00', fillColor = '#00FF00') => {
		ctx.strokeStyle = color;
		ctx.fillStyle = fillColor;
		ctx.beginPath();
		ctx.arc(x, y, radio, 0, 2 * Math.PI);
		ctx.fill();	
	}     

	drawRectangle = (ctx, x, y, width, height, color = '#FFF', fillColor = '#00FF00') => {
		ctx.strokeStyle = color;
		ctx.fillStyle = fillColor;
		ctx.beginPath();
		ctx.rect(x, y, width, height);
		ctx.fill();
		ctx.stroke();
	}
	
	drawLines = () => {
		for (let i = 0; i < LINES_COUNT; i++){
			let canvas = document.getElementById(CANVAS_ID);
			if (canvas.getContext){
				let ctx = canvas.getContext('2d');
				objects[i].drawMetroLine(ctx);
			}			
		}		
	}

	nextCharacter = (c) => {
		return String.fromCharCode(c.charCodeAt(0) + 1);
	}
	 

	addMetroLine = (x, y) => {	
		let line = new Line(x, y);	
		line.randomize();	
		objects.push(line);
		LINES_COUNT++; 
	}			
			
	draw = () => {	
		drawFrame();

		if (LINES_COUNT > 0){
			let canvas = document.getElementById(CANVAS_ID);
			if (canvas.getContext){
				let ctx = canvas.getContext('2d')
				drawLines(ctx);
				drawLinesInfo(ctx, canvas);
			}
		}
				
	}

	width = window.innerWidth;
	height = window.innerHeight;
	lastPosY = 0;
	lastPosX = 0;			

	loop = (timestamp) => {
		let progress = timestamp - lastRender;

		draw();

		lastRender = timestamp;
		window.requestAnimationFrame(loop);
	}

	init();

	window.requestAnimationFrame(loop);

}