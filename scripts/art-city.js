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
		Interlaced: Symbol("interlaced"),
		MiniWindowCenter: Symbol("miniWindowCenter")
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
			let colorLight = `hsl(${building.hue}, ${building.saturation}%, ${building.light - 20}%)`; 
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
			ctx.fillStyle = colorLight;
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
		//if (building.leftDoor){
			let halfWidthFactor = building.blockWidthFactor / 2;
			let halfHeightFactor = building.blockHeightFactor / 2;
			let doorHeight = 40;
			let doorWidth = 40;
			let doorWidthFactor = Math.cos(angle * RAD_CONST) * (doorWidth);
			let doorHeightFactor = Math.sin(angle * RAD_CONST) * (doorWidth);
			ctx.fillStyle = "#FF0000";			
			ctx.beginPath();
			let wx = building.x - Math.cos(angle * RAD_CONST) * (building.width / 2 - doorWidth / 2);
			let wy = building.y - Math.sin(angle * RAD_CONST) * (building.width / 2 - doorWidth / 2);
			ctx.moveTo(wx, wy); 
			ctx.lineTo(wx, wy - doorHeight);  
			ctx.lineTo(wx - doorWidthFactor - doorWidth, wy - doorHeightFactor - doorHeight); 
			ctx.lineTo(wx, wy - doorHeightFactor); 
			ctx.lineTo(wx, wy); 
			ctx.fill();
		////} else {

		//}
	}

	drawWindows = (ctx, building) => {		
		let colorLight = `hsl(${building.CWHue}, ${building.CWSaturation}%, ${building.CWLight + 20}%)`; 				
		let colorDark = `hsl(${building.CWHue}, ${building.CWSaturation}%, ${building.CWLight}%)`; 
		let colorLighter = `hsl(${building.CWHue}, ${building.CWSaturation}%, ${building.CWLight + 40}%)`;
		let colorDarker = `hsl(${building.CWHue}, ${building.CWSaturation}%, ${building.CWLight - 20}%)`;
		
		building.windowWidth = ((building.buildingSideAWidth - (building.margin * (building.cols + 1))) / building.cols);
		building.windowHeight = ((building.height - FIRST_FLOOR_HEIGHT - (building.margin * (building.rows + 1))) / building.rows);
		building.windowWidthFactor = Math.cos(angle * RAD_CONST) * building.windowWidth;
		building.windowHeightFactor = Math.sin(angle * RAD_CONST) * building.windowWidth;

		for (let ix = 0; ix < building.cols; ix++){
			for (let iy = 0; iy < building.rows; iy++){
				//Left
				ctx.fillStyle = colorLight;
				ctx.beginPath();
				let wx = building.x - (Math.cos(angle * RAD_CONST) * (building.margin + ((building.margin + building.windowWidth) * ix)));
				let wy = building.y - FIRST_FLOOR_HEIGHT - (Math.sin(angle * RAD_CONST) * (building.margin + ((building.margin + building.windowWidth) * ix))) - (building.margin + ((building.margin + building.windowHeight) * iy));
				ctx.moveTo(wx, wy); 
				ctx.lineTo(wx - building.windowWidthFactor, wy - building.windowHeightFactor);  
				ctx.lineTo(wx - building.windowWidthFactor, wy - (building.windowHeightFactor + building.windowHeight)); 
				ctx.lineTo(wx, wy - building.windowHeight); 
				ctx.lineTo(wx, wy); 
				ctx.fill();

				//Right
				ctx.fillStyle = colorDark;
				let wx1 = building.x + (Math.cos(angle * RAD_CONST) * (building.margin + ((building.margin + building.windowWidth) * ix)));
				let wy1 = building.y - FIRST_FLOOR_HEIGHT - (Math.sin(angle * RAD_CONST) * (building.margin + ((building.margin + building.windowWidth) * ix))) - (building.margin + ((building.margin + building.windowHeight) * iy));
				ctx.beginPath();
				ctx.moveTo(wx1, wy1); 
				ctx.lineTo(wx1 + building.windowWidthFactor, wy1 - building.windowHeightFactor);  
				ctx.lineTo(wx1 + building.windowWidthFactor, wy1 - (building.windowHeightFactor + building.windowHeight)); 
				ctx.lineTo(wx1, wy1 - building.windowHeight);
				ctx.lineTo(wx1, wy1); 
				ctx.fill();		

				switch(building.windowType){
					case WindowTypes.MiniWindow:
						drawMiniWindow(ctx, building, wx, wy, wx1, wy1, colorDark, colorLight);
						break;
					case WindowTypes.Split:
						drawSplitWindow(ctx, building, wx, wy, wx1, wy1, colorDark, colorLight);
						break;
					case WindowTypes.Triangular:
						drawTriangularWindow(ctx, building, wx, wy, wx1, wy1, colorDark, colorLight, colorDarker, colorLighter);
						break;
					case WindowTypes.SplitV:
						drawSplitVWindow(ctx, building, wx, wy, wx1, wy1, colorDark, colorLight);
						break;
					case WindowTypes.Interlaced:
						drawInterlacedWindow(ctx, building, wx, wy, wx1, wy1, colorDark, colorLight, colorDarker, colorLighter);
						break;
					case WindowTypes.MiniWindowCenter:
						drawMiniWindowCenter(ctx, building, wx, wy, wx1, wy1, colorDark, colorLight);
						break;
				}
				
				//Draw lights and shadows
				ctx.strokeStyle = colorLighter;
				ctx.beginPath();		
				ctx.moveTo(wx, wy); 
				ctx.lineTo(wx - building.windowWidthFactor, wy - building.windowHeightFactor);	
				ctx.stroke();
				ctx.strokeStyle = colorLight;
				ctx.beginPath();		
				ctx.moveTo(wx1, wy1); 
				ctx.lineTo(wx1 + building.windowWidthFactor, wy1 - building.windowHeightFactor);	
				ctx.stroke();
				ctx.strokeStyle = colorDark;
				ctx.beginPath();		
				ctx.moveTo(wx - building.windowWidthFactor, wy - building.windowHeightFactor); 
				ctx.lineTo(wx - building.windowWidthFactor, wy - building.windowHeightFactor - building.windowHeight);	
				ctx.stroke();
				ctx.strokeStyle = colorDarker;
				ctx.beginPath();		
				ctx.moveTo(wx1 + building.windowWidthFactor, wy1 - building.windowHeightFactor); 
				ctx.lineTo(wx1 + building.windowWidthFactor, wy1 - building.windowHeightFactor - building.windowHeight);	
				ctx.stroke();
				
			}
		}
	}			

	drawMiniWindow = (ctx, building, wx, wy, wx1, wy1, colorDark, colorLight) => {
		let halfWindowHeight = (building.windowHeight / 2);
		let halfWindowWidth = (building.windowWidth / 2);
		let halfWidthFactor = building.windowWidthFactor / 2;
		let halfHeightFactor = building.windowHeightFactor / 2 
		ctx.strokeStyle = colorDark;
		ctx.beginPath();
		ctx.moveTo(wx, wy - halfWindowHeight); 
		ctx.lineTo(wx - halfWidthFactor, wy - halfHeightFactor - halfWindowHeight);					
		ctx.lineTo(wx - halfWidthFactor, wy - halfHeightFactor);  
		ctx.stroke();

		ctx.strokeStyle = colorLight;
		ctx.beginPath();
		ctx.moveTo(wx1 + building.windowWidthFactor, wy1 - building.windowHeightFactor - halfWindowHeight);
		ctx.lineTo(wx1 + halfWidthFactor, wy1 - halfHeightFactor - halfWindowHeight);  
		ctx.lineTo(wx1 + halfWidthFactor, wy1 - halfHeightFactor);  
		ctx.stroke();
	}
	
	drawSplitWindow = (ctx, building, wx, wy, wx1, wy1, colorDark, colorLight) => {
		let halfWindowHeight = (building.windowHeight / 2);
		ctx.strokeStyle = colorDark;
		ctx.beginPath();
		ctx.moveTo(wx, wy - halfWindowHeight); 
		ctx.lineTo(wx - building.windowWidthFactor, wy - building.windowHeightFactor - halfWindowHeight);  				
		ctx.stroke();

		ctx.strokeStyle = colorLight;
		ctx.beginPath();
		ctx.moveTo(wx1, wy1 - halfWindowHeight); 
		ctx.lineTo(wx1 + building.windowWidthFactor, wy1 - building.windowHeightFactor - halfWindowHeight);  
		ctx.stroke();
	}

	drawSplitVWindow = (ctx, building, wx, wy, wx1, wy1, colorDark, colorLight) => {		
		let halfHeightFactor = building.windowHeightFactor / 2 
		let halfWindowWidth = (building.windowWidth / 2);
		ctx.strokeStyle = colorDark;
		ctx.beginPath();
		ctx.moveTo(wx - halfWindowWidth, wy - halfHeightFactor); 
		ctx.lineTo(wx - halfWindowWidth, wy - halfHeightFactor - building.windowHeight);  				
		ctx.stroke();

		ctx.strokeStyle = colorLight;
		ctx.beginPath();
		ctx.moveTo(wx1 + halfWindowWidth, wy1 - halfHeightFactor); 
		ctx.lineTo(wx1 + halfWindowWidth, wy1 - halfHeightFactor - building.windowHeight);  
		ctx.stroke();
	}
	
	drawInterlacedWindow = (ctx, building, wx, wy, wx1, wy1, colorDark, colorLight, colorDarker, colorLighter) => {		
		let thirdHeightFactor = building.windowHeightFactor / 3;
		let thirdWidthFactor = building.windowWidthFactor / 3;
		let thirdWindowWidth = (building.windowWidth / 3);
		let thirdWindowHeight = (building.windowHeight / 3);

		ctx.fillStyle = colorDark;
		ctx.beginPath();
		ctx.moveTo(wx - thirdWidthFactor, wy - thirdHeightFactor); 
		ctx.lineTo(wx - thirdWidthFactor, wy - thirdHeightFactor - thirdWindowHeight);		
		ctx.lineTo(wx - thirdWidthFactor * 2, wy - thirdHeightFactor * 2 - thirdWindowHeight); 			
		ctx.lineTo(wx - thirdWidthFactor * 2, wy - thirdHeightFactor * 2); 					
		ctx.lineTo(wx - thirdWidthFactor, wy - thirdHeightFactor);		
		ctx.fill();

		ctx.fillStyle = colorDark;
		ctx.beginPath();
		ctx.moveTo(wx - thirdWidthFactor, wy - thirdHeightFactor - thirdWindowHeight * 2); 
		ctx.lineTo(wx - thirdWidthFactor, wy - thirdHeightFactor - thirdWindowHeight * 3);		
		ctx.lineTo(wx - thirdWidthFactor * 2, wy - thirdHeightFactor * 2 - thirdWindowHeight * 3); 			
		ctx.lineTo(wx - thirdWidthFactor * 2, wy - thirdHeightFactor * 2 - thirdWindowHeight * 2); 					
		ctx.lineTo(wx - thirdWidthFactor,  wy - thirdHeightFactor - thirdWindowHeight * 2);		
		ctx.fill();
		
		ctx.fillStyle = colorDarker;
		ctx.beginPath();
		ctx.moveTo(wx1 + thirdWidthFactor, wy1 - thirdHeightFactor); 
		ctx.lineTo(wx1 + thirdWidthFactor, wy1 - thirdHeightFactor - thirdWindowHeight);		
		ctx.lineTo(wx1 + thirdWidthFactor * 2, wy1 - thirdHeightFactor * 2 - thirdWindowHeight); 			
		ctx.lineTo(wx1 + thirdWidthFactor * 2, wy1 - thirdHeightFactor * 2); 					
		ctx.lineTo(wx1 + thirdWidthFactor, wy1 - thirdHeightFactor);		
		ctx.fill();

		ctx.fillStyle = colorDarker;
		ctx.beginPath();
		ctx.moveTo(wx1 + thirdWidthFactor, wy1 - thirdHeightFactor - thirdWindowHeight * 2); 
		ctx.lineTo(wx1 + thirdWidthFactor, wy1 - thirdHeightFactor - thirdWindowHeight * 3);		
		ctx.lineTo(wx1 + thirdWidthFactor * 2, wy1 - thirdHeightFactor * 2 - thirdWindowHeight * 3); 			
		ctx.lineTo(wx1 + thirdWidthFactor * 2, wy1 - thirdHeightFactor * 2 - thirdWindowHeight * 2); 					
		ctx.lineTo(wx1 + thirdWidthFactor,  wy1 - thirdHeightFactor - thirdWindowHeight * 2);		
		ctx.fill();
	}
	
	drawMiniWindowCenter = (ctx, building, wx, wy, wx1, wy1, colorDark, colorLight, colorDarker, colorLighter) => {		
		let thirdHeightFactor = building.windowHeightFactor / 3;
		let thirdWidthFactor = building.windowWidthFactor / 3;
		let thirdWindowWidth = (building.windowWidth / 3);
		let thirdWindowHeight = (building.windowHeight / 3);

		ctx.strokeStyle = colorDark;
		ctx.beginPath();
		ctx.moveTo(wx - thirdWidthFactor, wy - thirdHeightFactor - thirdWindowHeight); 
		ctx.lineTo(wx - thirdWidthFactor, wy - thirdHeightFactor - thirdWindowHeight * 2);		
		ctx.lineTo(wx - thirdWidthFactor * 2, wy - thirdHeightFactor * 2 - thirdWindowHeight * 2); 			
		ctx.lineTo(wx - thirdWidthFactor * 2, wy - thirdHeightFactor * 2 - thirdWindowHeight); 					
		ctx.lineTo(wx - thirdWidthFactor, wy - thirdHeightFactor - thirdWindowHeight);		
		ctx.stroke();	
		
		ctx.strokeStyle = colorLight;
		ctx.beginPath();
		ctx.moveTo(wx1 + thirdWidthFactor, wy1 - thirdHeightFactor - thirdWindowHeight); 
		ctx.lineTo(wx1 + thirdWidthFactor, wy1 - thirdHeightFactor - thirdWindowHeight * 2);		
		ctx.lineTo(wx1 + thirdWidthFactor * 2, wy1 - thirdHeightFactor * 2 - thirdWindowHeight * 2); 			
		ctx.lineTo(wx1 + thirdWidthFactor * 2, wy1 - thirdHeightFactor * 2 - thirdWindowHeight); 					
		ctx.lineTo(wx1 + thirdWidthFactor, wy1 - thirdHeightFactor - thirdWindowHeight);		
		ctx.stroke();

	}

	drawTriangularWindow = (ctx, building, wx, wy, wx1, wy1, colorDark, colorLight, colorDarker, colorLighter) => {
		ctx.fillStyle = colorLighter;
		ctx.beginPath();
		ctx.moveTo(wx, wy - building.windowHeight);				
		ctx.lineTo(wx -  building.windowWidthFactor, wy - building.windowHeight - building.windowHeightFactor); 
		ctx.lineTo(wx -  building.windowWidthFactor, wy - building.windowHeightFactor); 		
		ctx.fill();

		ctx.fillStyle = colorDarker;
		ctx.beginPath();		
		ctx.moveTo(wx1, wy1); 
		ctx.lineTo(wx1 + building.windowWidthFactor, wy1 - building.windowHeightFactor);		
		ctx.lineTo(wx1 + building.windowWidthFactor, wy1 - building.windowHeightFactor - building.windowHeight); 		
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
