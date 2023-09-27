{

	let CANVAS_ID = "myCanvas"
	let RAD_CONST = 0.0175;
	let LINE_THICKNESS = 10;
	let ALPHABETIC_SYMBOL = false;
	let MAX_LINES = 15;
	let LINE_TRANSFER_MAX_DISTANCE = 30;

	let INFO_MARGIN_TOP = 10;
	let INFO_MARGIN_LEFT = 10;
	let INFO_SYMBOL_SIDE = 15;
	let INFO_LINE_HEIGHT = 20;
	let INFO_HEADER_HEIGHT = 100;
	let INFO_PADDING = 10;
	let INFO_WIDTH = 120;
	let DRAW_QUADTREE = false;

	let width = 0;
	let height = 0;
	let metroNetwork;	
	let lastRender = 0

	class MetroNetwork {
		constructor(){
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
				for (let j = 1; j < line.points.length; j++) {
					linesLength += Math.floor(Math.sqrt(Math.pow(line.points[j].x - line.points[j - 1].x, 2) + Math.pow(line.points[j].y - line.points[j - 1].y, 2)));
				}
			}
			return Math.floor(linesLength / 100);
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
			ctx.fillText(`Length: ${metroNetwork.getLinesLength()} km.`, INFO_MARGIN_LEFT + INFO_PADDING, INFO_MARGIN_TOP + INFO_PADDING * 2 + INFO_LINE_HEIGHT * 3);
			ctx.fillText(`Transfer station`, INFO_MARGIN_LEFT + INFO_SYMBOL_SIDE + INFO_PADDING * 2, INFO_MARGIN_TOP + INFO_PADDING * 2 + INFO_LINE_HEIGHT * 4);
			
			MetroNetwork.drawTransferIcon(ctx);

			ctx.lineWidth = 1;
			for (let i = 0; i < metroNetwork.lines.length; i++) {
				Utils.drawRectangle(ctx, INFO_MARGIN_LEFT + INFO_PADDING, INFO_MARGIN_TOP + INFO_HEADER_HEIGHT + INFO_PADDING + i * INFO_LINE_HEIGHT, INFO_SYMBOL_SIDE, INFO_SYMBOL_SIDE, '#000', metroNetwork.lines[i].colorBase());
				ctx.fillStyle = "#000";
				ctx.fillText(`Line ${metroNetwork.lines[i].symbol}`, INFO_MARGIN_LEFT + INFO_SYMBOL_SIDE + INFO_PADDING * 2, INFO_MARGIN_TOP + INFO_HEADER_HEIGHT + INFO_PADDING * 2 + i * INFO_LINE_HEIGHT);
			}
		}
		
		static drawTransferIcon = (ctx) => {			 
			let station1 = new Station(INFO_MARGIN_LEFT + INFO_PADDING, INFO_MARGIN_TOP + INFO_PADDING * 2 + INFO_LINE_HEIGHT * 4 - 5);		
			let station2 = new Station(INFO_MARGIN_LEFT + INFO_PADDING + INFO_SYMBOL_SIDE, INFO_MARGIN_TOP + INFO_PADDING * 2 + INFO_LINE_HEIGHT * 4 - 5);
			station1.transfer = station2;
			station1.drawTransferLine(ctx, true);
		}
		
		drawLines = (ctx) => {
			for (const line of metroNetwork.lines) {
				line.drawMetroLine(ctx);
			}

			for (const line of metroNetwork.lines) {
				for (const station of line.stations) {
					station.drawTransferLine(ctx, true);
				}
			}
		}
		
		addMetroLine = (x, y) => {
			if (metroNetwork.lines.length < MAX_LINES) {
				let line = new Line(x, y);
				line.randomize();
				metroNetwork.lines.push(line);
				
				for (const line of metroNetwork.lines) {
					for (const station of line.stations) {
						station.addTransfers(this);
					}
				}			
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
					this.drawQuadtree(ctx);
				this.drawLines(ctx);
				this.drawLinesInfo(ctx);
				this.populateQuadTree();			
			}
		}
	}

	class Point {
		constructor(x, y) {
			this.x = x;
			this.y = y;
		}
	}

	class Station {
		constructor(x, y, lineSymbol) {
			this.x = x;
			this.y = y;
			this.lineSymbol = lineSymbol;
			this.transfer = null;
		}

		drawStation = (ctx) => {
			Utils.drawCircle(ctx, this.x, this.y, 3, "#000", "#FFF");
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

			if (distance < LINE_TRANSFER_MAX_DISTANCE && station1.transfer == null && station2.transfer == null)  {
				station1.transfer = station2;
				station2.transfer = station1;
			}
		}

		drawTransferLine = (ctx, blackBorder = false) => {
			if (this.transfer == null) return;
			if (blackBorder) {
				ctx.strokeStyle = "#000";
				ctx.lineWidth = 6;
				ctx.lineCap = "round";
				ctx.beginPath();
				ctx.moveTo(this.x, this.y);
				ctx.lineTo(this.transfer.x, this.transfer.y);
				ctx.stroke();
			}

			ctx.strokeStyle = "#FFF";
			ctx.lineWidth = 5;
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

	class Line {
		constructor(x, y) {
			this.x = x;
			this.y = y;
			this.points = [];
			this.stations = [];
			this.symbol = ALPHABETIC_SYMBOL ? "A" : 1;
		}

		randomizeSymbol = () => {
			if (metroNetwork.lines.length > 0)
				if (ALPHABETIC_SYMBOL)
					this.symbol = Utils.nextCharacter(metroNetwork.lines[metroNetwork.lines.length - 1].symbol)
				else
					this.symbol = metroNetwork.lines[metroNetwork.lines.length - 1].symbol + 1;
		}

		randomizeColor = () => {
			this.hue = Utils.getRandomInt(1, 360);
			this.saturation = 100;
			this.light = Utils.getRandomInt(20, 50);
		}

		randomizePoints = () => {			
			let lastX = this.x;
			let lastY = this.y;
			let lastDirection = 0;
			let baseDirection = 45 * Utils.getRandomInt(0, 7);
			let numberOfPoints = Utils.getRandomInt(3, 12);		

			let firstPoint = new Point(this.x, this.y);
			this.points.push(firstPoint);
			let firstStation = new Station(this.x, this.y, this.symbol);
			this.stations.push(firstStation);

			for (let index = 0; index < numberOfPoints; index++) {
				let length = Utils.getRandomInt(20, 200);
				let direction = baseDirection + this.getDirection(lastDirection);

				let deltaX = Math.cos(direction * RAD_CONST) * length;
				let deltaY = Math.sin(direction * RAD_CONST) * length;

				let newX = lastX + deltaX;
				let newY = lastY + deltaY;
				let point = new Point(newX, newY);

				let infoHeight = INFO_MARGIN_TOP + INFO_HEADER_HEIGHT + MAX_LINES * INFO_LINE_HEIGHT;
				if (newX < INFO_MARGIN_LEFT + INFO_WIDTH && newY < INFO_MARGIN_TOP + infoHeight)
					continue;

				if (newX < 0 || newX > width || newY < 0 || newY > height)
					continue;

				this.addStation(length, direction, newX, newY, lastX, lastY);
			
				this.points.push(point);

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
					newStationX = lastX + Math.cos(segmentAngle * RAD_CONST) * (segmentLength / 2);
					newStationY = lastY + Math.sin(segmentAngle * RAD_CONST) * (segmentLength / 2);
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

		addStreet = () => {

		}

		randomize = () => {
			this.lineThickness = LINE_THICKNESS;

			this.randomizeColor();

			this.randomizeSymbol();

			this.randomizePoints();

		}

		getDirection = (lastDirection) => {
			return 45 * Utils.getRandomInt(0, 3);
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
			for (const point of this.points) {;
				ctx.lineTo(point.x, point.y);
			}
			ctx.stroke();
		}

		drawStations = (ctx) => {
			for (const element of this.stations) {
				const currentStation = element;
				currentStation.drawStation(ctx);
			}
		}

		colorBase = () => `hsl(${this.hue}, ${this.saturation}%, ${this.light}%)`;
	}

	class Quadtree {
		constructor(level, bounds) {

			this.MAX_OBJECTS = 5;
			this.MAX_LEVELS = 6;

			this.lines = [];

			this.level = level;
			this.bounds = bounds;
			this.nodes = new Array(4);
		}

		clear = () => {
			this.lines = [];

			for (let i = 0; i < this.nodes.length; i++) {
				if (this.nodes[i] != null) {
					this.nodes[i] = null;
				}
			}
		}

		split = () => {
			let subWidth = Math.floor(this.bounds.getWidth() / 2);
			let subHeight = Math.floor(this.bounds.getHeight() / 2);
			let x = this.bounds.getX();
			let y = this.bounds.getY();

			this.nodes[0] = new Quadtree(this.level + 1, new Rectangle(x + subWidth, y, subWidth, subHeight));
			this.nodes[1] = new Quadtree(this.level + 1, new Rectangle(x, y, subWidth, subHeight));
			this.nodes[2] = new Quadtree(this.level + 1, new Rectangle(x, y + subHeight, subWidth, subHeight));
			this.nodes[3] = new Quadtree(this.level + 1, new Rectangle(x + subWidth, y + subHeight, subWidth, subHeight));
		}

		getIndex = (rectangle) => {
			let index = -1;
			let verticalMidpoint = this.bounds.getX() + (this.bounds.getWidth() / 2);
			let horizontalMidpoint = this.bounds.getY() + (this.bounds.getHeight() / 2);

			let topQuadrant = (rectangle.getTop() < horizontalMidpoint && rectangle.getBottom() < horizontalMidpoint);
			let bottomQuadrant = (rectangle.getTop() > horizontalMidpoint);

			if (rectangle.getLeft() < verticalMidpoint && rectangle.getRight() < verticalMidpoint) {
				if (topQuadrant) {
					index = 1;
				}
				else if (bottomQuadrant) {
					index = 2;
				}
			}

			else if (rectangle.getLeft() > verticalMidpoint) {
				if (topQuadrant) {
					index = 0;
				}
				else if (bottomQuadrant) {
					index = 3;
				}
			}

			return index;
		}

		insert = (rectangle) => {
			if (this.nodes[0] != null) {
				let index = this.getIndex(rectangle);

				if (index != -1) {
					this.nodes[index].insert(rectangle);

					return;
				}
			}

			this.lines.push(rectangle);

			if (this.lines.length > this.MAX_OBJECTS && this.level < this.MAX_LEVELS) {
				if (this.nodes[0] == null) {
					this.split();
				}

				let i = 0;
				while (i < this.lines.length) {
					let index = this.getIndex(this.lines[i]);
					if (index != -1) {
						let removedItem = this.lines[i];
						this.lines.splice(i, 1);
						this.nodes[index].insert(removedItem);
					}
					else {
						i++;
					}
				}
			}
		}

		retrieve = (returnObjects, rectangle) => {
			let index = this.getIndex(rectangle);
			if (index != -1 && this.nodes[0] != null) {
				this.nodes[index].retrieve(returnObjects, rectangle);
			}

			returnObjects.push(...this.lines);

			return returnObjects;
		}
		
		static generateQuadtree = (width, height) => {
			return new Quadtree(0, new Rectangle(0, 0, width, height));
		}

		drawQuadtree = (ctx) => {
			if (this.quad != null) {
				if (this.quad.bounds != null) {
					ctx.strokeStyle = "#333";
					ctx.lineWidth = 1;
					ctx.strokeRect(this.quad.bounds.x, this.quad.bounds.y, this.quad.bounds.width, this.quad.bounds.height);
				}
				if (this.quad.nodes != null) {
					this.quad.nodes.forEach(function (node) {
						drawQuadtree(ctx, node);
					});
				}
			}
		}
	}

	class Rectangle {
		constructor(x, y, w, h) {
			this.x = x;
			this.y = y;
			this.width = w;
			this.height = h;
		}

		getWidth = () => this.width;
		getHeight = () => this.height;
		getX = () => this.x;
		getY = () => this.y;
		getTop = () => this.y;
		getBottom = () => this.y + this.height;
		getLeft = () => this.x;
		getRight = () => this.x + this.width;
	}

	class Utils {
		
		static getRandomInt = (min, max) => {
			return Math.floor(Math.random() * max) + min;
		}

		static getRandomFloat = (min, max, decimals) => {
			const str = (Math.random() * (max - min) + min).toFixed(
				decimals,
			);

			return parseFloat(str);
		}

		static getRandomBool = () => {
			return Math.random() < 0.5;
		}
		
		static nextCharacter = (c) => {
			return String.fromCharCode(c.charCodeAt(0) + 1);
		}
		
		static drawCircle = (ctx, x, y, radio, color = '#00FF00', fillColor = '#00FF00') => {
			ctx.strokeStyle = color;
			ctx.fillStyle = fillColor;
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.arc(x, y, radio, 0, 2 * Math.PI);
			ctx.fill();
			ctx.stroke();
		}

		static drawRectangle = (ctx, x, y, width, height, color = '#FFF', fillColor = '#00FF00') => {
			ctx.strokeStyle = color;
			ctx.fillStyle = fillColor;
			ctx.beginPath();
			ctx.rect(x, y, width, height);
			ctx.fill();
			ctx.stroke();
		}
	}

	let init = () => {
		width = window.innerWidth;
		height = window.innerHeight;
		metroNetwork = new MetroNetwork()		
		randomize();
		addEvents();
	}

	let addEvents = () => {
		let canvas = document.getElementById(CANVAS_ID);

		canvas.addEventListener('click', e => {
			metroNetwork.addMetroLine(e.offsetX, e.offsetY);
		}, false);
	}
	
	let randomize = () => {
		ALPHABETIC_SYMBOL = Utils.getRandomBool();
	}
	
	let drawFrame = (ctx, canvas) => {
		canvas.width = width;
		canvas.height = height;
		ctx.fillStyle = "#000";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.lineWidth = 1;
		ctx.strokeStyle = '#000000';
		ctx.strokeRect(0, 0, width, height);
	}

	let draw = () => {	
		let canvas = document.getElementById(CANVAS_ID);
		if (canvas.getContext) {
			let ctx = canvas.getContext('2d')
			drawFrame(ctx, canvas);
			metroNetwork.draw(ctx);
		}
	}

	let loop = (timestamp) => {
		let progress = timestamp - lastRender;

		draw();

		lastRender = timestamp;
		window.requestAnimationFrame(loop);
	}

	init();

	window.requestAnimationFrame(loop);

}