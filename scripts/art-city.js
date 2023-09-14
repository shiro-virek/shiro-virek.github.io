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
			this.modules = [];
		}		

		calculateProps = () => {				
			this.windowWidth = ((this.width - (this.margin * (this.cols + 1))) / this.cols);
			this.windowHeight = ((this.height -  this.firstFloorHeight - (this.margin * (this.rows + 1))) / this.rows);
			this.windowWidthFactor = Math.cos(angle * RAD_CONST) * this.windowWidth;
			this.windowHeightFactor = Math.sin(angle * RAD_CONST) * this.windowWidth;
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

	function getRandomFloat(min, max, decimals) {
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
			drawModule(ctx, building, true);
		
			if (building.modules.length > 1){				
				building.modules.forEach((module) => drawModule(ctx, module, false));
			}
		}
	}

	drawModule = (ctx, building, firstModule) => {
		let color = `hsl(${building.hue}, ${building.saturation}%, ${building.light}%)`; 
		let colorLight = `hsl(${building.hue}, ${building.saturation}%, ${building.light - 20}%)`; 
		let color3 = `hsl(${building.hue}, ${building.saturation}%, ${building.light + 20}%)`; 

		building.widthFactor = Math.cos(angle * RAD_CONST) * building.width;
		building.heightFactor = Math.sin(angle * RAD_CONST) * building.width;

		//Left Face			
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.moveTo(building.x, building.y); 
		ctx.lineTo(building.x - building.widthFactor, building.y - building.heightFactor);  
		ctx.lineTo(building.x - building.widthFactor, building.y - (building.heightFactor + building.height)); 
		ctx.lineTo(building.x, building.y - building.height); 
		ctx.lineTo(building.x, building.y); 
		ctx.fill();		

		//Right Face			
		ctx.fillStyle = colorLight;
		ctx.beginPath();
		ctx.moveTo(building.x, building.y); 
		ctx.lineTo(building.x + building.widthFactor, building.y - building.heightFactor);  
		ctx.lineTo(building.x + building.widthFactor, building.y - (building.heightFactor + building.height)); 
		ctx.lineTo(building.x, building.y - building.height);
		ctx.lineTo(building.x, building.y); 
		ctx.fill();
		
		//Top Face
		ctx.fillStyle = color3;
		ctx.beginPath();
		ctx.moveTo(building.x, building.y - building.height);
		ctx.lineTo(building.x - building.widthFactor, building.y - (building.heightFactor + building.height));  
		ctx.lineTo(building.x, building.y -  ((building.heightFactor * 2) + building.height)); 
		ctx.lineTo(building.x + building.widthFactor, building.y - (building.heightFactor + building.height)); 
		ctx.lineTo(building.x, building.y - building.height); 
		ctx.fill();			

		drawWindows(ctx, building);
		
		if (firstModule) drawDoor(ctx, building);		
	}

	drawDoor = (ctx, building) => {
		let halfWidthFactor = building.widthFactor / 2;
		let halfHeightFactor = building.heightFactor / 2;
		let doorHeight = 10;
		let doorWidth = 10;
		let doorWidthFactor = Math.cos(angle * RAD_CONST) * (doorWidth);
		let doorHeightFactor = Math.sin(angle * RAD_CONST) * (doorHeight);

		ctx.fillStyle = `hsl(${building.hue}, ${building.saturation}%, ${building.light - 40}%)`; 
		ctx.beginPath();
		let wx = building.x - Math.cos(angle * RAD_CONST) * (building.width / 2 - doorWidth / 2);
		let wy = building.y - Math.sin(angle * RAD_CONST) * (building.width / 2 - doorWidth / 2);
		ctx.moveTo(wx, wy); 
		ctx.lineTo(wx, wy - doorHeight);  
		ctx.lineTo(wx - doorWidthFactor, wy - doorHeightFactor - doorHeight); 
		ctx.lineTo(wx - doorWidthFactor, wy - doorHeightFactor); 
		ctx.lineTo(wx, wy); 
		ctx.fill();

		ctx.fillStyle = `hsl(${building.hue}, ${building.saturation}%, ${building.light - 60}%)`; 
		ctx.beginPath();
		let wx1 = building.x + Math.cos(angle * RAD_CONST) * (building.width / 2 - doorWidth / 2);
		ctx.moveTo(wx1, wy); 
		ctx.lineTo(wx1, wy - doorHeight);  
		ctx.lineTo(wx1 + doorWidthFactor, wy - doorHeightFactor - doorHeight); 
		ctx.lineTo(wx1 + doorWidthFactor, wy - doorHeightFactor); 
		ctx.lineTo(wx1, wy); 
		ctx.fill();
	}

	drawWindows = (ctx, building) => {		
		let colorLight = `hsl(${building.CWHue}, ${building.CWSaturation}%, ${building.CWLight + 20}%)`; 				
		let colorDark = `hsl(${building.CWHue}, ${building.CWSaturation}%, ${building.CWLight}%)`; 
		let colorLighter = `hsl(${building.CWHue}, ${building.CWSaturation}%, ${building.CWLight + 40}%)`;
		let colorDarker = `hsl(${building.CWHue}, ${building.CWSaturation}%, ${building.CWLight - 20}%)`;
		
		for (let ix = 0; ix < building.cols; ix++){
			for (let iy = 0; iy < building.rows; iy++){
				//Left
				ctx.fillStyle = colorLight;
				ctx.beginPath();
				let wx = building.x - (Math.cos(angle * RAD_CONST) * (building.margin + ((building.margin + building.windowWidth) * ix)));
				let wy = building.y - building.firstFloorHeight - (Math.sin(angle * RAD_CONST) * (building.margin + ((building.margin + building.windowWidth) * ix))) - (building.margin + ((building.margin + building.windowHeight) * iy));
				ctx.moveTo(wx, wy); 
				ctx.lineTo(wx - building.windowWidthFactor, wy - building.windowHeightFactor);  
				ctx.lineTo(wx - building.windowWidthFactor, wy - (building.windowHeightFactor + building.windowHeight)); 
				ctx.lineTo(wx, wy - building.windowHeight); 
				ctx.lineTo(wx, wy); 
				ctx.fill();

				//Right
				ctx.fillStyle = colorDark;
				let wx1 = building.x + (Math.cos(angle * RAD_CONST) * (building.margin + ((building.margin + building.windowWidth) * ix)));
				let wy1 = building.y -  building.firstFloorHeight - (Math.sin(angle * RAD_CONST) * (building.margin + ((building.margin + building.windowWidth) * ix))) - (building.margin + ((building.margin + building.windowHeight) * iy));
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

	getRowsNumber = (building) => {
		return getRandomInt(1, Math.floor(building.height / 20)); 
	}

	getNumberOfModules = () => {
		let dice = getRandomInt(1, 6);

		if (dice > 4)
			return getRandomInt(1, 3);
		else 
			return getRandomInt(1, 10);
	}

	addBuilding = (x, y) => {	
		let building = new Building(x, y);		
		building.height = getRandomInt(MINIMUM_HEIGHT, MAXIMUM_HEIGHT);
		building.rows = getRowsNumber(building);
		building.cols = getRandomInt(1, 5);		
		building.margin = getRandomInt(0, 15);
		building.width = getRandomInt(40, 60);
		building.CWHue = CWHues[(Math.floor(Math.random() * CWHues.length))];
		building.CWLight= getRandomInt(10,50);
		building.CWSaturation = getRandomInt(0,100);
		building.hue = getRandomInt(1, 360);
		building.saturation = getRandomInt(0, 100);
		building.light = getRandomInt(20, 80);	
		building.firstFloorHeight = FIRST_FLOOR_HEIGHT;

		building.calculateProps();
				
		var rand = getRandomInt(0, Object.keys(WindowTypes).length);
		building.windowType = WindowTypes[Object.keys(WindowTypes)[rand]];
		
		let numberOfModules = getNumberOfModules(); 

		let lastModule = building;
	
		if (numberOfModules > 1){
			
			for (let i=1; i <= numberOfModules; i++){				
				let widthDecrement = lastModule.width * getRandomFloat(0.05, 0.3, 2); 							
				
				let newModule = new Building(lastModule.x, lastModule.y - lastModule.height - widthDecrement / 3);

				let heightDecrement = lastModule.height * getRandomFloat(0, 0.7, 2); 
				newModule.width = lastModule.width - widthDecrement;
				newModule.height = lastModule.height - heightDecrement;
				newModule.firstFloorHeight = 0;
				 
				if (newModule.height >= 20)
					newModule.rows = lastModule.rows > 1 ? lastModule.rows - 1 : 1;
				else 
					newModule.rows = 0;

				if (newModule.width >= 20)
					newModule.cols = lastModule.cols > 1 ? lastModule.cols - 1 : 1; 		
				else
					newModule.cols = 0;

				newModule.windowType = lastModule.windowType;
				newModule.margin = building.margin;
				newModule.CWHue = building.CWHue;
				newModule.CWLight = building.CWLight;
				newModule.CWSaturation = building.CWSaturation;
				newModule.hue = building.hue;
				newModule.saturation = building.saturation;
				newModule.light = building.light;		

				newModule.calculateProps();
				
				building.modules.push(newModule);

				lastModule = newModule;
			}
			
		}

		objects.push(building);
		BUILDINGS_COUNT++; 
	}			
			
	draw = () => {	
		drawFrame();

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
