{
    const globals = {
		random: null
    };

    const config = {
        randomize: true,
		restrictAngles: true,
    };    

	let urbanAttractors = [];
	let LINE_THICKNESS = 10;
	let LINE_TRANSFER_MAX_DISTANCE = 30;
	let HSL_MAX_HUE = 360;
	let MIN_LINE_LENGTH = 50;
	let INFO_MARGIN_TOP = 10;
	let INFO_MARGIN_LEFT = 10;
	let INFO_SYMBOL_SIDE = 15;
	let INFO_LINE_HEIGHT = 20;
	let INFO_HEADER_HEIGHT = 100;
	let INFO_PADDING = 10;
	let INFO_WIDTH = 120;
	let DRAW_QUADTREE = false;
	let LINES_LIMIT = true;
	let stationRadio = 10;
	let stationColorBorder = false;
	let drawStreets = false;
	let drawIcons = false;

	let maxNumberOfLines = 15;
	let angleSegmentRange = 2;
	let alphabeticLineSymbol = false;
	let metroNetwork;
	let palette = [];

	class MetroNetwork {
		constructor() {
			this.lines = [];
			this.quad = Quadtree.generateQuadtree(width, height);
		}

		getNumberOfStations = () => {
			let numberOfStations = 0;
			this.lines.forEach((element) => numberOfStations += element.stations.length);
			return numberOfStations;
		}

		getLinesLength = () => {
			let linesLength = 0;
			for (const line of metroNetwork.lines) {
				linesLength += line.getLength();
			}
			return linesLength;
		}

		drawLinesInfo = (ctx) => {
			ctx.fillStyle = "#FFF";
			let infoWidth = INFO_WIDTH;
			let infoHeight = INFO_MARGIN_TOP + INFO_HEADER_HEIGHT + metroNetwork.lines.length * INFO_LINE_HEIGHT;
			ctx.fillRect(INFO_MARGIN_LEFT, INFO_MARGIN_TOP, infoWidth, infoHeight);
			ctx.lineWidth = 1;
			ctx.strokeStyle = '#000000';
			ctx.strokeRect(INFO_MARGIN_LEFT, INFO_MARGIN_TOP, infoWidth, infoHeight);

			ctx.font = "10px Arial";
			ctx.fillStyle = "#000";
			ctx.fillText(`City Metro System`, INFO_MARGIN_LEFT + INFO_PADDING, INFO_MARGIN_TOP + INFO_PADDING * 2);
			ctx.fillText(`Stations: ${metroNetwork.getNumberOfStations()}`, INFO_MARGIN_LEFT + INFO_PADDING, INFO_MARGIN_TOP + INFO_PADDING * 2 + INFO_LINE_HEIGHT);
			ctx.fillText(`Lines: ${metroNetwork.lines.length}`, INFO_MARGIN_LEFT + INFO_PADDING, INFO_MARGIN_TOP + INFO_PADDING * 2 + INFO_LINE_HEIGHT * 2);
			ctx.fillText(`Length: ${Math.floor(metroNetwork.getLinesLength() / 100)} km.`, INFO_MARGIN_LEFT + INFO_PADDING, INFO_MARGIN_TOP + INFO_PADDING * 2 + INFO_LINE_HEIGHT * 3);
			ctx.fillText(`Transfer station`, INFO_MARGIN_LEFT + INFO_SYMBOL_SIDE + INFO_PADDING * 2, INFO_MARGIN_TOP + INFO_PADDING * 2 + INFO_LINE_HEIGHT * 4);

			MetroNetwork.drawTransferIcon(ctx);

			ctx.lineWidth = 1;
			for (let i = 0; i < metroNetwork.lines.length; i++) {
				Drawing.drawRectangle(ctx, INFO_MARGIN_LEFT + INFO_PADDING, INFO_MARGIN_TOP + INFO_HEADER_HEIGHT + INFO_PADDING + i * INFO_LINE_HEIGHT, INFO_SYMBOL_SIDE, INFO_SYMBOL_SIDE, '#000', metroNetwork.lines[i].colorBase());
				ctx.fillStyle = "#000";
				ctx.fillText(`Line ${metroNetwork.lines[i].symbol}`, INFO_MARGIN_LEFT + INFO_SYMBOL_SIDE + INFO_PADDING * 2, INFO_MARGIN_TOP + INFO_HEADER_HEIGHT + INFO_PADDING * 2 + i * INFO_LINE_HEIGHT);
			}
		}

		static drawTransferIcon = (ctx) => {
			let station1 = new Station(INFO_MARGIN_LEFT + INFO_PADDING, INFO_MARGIN_TOP + INFO_PADDING * 2 + INFO_LINE_HEIGHT * 4 - 5);
			let station2 = new Station(INFO_MARGIN_LEFT + INFO_PADDING + INFO_SYMBOL_SIDE, INFO_MARGIN_TOP + INFO_PADDING * 2 + INFO_LINE_HEIGHT * 4 - 5);
			station1.transfer = station2;
			station1.drawTransferLine(ctx, true, 10);
		}

		drawLines = (ctx) => {
			if (drawStreets)
				for (const line of metroNetwork.lines) {
					line.drawStreets(ctx);
				}

			for (const line of metroNetwork.lines) {
				line.drawMetroLine(ctx);
			}

			for (const line of metroNetwork.lines) {
				for (const station of line.stations) {
					station.drawTransferLine(ctx, true, LINE_THICKNESS);
				}
			}
		}

		addMetroLine = (x, y) => {
			if ((metroNetwork.lines.length < maxNumberOfLines && LINES_LIMIT) || !LINES_LIMIT) {
				let line = new Line(x, y);
				line.randomize();

				if (line.getLength() > MIN_LINE_LENGTH)
					metroNetwork.lines.push(line);
				else
					palette.push(line.hue);

				for (const line of metroNetwork.lines) {
					for (const station of line.stations) {
						station.addTransfers(this);
					}
				}

				Sound.ping(100);
			}
		}

		populateQuadTree = () => {
			this.quad.clear();
			for (const line of metroNetwork.lines) {
				for (const station of line.stations) {
					this.quad.insert(station);
				}
			}
		}

		draw = (ctx) => {
			if (this.lines.length > 0) {
				if (DRAW_QUADTREE)
					this.quad.drawQuadtree(ctx, this.quad);
				this.drawLines(ctx);
				this.drawLinesInfo(ctx);
				this.populateQuadTree();
			}
		}
	}

	class Segment {
		constructor(x, y, length) {
			this.x = x;
			this.y = y;
			this.segmentLength = length;
		}
	}

	class Station {
		constructor(x, y, lineSymbol) {
			this.x = x;
			this.y = y;
			this.lineSymbol = lineSymbol;
			this.transfer = null;
			this.name = "station";
		}

		drawStation = (ctx, color) => {			
			Drawing.drawCircle(ctx, this.x, this.y, stationRadio, stationColorBorder ? color : "#000", "#FFF");
		}

		drawStationName = (ctx) => {
			let margin = 10;
			ctx.font = "10px Arial";           
			ctx.fillStyle = "white";             
			ctx.strokeStyle = "black";         
			ctx.lineWidth = 3;       
			ctx.strokeText(this.name, this.x + margin, this.y - margin);
			ctx.fillText(this.name, this.x + margin, this.y - margin);
		}

		addTransfers = (metroNetwork) => {
			let returnObjects = [];

			metroNetwork.quad.retrieve(returnObjects, this);

			for (const element of returnObjects) {
				let otherStation = element;

				if (otherStation == this || otherStation.lineSymbol == this.lineSymbol)
					continue;

				this.addTransfer(otherStation, this);
			}
		}

		addTransfer = (station1, station2) => {
			let catX = Math.abs(station2.x - station1.x);
			let catY = Math.abs(station2.y - station1.y);
			let distance = Math.sqrt(catX * catX + catY * catY);

			if (distance < LINE_TRANSFER_MAX_DISTANCE && station1.transfer == null && station2.transfer == null) {
				station1.transfer = station2;
				station2.transfer = station1;
			}
		}

		drawTransferLine = (ctx, blackBorder = false, lineWidth) => {
			if (this.transfer == null) return;
			if (blackBorder) {
				ctx.strokeStyle = "#000";
				ctx.lineWidth = lineWidth + 1;
				ctx.lineCap = "round";
				ctx.beginPath();
				ctx.moveTo(this.x, this.y);
				ctx.lineTo(this.transfer.x, this.transfer.y);
				ctx.stroke();
			}

			ctx.strokeStyle = "#FFF";
			ctx.lineWidth = lineWidth;
			ctx.lineCap = "round";
			ctx.beginPath();
			ctx.moveTo(this.x, this.y);
			ctx.lineTo(this.transfer.x, this.transfer.y);
			ctx.stroke();
		}

		getTop = () => this.y;
		getBottom = () => this.y;
		getLeft = () => this.x;
		getRight = () => this.x;
	}

	class Street {
		constructor(x, y, angle) {
			this.x = x;
			this.y = y;
			this.angle = angle;
		}

		drawStreet = (ctx) => {
			ctx.strokeStyle = "#222";
			ctx.lineWidth = 6;
			ctx.lineCap = "square";
			ctx.beginPath();
			let newStartX = this.x - Math.cos(this.angle * Trigonometry.RAD_CONST) * (1000);
			let newStartY = this.y - Math.sin(this.angle * Trigonometry.RAD_CONST) * (1000);
			ctx.moveTo(newStartX, newStartY);
			let newEndX = newStartX + Math.cos(this.angle * Trigonometry.RAD_CONST) * (2000);
			let newEndY = newStartY + Math.sin(this.angle * Trigonometry.RAD_CONST) * (2000);
			ctx.lineTo(newEndX, newEndY);
			ctx.stroke();
		}
	}

	class Line {
		constructor(x, y) {
			this.x = x;
			this.y = y;
			this.segments = [];
			this.stations = [];
			this.streets = [];
			this.symbol = alphabeticLineSymbol ? "A" : 1;
		}

		getAttractedDirection = (x, y, originalDirection) => {
			if (urbanAttractors.length == 0) return originalDirection;

			let closest = urbanAttractors.reduce((prev, curr) => {
				let dPrev = Math.hypot(x - prev.x, y - prev.y);
				let dCurr = Math.hypot(x - curr.x, y - curr.y);
				return dCurr < dPrev ? curr : prev;
			});

			let angleToAttractor = Math.atan2(closest.y - y, closest.x - x) * 180 / Math.PI;

			let newDirection = originalDirection * 0.7 + angleToAttractor * 0.3;
			return newDirection;
		}

		getLength = () => {
			let length = 0;
			for (const segment of this.segments) {
				length += segment.segmentLength;
			}
			return length;
		}

		randomizeSymbol = () => {
			if (metroNetwork.lines.length > 0)
				if (alphabeticLineSymbol) {
					let nextSymbol = Text.nextCharacter(metroNetwork.lines[metroNetwork.lines.length - 1].symbol);
					if (nextSymbol == '[') {
						this.symbol = 1;
						alphabeticLineSymbol = false;
					} else {
						this.symbol = nextSymbol;
					}
				} else
					this.symbol = metroNetwork.lines[metroNetwork.lines.length - 1].symbol + 1;
		}

		randomizeColor = () => {
			this.hue = palette.pop();
			this.saturation = 100;
			this.light = globals.random.nextInt(20, 50);
		}

		randomizeSegments = () => {
			let lastX = this.x;
			let lastY = this.y;
			let lastDirection = 0;
			let baseDirection = 45 * globals.random.nextInt(0, 7);
			let numberOfSegments = globals.random.nextInt(3, 12);

			let firstSegment = new Segment(this.x, this.y, 0);
			this.segments.push(firstSegment);
			let firstStation = new Station(this.x, this.y, this.symbol);
			this.stations.push(firstStation);
			let infoHeight = INFO_MARGIN_TOP + INFO_HEADER_HEIGHT + maxNumberOfLines * INFO_LINE_HEIGHT;
			let margin = 10;

			for (let index = 0; index < numberOfSegments; index++) {
				let length;
				let direction;
				let newX;
				let newY;
				let segment;

				length = globals.random.nextInt(20, 200);

				if (config.restrictAngles)
					direction = baseDirection + this.getDirection(lastDirection)
				else
					direction = this.getAttractedDirection(lastX, lastY, baseDirection + this.getDirection(lastDirection));

				let deltaX = Math.cos(direction * Trigonometry.RAD_CONST) * length;
				let deltaY = Math.sin(direction * Trigonometry.RAD_CONST) * length;

				newX = lastX + deltaX;
				newY = lastY + deltaY;
				segment = new Segment(newX, newY, length);

				if (
					(newX < INFO_MARGIN_LEFT + INFO_WIDTH + margin && newY < INFO_MARGIN_TOP + infoHeight + margin)
					|| (newX < margin || newX > width - margin || newY < margin || newY > height - margin)
					|| isSegmentTooClose(lastX, lastY, newX, newY)
				){
					if (index == 0) Sound.error();
					continue;
				}

				this.addStation(length, direction, newX, newY, lastX, lastY);
				this.addStreet(lastX, lastY, direction);

				this.segments.push(segment);

				lastX = newX;
				lastY = newY;

				lastDirection = direction;
			}

			this.addEndStation(lastX, lastY);
		}

		addStation = (segmentLength, segmentAngle, newX, newY, lastX, lastY) => {
			let newStationX = 0;
			let newStationY = 0;

			let stationThresholdMax = 100;
			let stationThresholdMin = 50;

			if (segmentLength > stationThresholdMin) {
				if (segmentLength < stationThresholdMax) {
					newStationX = newX;
					newStationY = newY;
				} else {
					newStationX = lastX + Math.cos(segmentAngle * Trigonometry.RAD_CONST) * (segmentLength / 2);
					newStationY = lastY + Math.sin(segmentAngle * Trigonometry.RAD_CONST) * (segmentLength / 2);
				}

				let newStation = new Station(newStationX, newStationY, this.symbol);
				this.stations.push(newStation);
			}
		}

		addEndStation = (lastX, lastY) => {
			let lastAddedStation = this.stations[this.stations.length - 1];

			if (lastAddedStation.x != lastX && lastAddedStation.y != lastY) {
				let endStation = new Station(lastX, lastY, this.symbol);
				this.stations.push(endStation);
			}
		}

		addStreet = (startX, startY, angle) => {
			if (globals.random.nextInt(1, 5) == 1) {
				let street = new Street(startX, startY, angle);
				this.streets.push(street);
			}
		}

		randomize = () => {
			config.restrictAngles = globals.random.nextBool();
			this.lineThickness = LINE_THICKNESS;
			this.randomizeColor();
			this.randomizeSymbol();
			this.randomizeSegments();
		}

		getDirection = (lastDirection) => {
			return 45 * globals.random.nextInt(-angleSegmentRange, angleSegmentRange);
		}

		drawMetroLine = (ctx) => {
			this.drawSegments(ctx);
			this.drawStations(ctx);
		}

		drawSegments = (ctx) => {
			ctx.lineCap = "round";
			ctx.lineWidth = this.lineThickness;
			ctx.strokeStyle = this.colorBase();
			ctx.beginPath();
			ctx.moveTo(this.x, this.y);
			for (const segment of this.segments) {				
				ctx.lineTo(segment.x, segment.y);
			}
			ctx.stroke();
		}

		drawStations = (ctx) => {
			for (const station of this.stations) {
				station.drawStation(ctx, this.colorBase());
				station.drawStationName(ctx);
			}
		}

		drawStreets = (ctx) => {
			for (const street of this.streets) {
				street.drawStreet(ctx);
			}
		}

		colorBase = () => `hsl(${this.hue}, ${this.saturation}%, ${this.light}%)`;
	}

	let generateUrbanAttractors = (count = 3) => {
		urbanAttractors = [];
		for (let i = 0; i < count; i++) {
			let attractor = {
				x: globals.random.nextInt(width * 0.2, width * 0.8),
				y: globals.random.nextInt(height * 0.2, height * 0.8)
			};
			urbanAttractors.push(attractor);
		}
	}


	let init = () => {
		initCanvas();
		metroNetwork = new MetroNetwork()
		globals.random = Objects.getRandomObject();
        if (config.randomize) randomize();
		addEvents();
		window.requestAnimationFrame(loop)
	}

	let addEvents = () => {
		canvas.addEventListener('click', e => {
			metroNetwork.addMetroLine(e.offsetX, e.offsetY);
		}, false);
	}

	let generatePalette = () => {
		let seed = globals.random.nextInt(0, HSL_MAX_HUE);
		let increment = Math.floor(HSL_MAX_HUE / maxNumberOfLines);
		for (let i = 1; i <= maxNumberOfLines; i++) {
			let color = seed + i * increment;
			if (color > HSL_MAX_HUE)
				color = color - HSL_MAX_HUE;
			palette.push(color);
		}

		globals.random.shuffleArray(palette);
	}
		
	function isSegmentTooClose(x1, y1, x2, y2, threshold = 20) {
		for (const line of metroNetwork.lines) {
			for (let i = 1; i < line.segments.length; i++) {
				let s1 = line.segments[i - 1];
				let s2 = line.segments[i];
				let dist = distanceBetweenSegments(x1, y1, x2, y2, s1.x, s1.y, s2.x, s2.y);
				if (dist < threshold) return true;
			}
		}
		return false;
	}
		
	function distanceBetweenSegments(x1, y1, x2, y2, x3, y3, x4, y4) {
		// Aprox: distancia mínima entre extremos
		let d1 = Math.hypot(x1 - x3, y1 - y3);
		let d2 = Math.hypot(x2 - x4, y2 - y4);
		let d3 = Math.hypot(x1 - x4, y1 - y4);
		let d4 = Math.hypot(x2 - x3, y2 - y3);
		return Math.min(d1, d2, d3, d4);
	}

	let randomize = () => {
		globals.random = Objects.getRandomObject();
		LINE_THICKNESS = globals.random.nextInt(LINE_THICKNESS, LINE_THICKNESS * 2)
		stationColorBorder = globals.random.nextBool();
		stationRadio = globals.random.nextInt(3,10);
		maxNumberOfLines = Math.floor(width * height / 25000);
		generatePalette();
		alphabeticLineSymbol = globals.random.nextBool();
		angleSegmentRange = globals.random.nextBool();
		drawIcons = globals.random.nextBool();
		drawStreets = globals.random.nextBool();
		generateUrbanAttractors();
	}

	let draw = () => {
		drawBackground(ctx, canvas);
		metroNetwork.draw(ctx);
	}

	let loop = (timestamp) => {
		let progress = timestamp - lastRender;

		draw();

		lastRender = timestamp;
		window.requestAnimationFrame(loop);
	}

	init();

	window.clearCanvas = () => {  
		metroNetwork.lines = [];
	}
}
