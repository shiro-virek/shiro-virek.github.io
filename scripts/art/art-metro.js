{
    const globals = {
		random: null,
		urbanAttractors: [],
		metroNetwork: null,
		palette: []
    };

	const Languages = Object.freeze({
		Generic: Symbol("generic"),
		Japanese: Symbol("japanese"),
		Korean: Symbol("korean"),
		Chinese: Symbol("chinese"),
	});

    const config = {
        randomize: true,
		restrictAngles: true,
		showStationNames: true,
		lineThickness: 10,
		lineMinThickness: 3,
		lineMaxThickness: 20,
		lineTransferMaxDistance: 40,
		hslMaxHue: 360,
		minLineLength: 50,
		infoMarginTop: 10,
		infoMarginLeft: 10,
		infoSymbolSide: 15,
		infoLineHeight: 20,
		infoHeaderHeight: 100,
		infoPadding: 10,
		infoWidth: 120,
		drawQuadtree: false,
		linesLimit: true,
		stationRadio: 10,
		stationColorBorder: false,
		drawStreets: false,
		maxNumberOfLines: 15,
		alphabeticLineSymbol: false,
		language: Languages.Generic,
		maxSegmentLength: 100,
    };    

	class MetroNetwork {
		constructor() {
			this.lines = [];
			this.quad = Quadtree.generateQuadtree(width, height);
		}

		generateNetwork = () => {
			let distance = width / 5;
			let lineCols = Math.floor(width / distance) + 1;
			let lineRows = Math.floor(height / distance) + 1;
			for (let x=0; x < lineCols; x++) {
				for (let y=0; y < lineRows; y++) {
					globals.metroNetwork.addMetroLine(x * distance, y * distance);	
				}
			}
		}

		getNumberOfStations = () => {
			let numberOfStations = 0;
			this.lines.forEach((element) => numberOfStations += element.stations.length);
			return numberOfStations;
		}

		getLinesLength = () => {
			let linesLength = 0;
			for (const line of globals.metroNetwork.lines) {
				linesLength += line.getLength();
			}
			return linesLength;
		}

		getFlag = () => {
			switch (config.language) {
				case Languages.Japanese:
					return "🇯🇵";	
				case Languages.Korean:
					return "🇰🇷";	
				case Languages.Chinese:
					return "🇨🇳";	
				default:
					return ""
			}
		}

		drawLinesInfo = (ctx) => {
			ctx.fillStyle = "#FFF";
			let infoWidth = config.infoWidth;
			let infoHeight = config.infoMarginTop + config.infoHeaderHeight + globals.metroNetwork.lines.length * config.infoLineHeight;
			ctx.fillRect(config.infoMarginLeft, config.infoMarginTop, infoWidth, infoHeight);
			ctx.lineWidth = 1;
			ctx.strokeStyle = '#000000';
			ctx.strokeRect(config.infoMarginLeft, config.infoMarginTop, infoWidth, infoHeight);

			ctx.font = "10px Arial";
			ctx.fillStyle = "#000";
			ctx.fillText(`${this.getFlag()}City Metro System`, config.infoMarginLeft + config.infoPadding, config.infoMarginTop + config.infoPadding * 2);
			ctx.fillText(`Stations: ${globals.metroNetwork.getNumberOfStations()}`, config.infoMarginLeft + config.infoPadding, config.infoMarginTop + config.infoPadding * 2 + config.infoLineHeight);
			ctx.fillText(`Lines: ${globals.metroNetwork.lines.length}`, config.infoMarginLeft + config.infoPadding, config.infoMarginTop + config.infoPadding * 2 + config.infoLineHeight * 2);
			ctx.fillText(`Length: ${Math.floor(globals.metroNetwork.getLinesLength() / 100)} km.`, config.infoMarginLeft + config.infoPadding, config.infoMarginTop + config.infoPadding * 2 + config.infoLineHeight * 3);
			ctx.fillText(`Transfer station`, config.infoMarginLeft + config.infoSymbolSide + config.infoPadding * 2, config.infoMarginTop + config.infoPadding * 2 + config.infoLineHeight * 4);

			MetroNetwork.drawTransferIcon(ctx);

			ctx.lineWidth = 1;
			for (let i = 0; i < globals.metroNetwork.lines.length; i++) {
				Drawing.drawRectangle(ctx, config.infoMarginLeft + config.infoPadding, config.infoMarginTop + config.infoHeaderHeight + config.infoPadding + i * config.infoLineHeight, config.infoSymbolSide, config.infoSymbolSide, globals.metroNetwork.lines[i].colorBase());
				Drawing.drawRectangleBorder(ctx, config.infoMarginLeft + config.infoPadding, config.infoMarginTop + config.infoHeaderHeight + config.infoPadding + i * config.infoLineHeight, config.infoSymbolSide, config.infoSymbolSide, "#000");
				ctx.fillStyle = "#000";
				ctx.fillText(`Line ${globals.metroNetwork.lines[i].symbol} ${globals.metroNetwork.lines[i].getTransfersText()}`, config.infoMarginLeft + config.infoSymbolSide + config.infoPadding * 2, config.infoMarginTop + config.infoHeaderHeight + config.infoPadding * 2 + i * config.infoLineHeight);
			}
		}

		static drawTransferIcon = (ctx) => {
			let station1 = new Station(config.infoMarginLeft + config.infoPadding, config.infoMarginTop + config.infoPadding * 2 + config.infoLineHeight * 4 - 5);
			let station2 = new Station(config.infoMarginLeft + config.infoPadding + config.infoSymbolSide, config.infoMarginTop + config.infoPadding * 2 + config.infoLineHeight * 4 - 5);
			station1.transfer = station2;
			station1.drawTransferLine(ctx, true, 10);
		}

		drawStationLabels = (ctx) => {
			let placedLabels = [];
			ctx.font = "10px Arial";
			ctx.strokeStyle = "white";   
			ctx.fillStyle = "black";      
			ctx.lineWidth = 3;       

			for (const line of globals.metroNetwork.lines) {
				for (const station of line.stations) {
					let textWidth = ctx.measureText(station.name).width;
					let textHeight = 10;

					let offsets = [
						{ dx: config.stationRadio + 5, dy: textHeight / 3 },
						{ dx: -textWidth - config.stationRadio - 5, dy: textHeight / 3 },
						{ dx: -textWidth / 2, dy: -config.stationRadio - 5 },
						{ dx: -textWidth / 2, dy: config.stationRadio + textHeight + 5 },
						{ dx: config.stationRadio + 5, dy: -config.stationRadio - 3 },
						{ dx: -textWidth - config.stationRadio - 5, dy: -config.stationRadio - 3 },
						{ dx: config.stationRadio + 5, dy: config.stationRadio + textHeight + 3 },
						{ dx: -textWidth - config.stationRadio - 5, dy: config.stationRadio + textHeight + 3 },
					];

					let placed = false;
					for (const offset of offsets) {
						let labelX = station.x + offset.dx;
						let labelY = station.y + offset.dy;
						let labelBox = { x: labelX, y: labelY - textHeight, w: textWidth, h: textHeight };

						if (!this.isOverlapping(labelBox, placedLabels)) {	
							ctx.strokeText(station.name, labelX, labelY);
							ctx.fillText(station.name, labelX, labelY);

							placedLabels.push(labelBox);
							placed = true;
							break;
						}
					}

					if (!placed) {
						ctx.globalAlpha = 0.3;
						ctx.fillText(station.name, station.x + config.stationRadio + 5, station.y + textHeight / 3);
						ctx.globalAlpha = 1.0;
					}
				}
			}
		}

		isOverlapping = (box, placedLabels) => {
			let padding = 3;
			for (const placed of placedLabels) {
				if (box.x < placed.x + placed.w + padding &&
					box.x + box.w + padding > placed.x &&
					box.y < placed.y + placed.h + padding &&
					box.y + box.h + padding > placed.y) {
					return true;
				}
			}
			return false;
		}

		drawLines = (ctx) => {
			if (config.drawStreets)
				for (const line of globals.metroNetwork.lines) {
					line.drawStreets(ctx);
				}

			for (const line of globals.metroNetwork.lines) {
				line.drawMetroLine(ctx);
			}

			for (const line of globals.metroNetwork.lines) {
				for (const station of line.stations) {
					station.drawTransferLine(ctx, true, config.lineThickness);
				}
			}

			if (config.showStationNames) 
				this.drawStationLabels(ctx);
		}

		addMetroLine = (x, y) => {
			if ((globals.metroNetwork.lines.length < config.maxNumberOfLines && config.linesLimit) || !config.linesLimit) {
				let line = new Line(x, y);
				line.randomize();

				if (line.getLength() > config.minLineLength) {
					globals.metroNetwork.lines.push(line);

					this.populateQuadTree();

					for (const line of globals.metroNetwork.lines) {
						for (const station of line.stations) {
							station.addTransfers(this);
						}
					}

					this.linkToNetwork(line);
				} else {
					globals.palette.push(line.hue);
				}

				Sound.ping(100);
			}
		}

		calculateNewPoint = (pA, pB, distance) => {
			let xC = 0;
			let yC = 0;
		
			xC = pB.x;	

			if (pA.x > pB.x) { 		
				if (pA.y > pB.y) 
					yC = pA.y - Math.abs(pB.x - pA.x)					
				else 
					yC = pA.y + Math.abs(pB.x - pA.x);

				if (Trigonometry.distanceBetweenTwoPoints(pA.x, pA.y, xC, yC) > distance) {
					yC = pB.y;
					xC = pA.x - Math.abs(pB.y - pA.y);
				}
					
			}else{				
				if (pA.y > pB.y) 	
					yC = pA.y - Math.abs(pB.x - pA.x)				
				
				else
					yC = pA.y + Math.abs(pB.x - pA.x);		

				if (Trigonometry.distanceBetweenTwoPoints(pA.x, pA.y, xC, yC) > distance) {
					yC = pB.y;
					xC = pA.x + Math.abs(pB.y - pA.y);
				}				
			}

			return { x: xC, y: yC };
		}

		linkToNetwork = (line) => {
			if (globals.metroNetwork.lines.length == 1) return;
			let hasTransfers = line.stations.reduce(
				(accumulator, currentValue) => accumulator || currentValue.transfer != null,
				false,
			);

			if (hasTransfers) return;

			let lastStation = line.stations.at(-1);

			let distance = Infinity;
			let closestStation = null;			
			for (const otherLine of globals.metroNetwork.lines) {
				if (otherLine === line) continue;
				for (const station of otherLine.stations) {
					let dist = Trigonometry.distanceBetweenTwoPoints(station.x, station.y, lastStation.x, lastStation.y);

					if (dist < distance) {
						distance = dist;
						closestStation = station;
					}
				}
			}

			if (closestStation != null) {			
				let newPoint = this.calculateNewPoint(lastStation, closestStation, distance);
										
				let newSegment1 = new Segment(newPoint.x, newPoint.y, Trigonometry.distanceBetweenTwoPoints(lastStation.x, lastStation.y, newPoint.x, newPoint.y));
				line.segments.push(newSegment1);

				let newSegment2 = new Segment(closestStation.x, closestStation.y, Trigonometry.distanceBetweenTwoPoints(newPoint.x, newPoint.y, closestStation.x, closestStation.y));
				line.segments.push(newSegment2);

				let newStation = new Station(closestStation.x, closestStation.y, line.symbol);
				line.stations.push(newStation);
				newStation.addTransfer(closestStation, newStation);
			}
		}

		populateQuadTree = () => {
			this.quad.clear();
			for (const line of globals.metroNetwork.lines) {
				for (const station of line.stations) {
					this.quad.insert(station);
				}
			}
		}

		draw = (ctx) => {
			if (this.lines.length > 0) {
				if (config.drawQuadtree)
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
			this.name = this.generateName();
		}

		generateIcon = () => {
			const icons =  ["✈︎", "⛪", "🚌", "🚆", "🚗", "♿︎", ""];
			const probabilities = [0.03, 0.05, 0.05, 0.05, 0.05, 0.31, 0.1];
			
			return globals.random.getElementByProbability(icons, probabilities);
		}

		generateName = () => {
			let icon = this.generateIcon();

			switch (config.language) {
				case Languages.Generic:					
					return Text.generateName(globals.random, 1, 2) + icon;
				case Languages.Japanese:
					return Text.generateJapaneseName(globals.random, 1, 2) + icon;
				case Languages.Korean:
					return Text.generateKoreanName(globals.random, 1, 2) + icon;
				case Languages.Chinese:
					return Text.generateChineseName(globals.random, 1, 2) + icon;
				default:
					break;
			}
		}

		drawStation = (ctx, color) => {			
			Drawing.drawCircle(ctx, this.x, this.y, config.stationRadio, "#FFF");

			if (config.stationColorBorder)
				Drawing.drawCircleBorder(ctx, this.x, this.y, config.stationRadio, "#000")
			else
				Drawing.drawCircleBorder(ctx, this.x, this.y, config.stationRadio, "#AAA");
		}

		drawStationName = (ctx) => {
			let margin = 10;
			ctx.font = "10px Arial";           
			ctx.fillStyle = "black";   
			ctx.fillText(this.name, this.x + margin, this.y - margin);
		}

		addTransfers = (MetroNetwork) => {
			for (const line of MetroNetwork.lines) {
				if (line.symbol == this.lineSymbol) continue;
				for (const otherStation of line.stations) {
					this.addTransfer(otherStation, this);
				}
			}
		}

		addTransfer = (station1, station2) => {
			let catX = Math.abs(station2.x - station1.x);
			let catY = Math.abs(station2.y - station1.y);
			let distance = Math.sqrt(catX * catX + catY * catY);

			if (distance < config.lineTransferMaxDistance && station1.transfer == null && station2.transfer == null) {
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

		getTop = () => this.y - config.stationRadio;
		getBottom = () => this.y + config.stationRadio;
		getLeft = () => this.x - config.stationRadio;
		getRight = () => this.x + config.stationRadio;
	}

	class Street {
		constructor(x, y, angle) {
			this.x = x;
			this.y = y;
			this.angle = angle;
		}

		drawStreet = (ctx) => {
			ctx.strokeStyle = "#EEE";
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
			this.symbol = config.alphabeticLineSymbol ? "A" : 1;
		}

		getTransfersText = () => {	
			let result = "";
			for (const station of this.stations) {
				if (station.transfer != null && !result.includes(station.transfer.lineSymbol)) {
					result += `${station.transfer.lineSymbol}, `;
				}
			}

			if (result.length > 0) {
				result = result.slice(0, -2);
				result = `(${result})`;
			}	

			return result;
		}

		getAttractedDirection = (x, y, originalDirection) => {
			if (globals.urbanAttractors.length == 0) return originalDirection;

			let closest = globals.urbanAttractors.reduce((prev, curr) => {
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
			if (globals.metroNetwork.lines.length > 0)
				if (config.alphabeticLineSymbol) {
					let nextSymbol = Text.nextCharacter(globals.metroNetwork.lines[globals.metroNetwork.lines.length - 1].symbol);
					if (nextSymbol == '[') {
						this.symbol = 1;
						config.alphabeticLineSymbol = false;
					} else {
						this.symbol = nextSymbol;
					}
				} else
					this.symbol = globals.metroNetwork.lines[globals.metroNetwork.lines.length - 1].symbol + 1;
		}

		randomizeColor = () => {
			this.hue = globals.palette.pop();
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
			let infoHeight = config.infoMarginTop + config.infoHeaderHeight + config.maxNumberOfLines * config.infoLineHeight;
			let margin = 40;
			let infoRect = {
				left: config.infoMarginLeft - margin,
				right: config.infoMarginLeft + config.infoWidth + margin,
				top: config.infoMarginTop - margin,
				bottom: infoHeight + margin
			};

			for (let index = 0; index < numberOfSegments; index++) {
				let length;
				let direction;
				let newX;
				let newY;
				let segment;

				length = globals.random.nextInt(20, 200);

				if (config.restrictAngles)
					direction = baseDirection + Line.getDirection()
				else
					direction = this.getAttractedDirection(lastX, lastY, baseDirection + Line.getDirection());

				let deltaX = Math.cos(direction * Trigonometry.RAD_CONST) * length;
				let deltaY = Math.sin(direction * Trigonometry.RAD_CONST) * length;

				newX = lastX + deltaX;
				newY = lastY + deltaY;
				segment = new Segment(newX, newY, length);

				let endpointInInfo =
					newX > infoRect.left && newX < infoRect.right &&
					newY > infoRect.top && newY < infoRect.bottom;
				let segmentCrossesInfo = Trigonometry.segmentCrossesRect(lastX, lastY, newX, newY, infoRect);
				let offScreen =
					newX < margin || newX > width - margin ||
					newY < margin || newY > height - margin;
				let segmentCrossesEdge =
					Trigonometry.segmentCrossesRect(lastX, lastY, newX, newY, {
						left: margin, right: width - margin,
						top: margin, bottom: height - margin
					});
				let tooClose = isSegmentTooClose(lastX, lastY, newX, newY, 40);

				if (endpointInInfo || segmentCrossesInfo || offScreen || segmentCrossesEdge || tooClose) {
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
			this.lineThickness = config.lineThickness;
			this.randomizeColor();
			this.randomizeSymbol();
			this.randomizeSegments();
		}

		static getDirection = () => {
			return 45 * globals.random.nextInt(-1, 1);
		}

		drawMetroLine = (ctx) => {
			this.drawSegments(ctx);
			this.drawStations(ctx);
		}

		drawSymbol = (ctx, x, y) => {
			Drawing.drawCircle(ctx, x, y, config.infoSymbolSide, this.colorBase());

			let metrics = ctx.measureText(this.symbol);
			let textWidth = metrics.width;
			let textHeight =  metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;;

			ctx.font = "bold 15px Arial";
			ctx.fillStyle = "#FFF";
			ctx.fillText(this.symbol, x - textWidth / 2, y + textHeight / 2);
		}

		drawSegments = (ctx) => {

			let angle = Trigonometry.angleBetweenTwoPoints(this.x, this.y, this.segments[1].x, this.segments[1].y) + 180;
			let { x, y } = Trigonometry.newPointAngleDistance(this.x, this.y, angle, config.infoSymbolSide + 20);
			
			this.drawSymbol(ctx, x, y);

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
		globals.urbanAttractors = [];
		for (let i = 0; i < count; i++) {
			let attractor = {
				x: globals.random.nextInt(width * 0.2, width * 0.8),
				y: globals.random.nextInt(height * 0.2, height * 0.8)
			};
			globals.urbanAttractors.push(attractor);
		}
	}

	let init = () => {
		initCanvas();
		globals.metroNetwork = new MetroNetwork()
		globals.random = Objects.getRandomObject();
        if (config.randomize) randomize();
		addEvents();
		window.requestAnimationFrame(loop);
		addSpecialControls();
	}

	let addEvents = () => {
		canvas.addEventListener('click', e => {
			globals.metroNetwork.addMetroLine(e.offsetX, e.offsetY);
		}, false);
	}

	let generatePalette = () => {
		globals.palette = [];
		let seed = globals.random.nextInt(0, config.hslMaxHue);
		let increment = Math.floor(config.hslMaxHue / config.maxNumberOfLines);
		for (let i = 1; i <= config.maxNumberOfLines; i++) {
			let color = seed + i * increment;
			if (color > config.hslMaxHue)
				color = color - config.hslMaxHue;
			globals.palette.push(color);
		}

		globals.random.shuffleArray(globals.palette);
	}
		
	let isSegmentTooClose = (x1, y1, x2, y2, threshold = 20) => {
		for (const line of globals.metroNetwork.lines) {
			for (let i = 1; i < line.segments.length; i++) {
				let s1 = line.segments[i - 1];
				let s2 = line.segments[i];
				let dist = Trigonometry.distanceBetweenSegments(x1, y1, x2, y2, s1.x, s1.y, s2.x, s2.y);
				if (dist < threshold) return true;
			}
		}
		return false;
	}

	let randomize = () => {
		globals.random = Objects.getRandomObject();
		config.restrictAngles = globals.random.nextBool();
		config.showStationNames = globals.random.nextBool();
		config.lineThickness = globals.random.nextInt(config.lineMinThickness, config.lineMaxThickness)
		config.stationColorBorder = globals.random.nextBool();
		config.stationRadio = globals.random.nextInt(3,10);
		config.maxNumberOfLines = Math.floor(width * height / 25000);
		generatePalette();
		config.alphabeticLineSymbol = globals.random.nextBool();
		config.drawStreets = globals.random.nextBool();
		generateUrbanAttractors();
		let rand = globals.random.nextInt(0, Object.keys(Languages).length - 1);
		config.language = Languages[Object.keys(Languages)[rand]];
	}


    let addSpecialControls = () => {
        let generateNetwork = () => { 
			window.clearCanvas();
			globals.metroNetwork.generateNetwork();
        }
        
        Browser.addButton("btnGenerateNetwork", "🚅", generateNetwork);
    }


	window.draw = () => {
		ctx.fillStyle = `rgb(255, 255, 255)`;
		ctx.fillRect(0, 0, width, height);
		globals.metroNetwork.draw(ctx);
	}

    window.trackMouse = (xMouse, yMouse) => {
    }

	window.clearCanvas = () => {  
		globals.metroNetwork.lines = [];
		generatePalette();
	}

	init();
}
