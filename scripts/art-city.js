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
	let FIRST_FLOOR_HEIGHT = 20;

	let lastRender = 0

	let objects = [];

	const CWHues = [232, 203, 189, 173, 162];
	
	const WindowTypes = Object.freeze({
		Regular: Symbol("regular"),
		Split: Symbol("split"),		
		SplitV: Symbol("splitV"),
		MiniWindow: Symbol("miniWindow"),
		Triangular: Symbol("triangular"),
		Interlaced: Symbol("interlaced")
	});

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

	getRandomBool = () => {
		return Math.random() < 0.5;
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
	
			building.blockWidthFactor = Math.cos(angle * RAD_CONST) * building.buildingSideAWidth;
			building.blockHeightFactor = Math.sin(angle * RAD_CONST) * building.buildingSideAWidth;

			//Left Face			
			ctx.fillStyle = color;
			ctx.beginPath();
			ctx.moveTo(building.x, building.y); 
			ctx.lineTo(building.x - building.blockWidthFactor, building.y - building.blockHeightFactor);  
			ctx.lineTo(building.x - building.blockWidthFactor, building.y - (building.blockHeightFactor + building.height)); 
			ctx.lineTo(building.x, building.y - building.height); 
			ctx.lineTo(building.x, building.y); 
			ctx.fill();		

			//Right Face			
			ctx.fillStyle = color2;
			ctx.beginPath();
			ctx.moveTo(building.x, building.y); 
			ctx.lineTo(building.x + building.blockWidthFactor, building.y - building.blockHeightFactor);  
			ctx.lineTo(building.x + building.blockWidthFactor, building.y - (building.blockHeightFactor + building.height)); 
			ctx.lineTo(building.x, building.y - building.height);
			ctx.lineTo(building.x, building.y); 
			ctx.fill();
			
			//Top Face
			ctx.fillStyle = color3;
			ctx.beginPath();
			ctx.moveTo(building.x, building.y - building.height);
			ctx.lineTo(building.x - building.blockWidthFactor, building.y - (building.blockHeightFactor + building.height));  
			ctx.lineTo(building.x, building.y -  ((building.blockHeightFactor * 2) + building.height)); 
			ctx.lineTo(building.x + building.blockWidthFactor, building.y - (building.blockHeightFactor + building.height)); 
			ctx.lineTo(building.x, building.y - building.height); 
			ctx.fill();			

			drawWindows(ctx, building);
			drawDoor(ctx, building);
		}
	}

	drawDoor = (ctx, building) => {
		if (building.leftDoor){
			let halfBuildingFactor = building.blockWidthFactor / 2;
			let doorHeight = 20;
			let doorWidth = 20;
			let doorWidthFactor = Math.cos(angle * RAD_CONST) * (doorWidth);
			let doorHeightFactor = (Math.sin(angle * RAD_CONST) * (doorWidth)) - (doorHeight);

			ctx.fillStyle = "#FF0000";			
			ctx.beginPath();
			let wx = building.x - Math.cos(angle * RAD_CONST) * (building.width / 2 - doorWidth / 2);
			let wy = building.y - Math.sin(angle * RAD_CONST) * (building.width / 2 - doorWidth / 2);
			ctx.moveTo(wx, wy); 
			ctx.lineTo(wx - doorWidthFactor, wy - doorHeightFactor);  
			ctx.lineTo(wx - doorWidthFactor, wy - (doorHeightFactor + doorHeight)); 
			ctx.lineTo(wx, wy - doorHeight); 
			ctx.lineTo(wx, wy); 
			ctx.fill();
		} else {

		}
	}

	drawWindows = (ctx, building) => {		
		let colorLight = `hsl(${building.CWHue}, ${building.CWSaturation}%, ${building.CWLight + 20}%)`; 				
		let colorDark = `hsl(${building.CWHue}, ${building.CWSaturation}%, ${building.CWLight}%)`; 
		
		let windowWidth = ((building.buildingSideAWidth - (building.margin * (building.cols + 1))) / building.cols);
		let windowHeight = ((building.height - FIRST_FLOOR_HEIGHT - (building.margin * (building.rows + 1))) / building.rows);
		building.windowWidthFactor = Math.cos(angle * RAD_CONST) * windowWidth;
		building.windowHeightFactor = Math.sin(angle * RAD_CONST) * windowWidth;

		for (let ix = 0; ix < building.cols; ix++){
			for (let iy = 0; iy < building.rows; iy++){
				//Left
				ctx.fillStyle = colorLight;
				ctx.beginPath();
				let wx = building.x - (Math.cos(angle * RAD_CONST) * (building.margin + ((building.margin + windowWidth) * ix)));
				let wy = building.y - FIRST_FLOOR_HEIGHT - (Math.sin(angle * RAD_CONST) * (building.margin + ((building.margin + windowWidth) * ix))) - (building.margin + ((building.margin + windowHeight) * iy));
				ctx.moveTo(wx, wy); 
				ctx.lineTo(wx - building.windowWidthFactor, wy - building.windowHeightFactor);  
				ctx.lineTo(wx - building.windowWidthFactor, wy - (building.windowHeightFactor + windowHeight)); 
				ctx.lineTo(wx, wy - windowHeight); 
				ctx.lineTo(wx, wy); 
				ctx.fill();

				//Right
				ctx.fillStyle = colorDark;
				let wx1 = building.x + (Math.cos(angle * RAD_CONST) * (building.margin + ((building.margin + windowWidth) * ix)));
				let wy1 = building.y - FIRST_FLOOR_HEIGHT - (Math.sin(angle * RAD_CONST) * (building.margin + ((building.margin + windowWidth) * ix))) - (building.margin + ((building.margin + windowHeight) * iy));
				ctx.beginPath();
				ctx.moveTo(wx1, wy1); 
				ctx.lineTo(wx1 + building.windowWidthFactor, wy1 - building.windowHeightFactor);  
				ctx.lineTo(wx1 + building.windowWidthFactor, wy1 - (building.windowHeightFactor + windowHeight)); 
				ctx.lineTo(wx1, wy1 - windowHeight);
				ctx.lineTo(wx1, wy1); 
				ctx.fill();		

				switch(building.windowType){
					case WindowTypes.MiniWindow:
						drawMiniWindow(ctx, building, wx, wy, wx1, wy1, windowHeight, windowWidth, colorDark, colorLight);
						break;
					case WindowTypes.Split:
						drawSplitWindow(ctx, building, wx, wy, wx1, wy1, windowHeight, colorDark, colorLight);
						break;
					case WindowTypes.Triangular:
						drawTriangularWindow(ctx, building, wx, wy, wx1, wy1, windowHeight, windowWidth, colorDark, colorLight);
						break;
					case WindowTypes.SplitV:
						drawSpliVtWindow(ctx, building, wx, wy, wx1, wy1, windowHeight, colorDark, colorLight);
						break;
					case WindowTypes.Interlaced:
						drawTriangularWindow(ctx, building, wx, wy, wx1, wy1, windowHeight, windowWidth, colorDark, colorLight);
						break;
				}
				
				ctx.strokeStyle = colorDark;
				ctx.beginPath();		
				ctx.moveTo(wx, wy); 
				ctx.lineTo(wx - building.windowWidthFactor, wy - building.windowHeightFactor);	
				ctx.stroke();
				ctx.strokeStyle = colorLight;
				ctx.beginPath();		
				ctx.moveTo(wx1, wy1); 
				ctx.lineTo(wx1 + building.windowWidthFactor, wy1 - building.windowHeightFactor);	
				ctx.stroke();
				
			}
		}
	}			

	drawMiniWindow = (ctx, building, wx, wy, wx1, wy1, windowHeight, windowWidth, color1, color2) => {
		let halfWindowHeight = (windowHeight / 2);
		let halfWindowWidth = (windowWidth / 2);
		let halfWidthFactor = building.windowWidthFactor / 2;
		let halfHeightFactor = building.windowHeightFactor / 2 
		ctx.strokeStyle = color1;
		ctx.beginPath();
		ctx.moveTo(wx, wy - halfWindowHeight); 
		ctx.lineTo(wx - halfWidthFactor, wy - halfHeightFactor - halfWindowHeight);					
		ctx.lineTo(wx - halfWidthFactor, wy - halfHeightFactor);  
		ctx.stroke();

		ctx.strokeStyle = color2;
		ctx.beginPath();
		ctx.moveTo(wx1 + building.windowWidthFactor, wy1 - building.windowHeightFactor - halfWindowHeight);
		ctx.lineTo(wx1 + halfWidthFactor, wy1 - halfHeightFactor - halfWindowHeight);  
		ctx.lineTo(wx1 + halfWidthFactor, wy1 - halfHeightFactor);  
		ctx.stroke();
	}
	
	drawSplitWindow = (ctx, building, wx, wy, wx1, wy1, windowHeight, color1, color2) => {
		let halfWindowHeight = (windowHeight / 2);
		ctx.strokeStyle = color1;
		ctx.beginPath();
		ctx.moveTo(wx, wy - halfWindowHeight); 
		ctx.lineTo(wx - building.windowWidthFactor, wy - building.windowHeightFactor - halfWindowHeight);  				
		ctx.stroke();

		ctx.strokeStyle = color2;
		ctx.beginPath();
		ctx.moveTo(wx1, wy1 - halfWindowHeight); 
		ctx.lineTo(wx1 + building.windowWidthFactor, wy1 - building.windowHeightFactor - halfWindowHeight);  
		ctx.stroke();
	}

	drawTriangularWindow = (ctx, building, wx, wy, wx1, wy1, windowHeight, windowWidth, color1, color2) => {
		ctx.fillStyle = color1;
		ctx.beginPath();
		ctx.moveTo(wx, wy); 			
		ctx.lineTo(wx, wy - windowHeight);  
		ctx.lineTo(wx - building.windowWidthFactor, wy - building.windowHeightFactor);  			
		ctx.lineTo(wx, wy); 		
		ctx.fill();

		ctx.fillStyle = color2;
		ctx.beginPath();		
		ctx.moveTo(wx1, wy1); 
		ctx.lineTo(wx1 + building.windowWidthFactor, wy1 - building.windowHeightFactor);		
		ctx.lineTo(wx1 + building.windowWidthFactor, wy1 - building.windowHeightFactor - windowHeight); 		
		ctx.lineTo(wx1, wy1); 
		ctx.fill();
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
		building.leftDoor = getRandomBool();
		
		var rand = getRandomInt(0, Object.keys(WindowTypes).length);
		building.windowType = WindowTypes[Object.keys(WindowTypes)[rand]];

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
