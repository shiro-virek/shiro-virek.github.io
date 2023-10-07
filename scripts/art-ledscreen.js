{
    let CANVAS_ID = "myCanvas"
    let RAD_CONST = 0.0175;
    
    let ledRows = 50;
    let ledColumns = 50;

    let ledMargin = 30;
    let ledPadding = 20;
    let ledRadio = 10;

    let width = 0;
    let height = 0;    

	let lastRender = 0;

    let hue = 150;
    
	let lastPosY = null;
	let lastPosX = null;

    let canvas;
    let ctx;

    let ledScreen;

    let radioFunctions = [];
    let colorFunctions = [];
    let xPositionFunctions = [];
    let yPositionFunctions = [];


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

    class ModifierFunctions {
        static getRadio1 = (dist) => {
            return Utils.scale(dist, 0, 500, 5, 15);
        }

        static getRadio2 = (dist) => {
            let decrement = Utils.scale(dist, 0, 500, 5, 15);
            return decrement < 20 ? 20 - decrement : 1;
        }

        static getColor1 = (dist) => {   
            return `hsl(${hue}, ${Utils.scale(dist, 0, 500, 0, 100)}%, 50%)`;       
        }

        static getColor2 = (dist) => {   
            return `hsl(${hue}, 100%, ${Utils.scale(dist, 0, 500, 0, 100)}%)`;       
        }

        static getXPosition1 = (dist, x, y, angle) => {
            return x - Utils.scale(dist, 0, 500, -50, 50); 
        }
        
        static getXPosition2 = (dist, x, y, angle) => {
            return x + Math.cos((angle + 180) * RAD_CONST) * 50;
        }
        
        static getYPosition1 = (dist, x, y, angle) => {
            return y - Utils.scale(dist, 0, 500, -50, 50);
        }
        
        static getYPosition2 = (dist, x, y, angle) => {
            return y + Math.sin((angle + 180) * RAD_CONST) * 50;
        }
    }
    
    class Led {
        constructor(column, row){
            this.radio = ledRadio;
            this.row = row;
            this.column = column;
            this.x = ledMargin + column * ledPadding + column * this.radio;
            this.y = ledMargin + row * ledPadding + row * this.radio;
            this.on = true;
            this.color = `hsl(${hue}, 100%, 50%)`;
        }       

        draw = (ctx) => {
            if (this.on) 
                Utils.drawCircle(ctx, this.x, this.y, this.radio, this.color, this.color)    
        }
        
        update = (xMouse, yMouse) => {
            if (xMouse >= this.x - this.radio && xMouse <= this.x + this.radio && yMouse >= this.y - this.radio && yMouse <= this.y + this.radio) {
                this.color = "#ffff00";
            }else{
                this.color = "#ff8000";
            }

            let xLed = ledMargin + this.column * ledPadding + this.column * ledRadio
            let yLed = ledMargin + this.row * ledPadding + this.row * ledRadio;
                        
            let dist = Math.sqrt(Math.pow(xLed - xMouse, 2) + Math.pow(yLed - yMouse, 2));
            let angle = Utils.angleBetweenTwoPoints(xLed, yLed, xMouse, yMouse);
         
            this.radio = radioFunctions[1](dist);
            this.color = colorFunctions[1](dist); 
   
            this.x = xPositionFunctions[1](dist, xLed, yLed, angle);                   
            this.y = yPositionFunctions[1](dist, xLed, yLed, angle);
        }
    }
    
	class Utils {
        static scale = (number, inMin, inMax, outMin, outMax) => {
            return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
        }
    
        static angleBetweenTwoPoints(x1, y1, x2, y2) {
            var angle = Math.atan2(y2 - y1, x2 - x1); 
            angle *= 180 / Math.PI; 
            if (angle < 0) angle = 360 + angle;
            return angle;
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
        addModifierFunctions();
        randomize();        
        addEvents();
    }

    let addModifierFunctions = () => {
        radioFunctions = [
            ModifierFunctions.getRadio1,
            ModifierFunctions.getRadio2
        ];    

        colorFunctions = [
            ModifierFunctions.getColor1,
            ModifierFunctions.getColor2
        ];        
        xPositionFunctions = [
            ModifierFunctions.getXPosition1,
            ModifierFunctions.getXPosition2
        ];  
        yPositionFunctions = [            
            ModifierFunctions.getYPosition1,
            ModifierFunctions.getYPosition2
        ];
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

    let trackMouse = (xMouse, yMouse) => {		
        if (lastPosX == 0) lastPosX = xMouse;
		if (lastPosY == 0) lastPosY = yMouse;

        let movX = lastPosX - xMouse;
        let movY = lastPosY - yMouse;

        for (let x = 0; x < ledColumns; x++) {
            for (let y = 0; y < ledRows; y++) {                
                ledScreen.leds[x][y].update(xMouse, yMouse);                
            }                         
        }
        

		lastPosX = xMouse;
		lastPosY = yMouse;
    }

    let randomize = () => {	
        hue = Utils.getRandomInt(0, 360);
        ledRows = height / (ledRadio * 2 + ledPadding);
        ledColumns = width / (ledRadio * 2 + ledPadding);
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
