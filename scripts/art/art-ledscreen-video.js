{    
    const globals = {
        random: null,
        ledScreen: null,
        canvasImg: document.getElementById('auxCanvas'),
        ctxImg: null,
        img: new Image(),
        imgData: null,
        frames: [],
    };

    const config = { 
        randomize: true,
        ledRows: 50,
        ledColumns: 50,
        ledMargin: 30,
        ledPadding: 30,
        ledDiameter: 20,
        hue: 150,
        valueIncrement: 1,
        mode: 1,
        alternatePixel: false,
        shape: null,
    };
    
    const Figures = Object.freeze({
		/*Square: Symbol("square"),
		Circle: Symbol("circle"),
        Hexagon: Symbol("hexagon"),
        Emoji: Symbol("Emoji"),
        Ascii: Symbol("Ascii"),
        Ansi: Symbol("Ansi"),
        Gameboy: Symbol("Gameboy"),
        Character: Symbol("Character"),*/
        Bar: Symbol("Bar"),
	});

    class LedScreen {
        constructor() {      
            this.generateLeds();          
			this.shape = config.shape;
        }

        generateLeds = () => {
            this.leds = []; 
            for (let x = 0; x <= config.ledColumns; x++) {
                this.leds[x] = new Array(config.ledRows);
            }

            for (let x = 0; x <= config.ledColumns; x++) {
                for (let y = 0; y <= config.ledRows; y++) {
                    let led = new Led(x, y);
                    this.leds[x][y] = led;
                }
            }
        }

        setPixel = (x, y) => {            
            let col = Math.round((x - config.ledMargin) / ((config.ledDiameter) + config.ledPadding));
            let row = Math.round((y - config.ledMargin) / ((config.ledDiameter) + config.ledPadding));
            if (col > config.ledColumns - 1 || row > config.ledRows - 1 || col < 0 || row < 0) return;
            if (this.leds[col][row].value < 255) this.leds[col][row].value += config.valueIncrement;
        }

        draw = (ctx) => {
            for (let x = 0; x <= config.ledColumns; x++) {
                for (let y = 0; y <= config.ledRows; y++) {
                    this.leds[x][y].draw(ctx);
                }
            }
        }

        update = () => {                           
        }
    }

    class Led {
        constructor(column, row) {
            this.diameter = config.ledDiameter;
            this.radius = config.ledDiameter / 2;
            this.row = row;
            this.column = column;
            this.x = config.ledMargin + column * config.ledPadding + column * this.diameter;
            this.y = config.ledMargin + row * config.ledPadding + row * this.diameter;
            if (config.alternatePixel)
                this.y = this.column % 2 == 0 ? this.y : this.y + this.radius;
            this.value = 0;
        }

        draw = (ctx) => {
            let color = null;
            let size = null;
            
            if (config.mode) {
                color = `hsl(${config.hue}, 100%, ${this.value}%)`
                size = this.radius;
            }
            else{
                color = `hsl(${config.hue}, 100%, 50%)`;
                size = Numbers.scale(this.value, 0, 255, 0, config.ledDiameter + config.ledMargin);
            }
            let value = 0;
            switch(globals.ledScreen.shape){
                
                case Figures.Circle:
                    Drawing.drawCircle(ctx, this.x, this.y, size, color)
                    break;
                case Figures.Square:                    
                    Drawing.drawRectangle(ctx, this.x - size, this.y - size, size * 2, size * 2, color);
                    break;
                case Figures.Hexagon:
                    Drawing.drawPolygon(ctx, this.x, this.y, size, 6, 0, color);
                    break;
                case Figures.Emoji:
                    SpecialPixels.drawEmoji(ctx, this.x, this.y, this.value);
                    break;
                case Figures.Ascii:             
                    SpecialPixels.drawAscii(ctx, this.x, this.y, this.value);
                    break;
                case Figures.Ansi:    
                    SpecialPixels.drawAnsi(ctx, this.x, this.y, this.value);
                    break;
                case Figures.Gameboy:    
                    value = Numbers.scale(this.value, 0, 100, 0, 255);
                    SpecialPixels.drawGameboy(ctx, this.x, this.y, config.ledDiameter, value);
                    break;
                case Figures.Character:    
                    value = Numbers.scale(this.value, 0, 100, 5, 40);
                    SpecialPixels.drawCharacter(ctx, this.x, this.y, value);
                    break;
                case Figures.Bar:    
                    let angle = Numbers.scale(this.value, 0, 100, 0, 360);
                    SpecialPixels.drawBar(ctx, this.x, this.y, config.ledDiameter, angle);
                    break;
            }
        }
    }
        
    let loadVideo = async (url) => {
        Browser.showSpinner();
        globals.frames = [];
        const video = document.createElement("video");
        video.src = url;
        video.crossOrigin = "anonymous";
        video.muted = true; 
        await video.play(); 
        video.pause();

        await new Promise(res => {
            if (video.readyState >= 2) res();
            else video.onloadeddata = res;
        });

        const fps = 30; 
        const duration = video.duration;
        const totalFrames = Math.floor(duration * fps);

        globals.canvasImg.width = config.ledColumns;
        globals.canvasImg.height = config.ledRows;

        const { newImgHeight, newImgWidth, newOriginX, newOriginY } = Screen.adaptVideoToScreen(video, globals.canvasImg);
    
        for (let i = 0; i < totalFrames; i++) {
            const t = i / fps;
            video.currentTime = t;
            await new Promise(resolve => video.addEventListener("seeked", resolve, { once: true }));
            globals.ctxImg.drawImage(video, newOriginX, newOriginY, newImgWidth, newImgHeight);

            const frameData = globals.ctxImg.getImageData(0, 0, config.ledColumns, config.ledRows).data;
            globals.frames.push(frameData);            
        }       

        Browser.hideSpinner();

        let i = 0;
        const total = globals.frames.length;
        const frameDuration = 1000 / fps;
        let lastTime = 0;

        function animate(timestamp) {
            if (!lastTime) lastTime = timestamp;
            const delta = timestamp - lastTime;

            if (delta >= frameDuration) {
                const frame = globals.frames[i];

                for (let y = 0; y < config.ledRows; y++) {
                    for (let x = 0; x < config.ledColumns; x++) {
                        const index = (y * config.ledColumns + x) * 4;
                        const r = frame[index];
                        const g = frame[index + 1];
                        const b = frame[index + 2];
                        const lightness = Color.getLightness(r, g, b);

                        if (config.mode)
                            globals.ledScreen.leds[x][y].value = Numbers.scale(lightness, 0, 250, 0, 100);
                        else
                            globals.ledScreen.leds[x][y].value = lightness;
                    }
                }

                drawBackground(ctx, canvas);
                globals.ledScreen.draw(ctx);

                i++;
                if (i >= total) i = 0; 

                lastTime = timestamp;
            }

            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
    };

    let init = () => {
        initCanvas();
        globals.ctxImg = globals.canvasImg.getContext("2d", { willReadFrequently: true });
        if (config.randomize) randomize();
        config.ledRows = Math.floor((height - config.ledMargin)/ (config.ledDiameter + config.ledPadding));
        config.ledColumns = Math.floor((width - config.ledMargin)/ (config.ledDiameter + config.ledPadding));
        globals.ledScreen = new LedScreen();
        
        addEvents();
        window.requestAnimationFrame(loop)
    
        loadVideo("assets/Video1.mp4");
    }

    let addEvents = () => {   
    }

    let randomize = () => {            
		globals.random = Objects.getRandomObject();
        config.mode = globals.random.nextBool();
        let rand = globals.random.nextInt(0, Object.keys(Figures).length - 1);  
        config.shape = Figures[Object.keys(Figures)[rand]];
        config.ledDiameter = globals.random.nextInt(5, 20);        
        config.ledPadding = config.shape != Figures.Gameboy ? globals.random.nextInt(0, 20) : 0;
        config.ledMargin = config.ledPadding;  
        config.hue = globals.random.nextInt(0, 255);    
        config.alternatePixel = config.shape != Figures.Gameboy ? globals.random.nextBool() : false;
    }

    window.draw = () => {
        globals.ledScreen.update();
        drawBackground(ctx, canvas);
        globals.ledScreen.draw(ctx);
    }

    window.trackMouse = (xMouse, yMouse) => {
    }

	window.clearCanvas = () => {		
        globals.ledScreen.generateLeds();  
	}

	window.magic = () => {  
		Sound.error();
	}

    window.upload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        
        loadVideo(url);
    }

    init();
}
