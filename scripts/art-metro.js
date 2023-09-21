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
	let MAX_LINES = 15;
	let LINE_TRANSFER_MAX_DISTANCE = 30;

	let INFO_MARGIN_TOP = 10;
	let INFO_MARGIN_LEFT = 10;
	let INFO_SYMBOL_SIDE = 15;
	let INFO_LINE_HEIGHT = 20;
	let INFO_HEADER_HEIGHT = 80;
	let INFO_PADDING = 10;
	let INFO_WIDTH = 100;

	let lastRender = 0

	let objects = [];

	let quad;

	const LineTypes = Object.freeze({
		Regular: Symbol("regular")
	});

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
		}

		drawStation = (ctx) => {
			drawCircle(ctx, this.x, this.y, 3, "#000", "#FFF");

			this.drawTransfers(ctx);
		}

		drawTransfers = (ctx) => {
			let returnObjects = [];

			quad.retrieve(returnObjects, this);

			for (let x = 0; x < returnObjects.length; x++) {
				let otherStation = returnObjects[x];

				if (otherStation == this || otherStation.lineSymbol == this.lineSymbol)
					continue;

				let catX = Math.abs(this.x - otherStation.x);
				let catY = Math.abs(this.y - otherStation.y);
				let distance = Math.sqrt(catX * catX + catY * catY);

				if (distance < LINE_TRANSFER_MAX_DISTANCE) {
					ctx.strokeStyle = "#FFF";
					ctx.lineWidth = 10;
					ctx.line = "round";
					ctx.beginPath();
					ctx.moveTo(this.x, this.y);
					ctx.lineTo(otherStation.x, otherStation.y);
					ctx.stroke();
				}
			}
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
			let numberOfPoints = getRandomInt(3, 12);
			let stationThresholdMax = 100;
			let stationThresholdMin = 50;

			let firstPoint = new Point(this.x, this.y);
			this.points.push(firstPoint);
			let firstStation = new Station(this.x, this.y, this.symbol);
			this.stations.push(firstStation);

			for (let index = 0; index < numberOfPoints; index++) {
				let length = getRandomInt(20, 200);
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

				let newStationX = 0;
				let newStationY = 0;

				if (length > stationThresholdMin) {
					if (length < stationThresholdMax) {
						newStationX = newX;
						newStationY = newY;
					} else {
						newStationX = lastX + Math.cos(direction * RAD_CONST) * (length / 2);
						newStationY = lastY + Math.sin(direction * RAD_CONST) * (length / 2);
					}

					let newStation = new Station(newStationX, newStationY, this.symbol);
					this.stations.push(newStation);
				}

				this.points.push(point);

				lastX = newX;
				lastY = newY;

				lastDirection = direction;
			}


			let lastAddedStation = this.stations[this.stations.length - 1];

			if (lastAddedStation.x != lastX && lastAddedStation.y != lastY) {
				let endStation = new Station(lastX, lastY, this.symbol);
				this.stations.push(endStation);
			}
		}

		getDirection = (lastDirection) => {
			return 45 * getRandomInt(0, 3);
		}

		drawMetroLine = (ctx) => {
			ctx.lineCap = "round";
			ctx.lineWidth = this.lineThickness;
			ctx.strokeStyle = this.colorBase();
			ctx.beginPath();
			ctx.moveTo(this.x, this.y);

			this.drawSegments(ctx);
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
				const currentStation = this.stations[index];
				currentStation.drawStation(ctx);
			}
		}

		colorBase = () => `hsl(${this.hue}, ${this.saturation}%, ${this.light}%)`;
	}

	class Quadtree {
		constructor(pLevel, pBounds) {

			this.MAX_OBJECTS = 5;
			this.MAX_LEVELS = 6;

			this.objects = [];

			this.level = pLevel;
			this.bounds = pBounds;
			this.nodes = new Array(4);
		}

		clear = () => {
			this.objects = [];

			for (let i = 0; i < this.nodes.length; i++) {
				if (this.nodes[i] != null) {
					//nodes[i].clear();
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

		getIndex = (pRect) => {
			let index = -1;
			let verticalMidpoint = this.bounds.getX() + (this.bounds.getWidth() / 2);
			let horizontalMidpoint = this.bounds.getY() + (this.bounds.getHeight() / 2);

			let topQuadrant = (pRect.getTop() < horizontalMidpoint && pRect.getBottom() < horizontalMidpoint);
			let bottomQuadrant = (pRect.getTop() > horizontalMidpoint);

			if (pRect.getLeft() < verticalMidpoint && pRect.getRight() < verticalMidpoint) {
				if (topQuadrant) {
					index = 1;
				}
				else if (bottomQuadrant) {
					index = 2;
				}
			}

			else if (pRect.getLeft() > verticalMidpoint) {
				if (topQuadrant) {
					index = 0;
				}
				else if (bottomQuadrant) {
					index = 3;
				}
			}

			return index;
		}

		insert = (pRect) => {
			if (this.nodes[0] != null) {
				let index = this.getIndex(pRect);

				if (index != -1) {
					this.nodes[index].insert(pRect);

					return;
				}
			}

			this.objects.push(pRect);

			if (this.objects.length > this.MAX_OBJECTS && this.level < this.MAX_LEVELS) {
				if (this.nodes[0] == null) {
					this.split();
				}

				let i = 0;
				while (i < this.objects.length) {
					let index = this.getIndex(this.objects[i]);
					if (index != -1) {
						let removedItem = this.objects[i];
						this.objects.splice(i, 1);
						this.nodes[index].insert(removedItem);
					}
					else {
						i++;
					}
				}
			}
		}

		retrieve = (returnObjects, pRect) => {
			let index = this.getIndex(pRect);
			if (index != -1 && this.nodes[0] != null) {
				this.nodes[index].retrieve(returnObjects, pRect);
			}

			returnObjects.push(...this.objects);

			return returnObjects;
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

	init = () => {
		generateQuadtree();
		randomize();
		addEvents();
		drawFrame();
	}

	generateQuadtree = () => {
		quad = new Quadtree(0, new Rectangle(0, 0, width, height));
	}

	drawQuadtree = (ctx, quad) => {
		if (quad != null) {
			if (quad.bounds != null) {
				ctx.strokeStyle = "#FFF";
				ctx.lineWidth = 1;
				ctx.strokeRect(quad.bounds.x, quad.bounds.y, quad.bounds.width, quad.bounds.height);
			}
			if (quad.nodes != null) {
				quad.nodes.forEach(function (node) {
					drawQuadtree(ctx, node);
				});
			}
		}
	}

	populateQuadTree = (quad) => {
		quad.clear();
		for (let i = 0; i < LINES_COUNT; i++) {
			for (let j = 0; j < objects[i].stations.length; j++) {
				quad.insert(objects[i].stations[j]);
			}
		}
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
		for (let i = 0; i < LINES_COUNT; i++) {
			for (let j = 1; j < objects[i].points.length; j++) {
				linesLength += Math.floor(Math.sqrt(Math.pow(objects[i].points[j].x - objects[i].points[j - 1].x, 2) + Math.pow(objects[i].points[j].y - objects[i].points[j - 1].y, 2)));
			}
		}
		return Math.floor(linesLength / 100);
	}

	drawLinesInfo = (ctx, canvas) => {
		ctx.fillStyle = "#FFF";
		let infoWidth = INFO_WIDTH;
		let infoHeight = INFO_MARGIN_TOP + INFO_HEADER_HEIGHT + LINES_COUNT * INFO_LINE_HEIGHT;
		ctx.fillRect(INFO_MARGIN_LEFT, INFO_MARGIN_TOP, infoWidth, infoHeight);
		ctx.lineWidth = 1;
		ctx.strokeStyle = '#000000';
		ctx.strokeRect(INFO_MARGIN_LEFT, INFO_MARGIN_TOP, infoWidth, infoHeight);

		ctx.font = "10px Arial";
		ctx.fillStyle = "#000";
		ctx.fillText(`City Metro System`, INFO_MARGIN_LEFT + INFO_PADDING, INFO_MARGIN_TOP + INFO_PADDING * 2);
		ctx.fillText(`Stations: ${getNumberOfStations()}`, INFO_MARGIN_LEFT + INFO_PADDING, INFO_MARGIN_TOP + INFO_PADDING * 2 + INFO_LINE_HEIGHT);
		ctx.fillText(`Lines: ${getNumberOfLines()}`, INFO_MARGIN_LEFT + INFO_PADDING, INFO_MARGIN_TOP + INFO_PADDING * 2 + INFO_LINE_HEIGHT * 2);
		ctx.fillText(`Length: ${getLinesLength()} km.`, INFO_MARGIN_LEFT + INFO_PADDING, INFO_MARGIN_TOP + INFO_PADDING * 2 + INFO_LINE_HEIGHT * 3);

		for (let i = 0; i < LINES_COUNT; i++) {
			drawRectangle(ctx, INFO_MARGIN_LEFT + INFO_PADDING, INFO_MARGIN_TOP + INFO_HEADER_HEIGHT + INFO_PADDING + i * INFO_LINE_HEIGHT, INFO_SYMBOL_SIDE, INFO_SYMBOL_SIDE, '#000', objects[i].colorBase());
			ctx.fillStyle = "#000";
			ctx.fillText(`Line ${objects[i].symbol}`, INFO_MARGIN_LEFT + INFO_SYMBOL_SIDE + INFO_PADDING * 2, INFO_MARGIN_TOP + INFO_HEADER_HEIGHT + INFO_PADDING * 2 + i * INFO_LINE_HEIGHT);
		}
	}

	drawFrame = () => {
		let canvas = document.getElementById(CANVAS_ID);
		if (canvas.getContext) {
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
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.arc(x, y, radio, 0, 2 * Math.PI);
		ctx.fill();
		ctx.stroke();
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
		let canvas = document.getElementById(CANVAS_ID);
		if (canvas.getContext) {			
			let ctx = canvas.getContext('2d');			
			for (let i = 0; i < LINES_COUNT; i++) {
				objects[i].drawMetroLine(ctx);
			}
			for (let i = 0; i < LINES_COUNT; i++) {
				objects[i].drawStations(ctx);
			}
		}
	}
	
	nextCharacter = (c) => {
		return String.fromCharCode(c.charCodeAt(0) + 1);
	}

	addMetroLine = (x, y) => {
		if (LINES_COUNT < MAX_LINES) {
			let line = new Line(x, y);
			line.randomize();
			objects.push(line);
			LINES_COUNT++;
		}
	}

	draw = () => {
		drawFrame();

		if (LINES_COUNT > 0) {
			let canvas = document.getElementById(CANVAS_ID);
			if (canvas.getContext) {
				let ctx = canvas.getContext('2d')
				drawLines(ctx);
				drawLinesInfo(ctx, canvas);
				//drawQuadtree(ctx, quad);
				populateQuadTree(quad);
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