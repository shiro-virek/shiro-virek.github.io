{
    let CANVAS_ID = "myCanvas"
    let RAD_CONST = 0.0175;
    
    let ledRows = 10;
    let ledColumns = 50;

    let width = 0;
    let height = 0;    

	let lastRender = 0;
    
	let lastPosY = null;
	let lastPosX = null;

    let canvas;
    let ctx;

    let ledSreen;

    class LedScreen {
        constructor(){
            this.leds = [];
            this.generateLeds();
        } 

        generateLeds = () => {
            for (let x = 0; x < ledColumns; x++) {
                this.leds[x] = new Array(ledRows);                      
            }

            for (let x = 0; x < ledColumns; x++) {
                for (let y = 0; y < ledRows; y++) {
                    let led = new Led(x, y);
                    this.leds[x][y] = led;
                }                         
            }
        }
    
        draw = (ctx) => {          
            for (let x = 0; x < ledColumns; x++) {
                for (let y = 0; y < ledRows; y++) {
                    this.leds[x][y].draw(ctx);
                }                         
            }
        }
    }
    
    class Led {
        constructor(x, y){
            this.x = x;
            this.y = y;
            this.on = true;
            this.color = "#ff8000";
        }       

        draw = (ctx) => {
            if (this.on) Utils.drawCircle(ctx, 30 + this.x * 20 + this.x * 10, 30 + this.y * 20 + this.y * 10, 10, this.color, this.color)    
        }
    }
    
	class Utils {
        static scale = (number, inMin, inMax, outMin, outMax) => {
            return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
        }
    

		static shuffleArray = (array) => {
			for (let i = array.length - 1; i > 0; i--) {
			    const j = Math.floor(Math.random() * (i + 1));
                const temp = array[i];
                array[i] = array[j];
                array[j] = temp;
			}
		}		  
		
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
            
        static drawLine = (ctx, x1, y1, x2, y2, color = '#FFF') => {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineWidth = "2"
            ctx.strokeStyle = color;
            ctx.stroke();
        }

        static drawDot = (ctx, x, y, color = '#FFF') => {
			ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, 2 * Math.PI, false);
            ctx.fill();
		}
	}

    let init = () => {
        width = window.innerWidth;
        height = window.innerHeight;  

		canvas = document.getElementById(CANVAS_ID);
		if (canvas.getContext) 
			ctx = canvas.getContext('2d');

        ledScreen = new LedScreen();
        randomize();
        addEvents();
    }

    let addEvents = () => {
        canvas.addEventListener('click', e => {
            //world.addCube(e.offsetX, e.offsetY);            
        }, false);

		canvas.addEventListener('mousemove', e => {
			trackMouse(e.offsetX, e.offsetY);
		}, false);
        
		canvas.addEventListener('touchstart', function(e){            
            //world.addCube(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
		});

		canvas.addEventListener('touchmove', function(e){
			e.preventDefault();
			trackMouse(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
		});	
    }

    let trackMouse = (x, y) => {		
        if (lastPosX == 0) lastPosX = x;
		if (lastPosY == 0) lastPosY = y;

        let movX = lastPosX - x;
        let movY = lastPosY - y;

        /*
        world.figures.forEach(figure => {
            figure.rotateX(movY);
            figure.rotateY(movX);
        });
        */
        
		lastPosX = x;
		lastPosY = y;
    }

    let randomize = () => {	
    }
        
    let drawBackground = (ctx, canvas) => {
        canvas.width = width;
        canvas.height = height;
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#000000';
        ctx.strokeRect(0, 0, width, height);
    }

    let draw = () => {	
        drawBackground(ctx, canvas);
        ledScreen.draw(ctx);        				 	
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
