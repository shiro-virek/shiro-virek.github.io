{
    const globals = {
		random: null,
		city: null
    };

	const config = {
		minimumHeight: 40,
		maximumHeight: 360,
		firstFloorHeight: 20,
		CWHues: [232, 203, 189, 173, 162],
		HeliportColors: ["#FF0000", "#FFFFFF", "#000000"],
		minimumDistanceBetweenBuildings: 60,
	}

	const WindowTypes = Object.freeze({
		Regular: Symbol("regular"),
		Split: Symbol("split"),
		SplitV: Symbol("splitV"),
		MiniWindow: Symbol("miniWindow"),
		Triangular: Symbol("triangular"),
		Interlaced: Symbol("interlaced"),
		MiniWindowCenter: Symbol("miniWindowCenter")
	});

	const TopTypes = Object.freeze({
		None: Symbol("none"),
		Pinnacle: Symbol("pinnacle"),
		Heliport: Symbol("heliport")
	});

	class City {
		constructor(){
			this.buildings = [];
			this.buildingsCount = 0;
		}

		generateCity = () => {
			let distance = config.minimumDistanceBetweenBuildings * 1.3
			let buildingCols = Math.floor(width / distance) + 1;
			let buildingRows = Math.floor(height / distance) + 1;
			for (let x=0; x < buildingCols; x++) {
				let tilt = 0;
				for (let y=0; y < buildingRows; y++) {
					this.addBuilding(x * distance, y * distance + tilt);
					tilt += 30;
				}
			}
		}

		isTooCloseToOtherBuilding = (x, y) => {
			let result = true;
			this.buildings.forEach(building => {     
				if (Trigonometry.distanceBetweenTwoPoints(building.x, building.y, x, y) < config.minimumDistanceBetweenBuildings)
					result = false;
			});
			return result;
		}

		addBuilding = (x, y) => {
			if (this.isTooCloseToOtherBuilding(x, y)) {
				let building = new Building(x, y, 0, y);
				building.randomize();
				this.buildings.push(building);
				this.buildingsCount++;
				Sound.ping(100);
			}else{
				Sound.error();
			}
		}

		draw = () => {
			if (this.buildingsCount > 0){
				this.buildings.sort((a, b) => {
					if (isNaN(a.z) || isNaN(b.z)) {
						return 0; 
					}
					return a.z - b.z;
				});	

				this.buildings.forEach(building => {          
					building.drawBuilding(ctx);     
				});
			}				
		}

		randomize = () => {
			globals.random = Objects.getRandomObject();
			this.angle = globals.random.nextInt(0, 40);
		}
	}

	class Building {
		constructor(x, y, moduleNumber = 0, z) {
			this.x = x;
			this.y = y;
			this.z = z;
			this.moduleNumber = moduleNumber;
			this.modules = [];
		}

		randomize = () => {
			this.height = globals.random.nextInt(config.minimumHeight, config.maximumHeight);
			this.windowRows = this.randomizeRowsNumber();
			this.windowCols = globals.random.nextInt(1, 5);
			this.margin = globals.random.nextInt(0, 15);
			this.width = globals.random.nextInt(40, 60);
			this.CWHue = config.CWHues[globals.random.nextInt(0, config.CWHues.length - 1)];
			this.CWLight = globals.random.nextInt(10, 50);
			this.CWSaturation = globals.random.nextInt(0, 100);
			this.hue = globals.random.nextInt(1, 360);
			this.saturation = globals.random.nextInt(0, 50);
			this.light = globals.random.nextInt(20, 80);
			this.firstFloorHeight = config.firstFloorHeight;
			this.horizontalLines = globals.random.nextInt(0, 3);
			
			this.calculateProps();

			var rand = globals.random.nextInt(0, Object.keys(WindowTypes).length - 1);
			this.windowType = WindowTypes[Object.keys(WindowTypes)[rand]];

			this.randomizeExtraModules();

			if (this.numberOfModules == 1)
				this.randomizeTop();
		}

		randomizeTop = () => {
			var rand = globals.random.nextInt(0, Object.keys(TopTypes).length - 1);
			this.topType = TopTypes[Object.keys(TopTypes)[rand]];

			switch (this.topType) {
				case TopTypes.Pinnacle:
					this.pinnacle = new Pinnacle(globals.random.nextInt(2, this.width / 2), globals.random.nextInt(5, this.width * 2));
					break;
				case TopTypes.Heliport:
					let heliportColor = config.HeliportColors[globals.random.nextInt(0, config.HeliportColors.length - 1)];
					this.heliport = new Heliport(20, heliportColor);
					break;				
			}
		}

		getAngleDecrement = (widthDecrement) => {
			if (globals.city.angle <= 3) return 0;
			if (globals.city.angle > 3 && globals.city.angle < 20)
				return widthDecrement / 4;
			else
				return widthDecrement / 2;
		}

		randomizeExtraModules = () => {
			this.numberOfModules = this.randomizenumberOfModules();
			let lastModule = this;

			if (this.numberOfModules > 1) {
				for (let i = 1; i <= this.numberOfModules; i++) {
					let widthDecrement = lastModule.width * globals.random.nextRange(0.05, 0.3, 2);

					let newModule = new Building(lastModule.x, lastModule.y - lastModule.height - this.getAngleDecrement(widthDecrement), i, lastModule.z);
					newModule.numberOfModules = this.numberOfModules;

					let heightDecrement = lastModule.height * globals.random.nextRange(0, 0.7, 2);
					newModule.width = lastModule.width - widthDecrement;
					newModule.height = lastModule.height - heightDecrement;
					newModule.firstFloorHeight = 0;

					if (newModule.height >= 20)
						newModule.windowRows = lastModule.windowRows > 1 ? lastModule.windowRows - 1 : 1;
					else
						newModule.windowRows = 0;

					if (newModule.width >= 20)
						newModule.windowCols = lastModule.windowCols > 1 ? lastModule.windowCols - 1 : 1;
					else
						newModule.windowCols = 0;

					newModule.windowType = lastModule.windowType;
					newModule.margin = lastModule.margin;
					newModule.CWHue = lastModule.CWHue;
					newModule.CWLight = lastModule.CWLight;
					newModule.CWSaturation = lastModule.CWSaturation;
					newModule.hue = lastModule.hue;
					newModule.saturation = lastModule.saturation;
					newModule.light = lastModule.light;

					newModule.calculateProps();

					if (newModule.moduleNumber  == newModule.numberOfModules){
						newModule.randomizeTop();
					}

					this.modules.push(newModule);

					lastModule = newModule;
				}
			}
		}

		calculateProps = () => {
			this.windowWidth = ((this.width - (this.margin * (this.windowCols + 1))) / this.windowCols);
			this.windowHeight = ((this.height - this.firstFloorHeight - (this.margin * (this.windowRows + 1))) / this.windowRows);
			this.windowWidthFactor = Math.cos(globals.city.angle * Trigonometry.RAD_CONST) * this.windowWidth;
			this.windowHeightFactor = Math.sin(globals.city.angle * Trigonometry.RAD_CONST) * this.windowWidth;
		}

		drawBuilding = (ctx) => {
			this.drawModule(ctx, true);

			if (this.numberOfModules > 1) {
				this.modules.forEach((module) => module.drawModule(ctx, false));
			}
		}

		drawModule = (ctx, firstModule) => {
			this.widthFactor = Math.cos(globals.city.angle * Trigonometry.RAD_CONST) * this.width;
			this.heightFactor = Math.sin(globals.city.angle * Trigonometry.RAD_CONST) * this.width;

			this.drawLeftFace(ctx);
			this.drawRightFace(ctx);
			this.drawTopFace(ctx);
			this.drawLights(ctx);

			this.drawWindows(ctx);
			
			if (firstModule) this.drawDoor(ctx);
			
			if (this.pinnacle){
				let pinnacleWidthFactor = Math.sin(globals.city.angle * Trigonometry.RAD_CONST) * (this.pinnacle.width / 2);

				ctx.fillStyle = this.colorDark();
				ctx.beginPath();
				ctx.moveTo(this.x, this.y - this.height - this.heightFactor + pinnacleWidthFactor);
				ctx.lineTo(this.x - this.pinnacle.width / 2, this.y - this.height - this.heightFactor);
				ctx.lineTo(this.x, this.y - this.height - this.heightFactor - this.pinnacle.height);				
				ctx.lineTo(this.x, this.y - this.height - this.heightFactor + pinnacleWidthFactor);
				ctx.fill();

				ctx.fillStyle = this.colorDarker();
				ctx.beginPath();
				ctx.moveTo(this.x, this.y - this.height - this.heightFactor + pinnacleWidthFactor);
				ctx.lineTo(this.x + this.pinnacle.width / 2, this.y - this.height - this.heightFactor);
				ctx.lineTo(this.x, this.y - this.height - this.heightFactor - this.pinnacle.height);				
				ctx.lineTo(this.x, this.y - this.height - this.heightFactor + pinnacleWidthFactor);
				ctx.fill();
			}

			if (this.heliport && this.heliport.width < (this.widthFactor / 2 )) {  
				ctx.beginPath();
				ctx.strokeStyle = this.heliport.color;
				ctx.ellipse(this.x, this.y - this.height - this.heightFactor, this.heliport.width / 2, this.heliport.height / 2, Math.PI, 0, 2 * Math.PI);
				ctx.stroke();

				ctx.font = "8px sans-serif";
				ctx.fillStyle = this.heliport.color;
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				ctx.fillText("H", this.x, this.y - this.height - this.heightFactor);
			}
		}

		drawLeftFace = (ctx) => {
			ctx.fillStyle = this.colorBase();
			ctx.beginPath();
			ctx.moveTo(this.x, this.y);
			ctx.lineTo(this.x - this.widthFactor, this.y - this.heightFactor);
			ctx.lineTo(this.x - this.widthFactor, this.y - (this.heightFactor + this.height));
			ctx.lineTo(this.x, this.y - this.height);
			ctx.lineTo(this.x, this.y);
			ctx.fill();
		}

		drawRightFace = (ctx) => {
			ctx.fillStyle = this.colorDark();
			ctx.beginPath();
			ctx.moveTo(this.x, this.y);
			ctx.lineTo(this.x + this.widthFactor, this.y - this.heightFactor);
			ctx.lineTo(this.x + this.widthFactor, this.y - (this.heightFactor + this.height));
			ctx.lineTo(this.x, this.y - this.height);
			ctx.lineTo(this.x, this.y);
			ctx.fill();
		}

		drawTopFace = (ctx) => {
			ctx.fillStyle = this.colorLight();
			ctx.beginPath();
			ctx.moveTo(this.x, this.y - this.height);
			ctx.lineTo(this.x - this.widthFactor, this.y - (this.heightFactor + this.height));
			ctx.lineTo(this.x, this.y - ((this.heightFactor * 2) + this.height));
			ctx.lineTo(this.x + this.widthFactor, this.y - (this.heightFactor + this.height));
			ctx.lineTo(this.x, this.y - this.height);
			ctx.fill();
		}

		drawLights = (ctx) => {
			ctx.strokeStyle = this.colorLight();
			ctx.beginPath();
			ctx.moveTo(this.x, this.y);
			ctx.lineTo(this.x, this.y - this.height);
			ctx.stroke();

			ctx.strokeStyle = this.colorLighter();
			ctx.beginPath();
			ctx.moveTo(this.x, this.y - this.height);
			ctx.lineTo(this.x - this.widthFactor, this.y - (this.heightFactor + this.height));
			ctx.stroke();

			ctx.strokeStyle = this.colorBase();
			ctx.beginPath();
			ctx.moveTo(this.x, this.y - this.height);
			ctx.lineTo(this.x + this.widthFactor, this.y - (this.heightFactor + this.height));
			ctx.stroke();
		}

		drawDoor = (ctx) => {
			let doorHeight = 10;
			let doorWidth = 10;
			let doorWidthFactor = Math.cos(globals.city.angle * Trigonometry.RAD_CONST) * (doorWidth);
			let doorHeightFactor = Math.sin(globals.city.angle * Trigonometry.RAD_CONST) * (doorHeight);

			ctx.fillStyle = this.colorDarker();
			ctx.beginPath();
			let wx = this.x - Math.cos(globals.city.angle * Trigonometry.RAD_CONST) * (this.width / 2 - doorWidth / 2);
			let wy = this.y - Math.sin(globals.city.angle * Trigonometry.RAD_CONST) * (this.width / 2 - doorWidth / 2);
			ctx.moveTo(wx, wy);
			ctx.lineTo(wx, wy - doorHeight);
			ctx.lineTo(wx - doorWidthFactor, wy - doorHeightFactor - doorHeight);
			ctx.lineTo(wx - doorWidthFactor, wy - doorHeightFactor);
			ctx.lineTo(wx, wy);
			ctx.fill();

			ctx.fillStyle = this.colorDarkest();
			ctx.beginPath();
			let wx1 = this.x + Math.cos(globals.city.angle * Trigonometry.RAD_CONST) * (this.width / 2 - doorWidth / 2);
			ctx.moveTo(wx1, wy);
			ctx.lineTo(wx1, wy - doorHeight);
			ctx.lineTo(wx1 + doorWidthFactor, wy - doorHeightFactor - doorHeight);
			ctx.lineTo(wx1 + doorWidthFactor, wy - doorHeightFactor);
			ctx.lineTo(wx1, wy);
			ctx.fill();

			ctx.strokeStyle = this.colorLight();
			ctx.beginPath();
			ctx.moveTo(wx - doorWidthFactor, wy - doorHeightFactor - doorHeight);
			ctx.lineTo(wx - doorWidthFactor, wy - doorHeightFactor);
			ctx.stroke();

			ctx.strokeStyle = this.colorBase();
			ctx.beginPath();
			ctx.moveTo(wx1 + doorWidthFactor, wy - doorHeightFactor - doorHeight);
			ctx.lineTo(wx1 + doorWidthFactor, wy - doorHeightFactor);
			ctx.stroke();
		}

		drawLeftWindow = (ctx, wx, wy) => {
			ctx.fillStyle = this.colorCWLight();
			ctx.beginPath();
			ctx.moveTo(wx, wy);
			ctx.lineTo(wx - this.windowWidthFactor, wy - this.windowHeightFactor);
			ctx.lineTo(wx - this.windowWidthFactor, wy - (this.windowHeightFactor + this.windowHeight));
			ctx.lineTo(wx, wy - this.windowHeight);
			ctx.lineTo(wx, wy);
			ctx.fill();
		}

		drawRightWindow = (ctx, wx, wy) => {
			ctx.fillStyle = this.colorCWBase();
			ctx.beginPath();
			ctx.moveTo(wx, wy);
			ctx.lineTo(wx + this.windowWidthFactor, wy - this.windowHeightFactor);
			ctx.lineTo(wx + this.windowWidthFactor, wy - (this.windowHeightFactor + this.windowHeight));
			ctx.lineTo(wx, wy - this.windowHeight);
			ctx.lineTo(wx, wy);
			ctx.fill();
		}

		drawWindows = (ctx) => {
			for (let ix = 0; ix < this.windowCols; ix++) {
				for (let iy = 0; iy < this.windowRows; iy++) {
					let wx = this.x - (Math.cos(globals.city.angle * Trigonometry.RAD_CONST) * (this.margin + ((this.margin + this.windowWidth) * ix)));
					let wy = this.y - this.firstFloorHeight - (Math.sin(globals.city.angle * Trigonometry.RAD_CONST) * (this.margin + ((this.margin + this.windowWidth) * ix))) - (this.margin + ((this.margin + this.windowHeight) * iy));
					let wx1 = this.x + (Math.cos(globals.city.angle * Trigonometry.RAD_CONST) * (this.margin + ((this.margin + this.windowWidth) * ix)));
					let wy1 = this.y - this.firstFloorHeight - (Math.sin(globals.city.angle * Trigonometry.RAD_CONST) * (this.margin + ((this.margin + this.windowWidth) * ix))) - (this.margin + ((this.margin + this.windowHeight) * iy));

					this.drawLeftWindow(ctx, wx, wy);
					this.drawRightWindow(ctx, wx1, wy1);
					this.drawSpecialWindow(ctx, wx, wy, wx1, wy1);
					this.drawWindowsEdges(ctx, wx, wy, wx1, wy1);
				}
			}
		}

		drawWindowsEdges = (ctx, wx, wy, wx1, wy1) => {
			ctx.strokeStyle = this.colorCWLighter();
			ctx.beginPath();
			ctx.moveTo(wx, wy);
			ctx.lineTo(wx - this.windowWidthFactor, wy - this.windowHeightFactor);
			ctx.stroke();
			ctx.strokeStyle = this.colorCWLight();
			ctx.beginPath();
			ctx.moveTo(wx1, wy1);
			ctx.lineTo(wx1 + this.windowWidthFactor, wy1 - this.windowHeightFactor);
			ctx.stroke();
			ctx.strokeStyle = this.colorCWBase();
			ctx.beginPath();
			ctx.moveTo(wx - this.windowWidthFactor, wy - this.windowHeightFactor);
			ctx.lineTo(wx - this.windowWidthFactor, wy - this.windowHeightFactor - this.windowHeight);
			ctx.stroke();
			ctx.strokeStyle = this.colorCWDark();
			ctx.beginPath();
			ctx.moveTo(wx1 + this.windowWidthFactor, wy1 - this.windowHeightFactor);
			ctx.lineTo(wx1 + this.windowWidthFactor, wy1 - this.windowHeightFactor - this.windowHeight);
			ctx.stroke();
		}

		drawSpecialWindow = (ctx, wx, wy, wx1, wy1) => {
			switch (this.windowType) {
				case WindowTypes.MiniWindow:
					this.drawMiniWindow(ctx, wx, wy, wx1, wy1);
					break;
				case WindowTypes.Split:
					this.drawSplitWindow(ctx, wx, wy, wx1, wy1);
					break;
				case WindowTypes.Triangular:
					this.drawTriangularWindow(ctx, wx, wy, wx1, wy1);
					break;
				case WindowTypes.SplitV:
					this.drawSplitVWindow(ctx, wx, wy, wx1, wy1);
					break;
				case WindowTypes.Interlaced:
					this.drawInterlacedWindow(ctx, wx, wy, wx1, wy1);
					break;
				case WindowTypes.MiniWindowCenter:
					this.drawMiniWindowCenter(ctx, wx, wy, wx1, wy1);
					break;
			}
		}

		drawMiniWindow = (ctx, wx, wy, wx1, wy1) => {
			let halfWindowHeight = (this.windowHeight / 2);
			let halfWindowWidth = (this.windowWidth / 2);
			let halfWidthFactor = Math.cos(globals.city.angle * Trigonometry.RAD_CONST) * halfWindowWidth;
			let halfHeightFactor = Math.sin(globals.city.angle * Trigonometry.RAD_CONST) * halfWindowWidth;

			ctx.strokeStyle = this.colorCWBase();
			ctx.beginPath();
			ctx.moveTo(wx, wy - halfWindowHeight);
			ctx.lineTo(wx - halfWidthFactor, wy - halfHeightFactor - halfWindowHeight);
			ctx.lineTo(wx - halfWidthFactor, wy - halfHeightFactor);
			ctx.stroke();

			ctx.strokeStyle = this.colorCWLight();
			ctx.beginPath();
			ctx.moveTo(wx1 + this.windowWidthFactor, wy1 - this.windowHeightFactor - halfWindowHeight);
			ctx.lineTo(wx1 + halfWidthFactor, wy1 - halfHeightFactor - halfWindowHeight);
			ctx.lineTo(wx1 + halfWidthFactor, wy1 - halfHeightFactor);
			ctx.stroke();
		}

		drawSplitWindow = (ctx, wx, wy, wx1, wy1) => {
			let halfWindowHeight = (this.windowHeight / 2);
			ctx.strokeStyle = this.colorCWBase();
			ctx.beginPath();
			ctx.moveTo(wx, wy - halfWindowHeight);
			ctx.lineTo(wx - this.windowWidthFactor, wy - this.windowHeightFactor - halfWindowHeight);
			ctx.stroke();

			ctx.strokeStyle = this.colorCWLight();
			ctx.beginPath();
			ctx.moveTo(wx1, wy1 - halfWindowHeight);
			ctx.lineTo(wx1 + this.windowWidthFactor, wy1 - this.windowHeightFactor - halfWindowHeight);
			ctx.stroke();
		}

		drawSplitVWindow = (ctx, wx, wy, wx1, wy1) => {
			let halfWindowWidth = (this.windowWidth / 2);
			let halfHeightFactor = Math.sin(globals.city.angle * Trigonometry.RAD_CONST) * halfWindowWidth;
			let halfWidthFactor = Math.cos(globals.city.angle * Trigonometry.RAD_CONST) * halfWindowWidth;
			ctx.strokeStyle = this.colorCWBase();

			ctx.beginPath();
			ctx.moveTo(wx - halfWidthFactor, wy - halfHeightFactor);
			ctx.lineTo(wx - halfWidthFactor, wy - halfHeightFactor - this.windowHeight);
			ctx.stroke();

			ctx.strokeStyle = this.colorCWLight();
			ctx.beginPath();
			ctx.moveTo(wx1 + halfWidthFactor, wy1 - halfHeightFactor);
			ctx.lineTo(wx1 + halfWidthFactor, wy1 - halfHeightFactor - this.windowHeight);
			ctx.stroke();
		}

		drawInterlacedWindow = (ctx, wx, wy, wx1, wy1) => {
			let thirdHeightFactor = Math.sin(globals.city.angle * Trigonometry.RAD_CONST) * (this.windowWidth / 3);
			let thirdWidthFactor = Math.cos(globals.city.angle * Trigonometry.RAD_CONST) * (this.windowWidth / 3);
			let twoThirdsHeightFactor = Math.sin(globals.city.angle * Trigonometry.RAD_CONST) * (this.windowWidth / 3 * 2);
			let twoThirdsWidthFactor = Math.cos(globals.city.angle * Trigonometry.RAD_CONST) * (this.windowWidth / 3 * 2);
			let thirdWindowHeight = (this.windowHeight / 3);

			ctx.fillStyle = this.colorCWBase();
			ctx.beginPath();
			ctx.moveTo(wx - thirdWidthFactor, wy - thirdHeightFactor);
			ctx.lineTo(wx - thirdWidthFactor, wy - thirdHeightFactor - thirdWindowHeight);
			ctx.lineTo(wx - thirdWidthFactor * 2, wy - thirdHeightFactor * 2 - thirdWindowHeight);
			ctx.lineTo(wx - thirdWidthFactor * 2, wy - thirdHeightFactor * 2);
			ctx.lineTo(wx - thirdWidthFactor, wy - thirdHeightFactor);
			ctx.fill();

			ctx.fillStyle = this.colorCWBase();
			ctx.beginPath();
			ctx.moveTo(wx - thirdWidthFactor, wy - thirdHeightFactor - thirdWindowHeight * 2);
			ctx.lineTo(wx - thirdWidthFactor, wy - thirdHeightFactor - thirdWindowHeight * 3);
			ctx.lineTo(wx - twoThirdsWidthFactor, wy - twoThirdsHeightFactor - thirdWindowHeight * 3);
			ctx.lineTo(wx - twoThirdsWidthFactor, wy - twoThirdsHeightFactor - thirdWindowHeight * 2);
			ctx.lineTo(wx - thirdWidthFactor, wy - thirdHeightFactor - thirdWindowHeight * 2);
			ctx.fill();

			ctx.fillStyle = this.colorCWDark();
			ctx.beginPath();
			ctx.moveTo(wx1 + thirdWidthFactor, wy1 - thirdHeightFactor);
			ctx.lineTo(wx1 + thirdWidthFactor, wy1 - thirdHeightFactor - thirdWindowHeight);
			ctx.lineTo(wx1 + twoThirdsWidthFactor, wy1 - twoThirdsHeightFactor - thirdWindowHeight);
			ctx.lineTo(wx1 + twoThirdsWidthFactor, wy1 - twoThirdsHeightFactor);
			ctx.lineTo(wx1 + thirdWidthFactor, wy1 - thirdHeightFactor);
			ctx.fill();

			ctx.fillStyle = this.colorCWDark();
			ctx.beginPath();
			ctx.moveTo(wx1 + thirdWidthFactor, wy1 - thirdHeightFactor - thirdWindowHeight * 2);
			ctx.lineTo(wx1 + thirdWidthFactor, wy1 - thirdHeightFactor - thirdWindowHeight * 3);
			ctx.lineTo(wx1 + twoThirdsWidthFactor, wy1 - twoThirdsHeightFactor - thirdWindowHeight * 3);
			ctx.lineTo(wx1 + twoThirdsWidthFactor, wy1 - twoThirdsHeightFactor - thirdWindowHeight * 2);
			ctx.lineTo(wx1 + thirdWidthFactor, wy1 - thirdHeightFactor - thirdWindowHeight * 2);
			ctx.fill();
		}

		drawMiniWindowCenter = (ctx, wx, wy, wx1, wy1) => {
			let thirdHeightFactor = Math.sin(globals.city.angle * Trigonometry.RAD_CONST) * (this.windowWidth / 3);
			let thirdWidthFactor = Math.cos(globals.city.angle * Trigonometry.RAD_CONST) * (this.windowWidth / 3);
			let twoThirdsHeightFactor = Math.sin(globals.city.angle * Trigonometry.RAD_CONST) * (this.windowWidth / 3 * 2);
			let twoThirdsWidthFactor = Math.cos(globals.city.angle * Trigonometry.RAD_CONST) * (this.windowWidth / 3 * 2);
			let thirdWindowHeight = (this.windowHeight / 3);

			ctx.strokeStyle = this.colorCWBase();
			ctx.beginPath();
			ctx.moveTo(wx - thirdWidthFactor, wy - thirdHeightFactor - thirdWindowHeight);
			ctx.lineTo(wx - thirdWidthFactor, wy - thirdHeightFactor - thirdWindowHeight * 2);
			ctx.lineTo(wx - twoThirdsWidthFactor, wy - twoThirdsHeightFactor - thirdWindowHeight * 2);
			ctx.lineTo(wx - twoThirdsWidthFactor, wy - twoThirdsHeightFactor - thirdWindowHeight);
			ctx.lineTo(wx - thirdWidthFactor, wy - thirdHeightFactor - thirdWindowHeight);
			ctx.stroke();

			ctx.strokeStyle = this.colorCWLight();
			ctx.beginPath();
			ctx.moveTo(wx1 + thirdWidthFactor, wy1 - thirdHeightFactor - thirdWindowHeight);
			ctx.lineTo(wx1 + thirdWidthFactor, wy1 - thirdHeightFactor - thirdWindowHeight * 2);
			ctx.lineTo(wx1 + twoThirdsWidthFactor, wy1 - twoThirdsHeightFactor - thirdWindowHeight * 2);
			ctx.lineTo(wx1 + twoThirdsWidthFactor, wy1 - twoThirdsHeightFactor - thirdWindowHeight);
			ctx.lineTo(wx1 + thirdWidthFactor, wy1 - thirdHeightFactor - thirdWindowHeight);
			ctx.stroke();
		}

		drawTriangularWindow = (ctx, wx, wy, wx1, wy1) => {
			ctx.fillStyle = this.colorCWLighter();
			ctx.beginPath();
			ctx.moveTo(wx, wy - this.windowHeight);
			ctx.lineTo(wx - this.windowWidthFactor, wy - this.windowHeight - this.windowHeightFactor);
			ctx.lineTo(wx - this.windowWidthFactor, wy - this.windowHeightFactor);
			ctx.fill();

			ctx.fillStyle = this.colorCWDark();
			ctx.beginPath();
			ctx.moveTo(wx1, wy1);
			ctx.lineTo(wx1 + this.windowWidthFactor, wy1 - this.windowHeightFactor);
			ctx.lineTo(wx1 + this.windowWidthFactor, wy1 - this.windowHeightFactor - this.windowHeight);
			ctx.lineTo(wx1, wy1);
			ctx.fill();
		}

		randomizeRowsNumber = () => {
			return globals.random.nextInt(1, Math.floor(this.height / 20));
		}

		randomizenumberOfModules = () => {
			let dice = globals.random.nextInt(1, 6);

			if (dice > 4)
				return globals.random.nextInt(1, 3);
			else
				return globals.random.nextInt(1, 10);
		}


		colorBase = () => `hsl(${this.hue}, ${this.saturation}%, ${this.light}%)`;
		colorLight = () => `hsl(${this.hue}, ${this.saturation}%, ${this.light + 20}%)`;
		colorLighter = () => `hsl(${this.hue}, ${this.saturation}%, ${this.light + 40}%)`;
		colorDark = () => `hsl(${this.hue}, ${this.saturation}%, ${this.light - 20}%)`;
		colorDarker = () => `hsl(${this.hue}, ${this.saturation}%, ${this.light - 40}%)`;
		colorDarkest = () => `hsl(${this.hue}, ${this.saturation}%, ${this.light - 60}%)`;

		colorCWBase = () => `hsl(${this.CWHue}, ${this.CWSaturation}%, ${this.CWLight}%)`;
		colorCWLight = () => `hsl(${this.CWHue}, ${this.CWSaturation}%, ${this.CWLight + 20}%)`;
		colorCWLighter = () => `hsl(${this.CWHue}, ${this.CWSaturation}%, ${this.CWLight + 40}%)`;
		colorCWDark = () => `hsl(${this.CWHue}, ${this.CWSaturation}%, ${this.CWLight - 20}%)`;
		colorCWDarker = () => `hsl(${this.CWHue}, ${this.CWSaturation}%, ${this.CWLight - 40}%)`;
	}

	class Pinnacle {
		constructor(width, height) {
			this.width = width;
			this.height = height;
		}
	}

	class Heliport {
		constructor(width, color) {
			this.width = width;
			this.height = globals.city.angle * width / 45;
			this.color = color;
		}
	}

	let init = () => {
		initCanvas();
		globals.city = new City()
		globals.city.randomize();
		addEvents();
		drawBackground(ctx, canvas);
		window.requestAnimationFrame(loop);
	}

	let addEvents = () => {
		canvas.addEventListener('click', e => {
			globals.city.addBuilding(e.offsetX, e.offsetY);
		}, false);
	}
	
	window.draw = () => {
		drawBackground(ctx, canvas);

		globals.city.draw();
	}

    window.trackMouse = (xMouse, yMouse) => {
    }
	
	window.clearCanvas = () => {
		globals.city.buildings = []; 
		globals.city.buildingsCount = 0;
	}

	window.magic = () => {  
		window.clearCanvas();
		globals.city.generateCity();
        Sound.tada();
	}

    window.upload = () => {
		Sound.error();
    }

	init();
}