{
	let width = 0;
	let height = 0;
	let lastPosY = 0;
	let lastPosX = 0;
	let angle;
	let CANVAS_ID = "myCanvas"
	let ENTROPY_1 = 2;
	let BUILDINGS_COUNT = 0;
	let MINIMUM_HEIGHT = 40;
	let MAXIMUM_HEIGHT = 360;
	let RAD_CONST = 0.0175;

	let lastRender = 0

	let objects = [];

	const CWHues = [232, 203, 189, 173, 162];

	class Building{
		constructor(x, y){
			this.x = x;
			this.y = y;
		}
	}

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

		canvas.addEventListener('click', e => {
		  addBuilding(e.offsetX, e.offsetY);
		}, false);
	}

	randomize = () => {	
		angle = getRandomInt(0, 40);
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

	drawBuilding = (building) => {
		let canvas = document.getElementById(CANVAS_ID);
		if (canvas.getContext){
			let ctx = canvas.getContext('2d');
			ctx.strokeStyle = '#000000';

			let color = `hsl(${building.hue}, ${building.saturation}%, ${building.light}%)`; 
			let color2 = `hsl(${building.hue}, ${building.saturation}%, ${building.light - 20}%)`; 
			let color3 = `hsl(${building.hue}, ${building.saturation}%, ${building.light + 20}%)`; 
	
			let blockWidthFactor = Math.cos(angle * RAD_CONST) * building.buildingSideAWidth;
			let blockHeightFactor = Math.sin(angle * RAD_CONST) * building.buildingSideAWidth;

			//Left Face			
			ctx.fillStyle = color;
			ctx.beginPath();
			ctx.moveTo(building.x, building.y); 
			ctx.lineTo(building.x - blockWidthFactor, building.y - blockHeightFactor);  
			ctx.lineTo(building.x - blockWidthFactor, building.y - (blockHeightFactor + building.height)); 
			ctx.lineTo(building.x, building.y - building.height); 
			ctx.lineTo(building.x, building.y); 
			ctx.fill();		

			//Right Face			
			ctx.fillStyle = color2;
			ctx.beginPath();
			ctx.moveTo(building.x, building.y); 
			ctx.lineTo(building.x + blockWidthFactor, building.y - blockHeightFactor);  
			ctx.lineTo(building.x + blockWidthFactor, building.y - (blockHeightFactor + building.height)); 
			ctx.lineTo(building.x, building.y - building.height);
			ctx.lineTo(building.x, building.y); 
			ctx.fill();
			
			//Top Face
			ctx.fillStyle = color3;
			ctx.beginPath();
			ctx.moveTo(building.x, building.y - building.height);
			ctx.lineTo(building.x - blockWidthFactor, building.y - (blockHeightFactor + building.height));  
			ctx.lineTo(building.x, building.y -  ((blockHeightFactor * 2) + building.height)); 
			ctx.lineTo(building.x + blockWidthFactor, building.y - (blockHeightFactor + building.height)); 
			ctx.lineTo(building.x, building.y - building.height); 
			ctx.fill();			

			drawWindows(ctx, building);
		}
	}

	drawWindows = (ctx, building) => {		
		let colorLight = `hsl(${building.CWHue}, ${building.CWSaturation}%, ${building.CWLight + 20}%)`; 				
		let colorDark = `hsl(${building.CWHue}, ${building.CWSaturation}%, ${building.CWLight}%)`; 
		ctx.strokeStyle = '#000000';

		let windowWidth = ((building.buildingSideAWidth - (building.margin * (building.cols + 1))) / building.cols);
		let windowHeight = ((building.height - (building.margin * (building.rows + 1))) / building.rows);
		let blockWidthFactor = Math.cos(angle * RAD_CONST) * windowWidth;
		let blockHeightFactor = Math.sin(angle * RAD_CONST) * windowWidth;

		for (let ix = 0; ix < building.cols; ix++){
			for (let iy = 0; iy < building.rows; iy++){
				//Left
				ctx.fillStyle = colorLight;
				ctx.beginPath();
				let wx = building.x - (Math.cos(angle * RAD_CONST) * (building.margin + ((building.margin + windowWidth) * ix)));
				let wy = building.y - (Math.sin(angle * RAD_CONST) * (building.margin + ((building.margin + windowWidth) * ix))) - (building.margin + ((building.margin + windowHeight) * iy));
				ctx.moveTo(wx, wy); 
				ctx.lineTo(wx - blockWidthFactor, wy - blockHeightFactor);  
				ctx.lineTo(wx - blockWidthFactor, wy - (blockHeightFactor + windowHeight)); 
				ctx.lineTo(wx, wy - windowHeight); 
				ctx.lineTo(wx, wy); 
				ctx.fill();
				
				//Right
				ctx.fillStyle = colorDark;
				wx = building.x + (Math.cos(angle * RAD_CONST) * (building.margin + ((building.margin + windowWidth) * ix)));
				wy = building.y - (Math.sin(angle * RAD_CONST) * (building.margin + ((building.margin + windowWidth) * ix))) - (building.margin + ((building.margin + windowHeight) * iy));

				ctx.beginPath();
				ctx.moveTo(wx, wy); 
				ctx.lineTo(wx + blockWidthFactor, wy - blockHeightFactor);  
				ctx.lineTo(wx + blockWidthFactor, wy - (blockHeightFactor + windowHeight)); 
				ctx.lineTo(wx, wy - windowHeight);
				ctx.lineTo(wx, wy); 
				ctx.fill();
			}
		}
	}				

	addBuilding = (x, y) => {	
		let building = new Building(x, y);		
		building.height = getRandomInt(MINIMUM_HEIGHT, MAXIMUM_HEIGHT);
		building.rows = getRandomInt(1, Math.floor(building.height / 20)); 
		building.cols = getRandomInt(1, 5);		
		building.margin = getRandomInt(0, 15);
		building.buildingSideAWidth = getRandomInt(40, 60);
		building.CWHue = CWHues[(Math.floor(Math.random() * CWHues.length))];
		building.CWLight= getRandomInt(10,50);
		building.CWSaturation = getRandomInt(0,100);
		building.hue = getRandomInt(1, 360);
		building.saturation = getRandomInt(0, 100);
		building.light = getRandomInt(20, 80);		

		objects.push(building);
		BUILDINGS_COUNT++; 
	}			
			
	draw = () => {	
		if (BUILDINGS_COUNT > 0)
			for (let i = 0; i < BUILDINGS_COUNT; i++){
				this.drawBuilding(objects[i]);
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

	window.requestAnimationFrame(loop)	

}
