 
{
    let crtRows = 50
    let crtColumns = 50;
    let crtMargin = 0;
    let crtPadding = 0;
    let crtDiameter = 20;
    let hue = 150;
    let crtScreen;
    
    class CrtScreen {
        constructor() {
            this.crts = [];       
            this.generateCrts();          
        }

        generateCrts = () => {
            for (let x = 0; x < crtColumns; x++) {
                this.crts[x] = new Array(crtRows);
            }

            for (let x = 0; x < crtColumns; x++) {
                for (let y = 0; y < crtRows; y++) {
                    let crt = new Crt(x, y);
                    this.crts[x][y] = crt;
                }
            }
        }

        setPixel = (x, y) => {            
            let col = Math.round((x - crtMargin) / ((crtDiameter) + crtPadding));
            let row = Math.round((y - crtMargin) / ((crtDiameter) + crtPadding));
            //this.crts[col][row].on = true;
        }

        draw = (ctx) => {
            for (let x = 0; x < crtColumns; x++) {
                for (let y = 0; y < crtRows; y++) {
                    this.crts[x][y].draw(ctx);
                }
            }
        }

        update = () => {                           
        }
    }

    class Crt {
        constructor(column, row) {
            this.diameter = crtDiameter;
            this.row = row;
            this.column = column;
            this.r = 0;
            this.g = 0;
            this.b = 0;
            this.x = crtMargin + column * crtPadding + column * this.diameter;
            this.y = crtMargin + row * crtPadding + row * this.diameter;
        }

        draw = (ctx) => {
            let borderColor = '#000';
            let third = this.diameter / 3;
            
            let colorR = `hsl(${0}, 100%, 50%)`;
            let colorG = `hsl(${120}, 100%, 50%)`;
            let colorB = `hsl(${255}, 100%, 50%)`;
            Utils.drawRectangle(ctx, this.x, this.y, third, this.diameter, borderColor, colorR)
            Utils.drawRectangle(ctx, this.x + third, this.y, third, this.diameter, borderColor, colorG)
            Utils.drawRectangle(ctx, this.x + third * 2, this.y, third, this.diameter, borderColor, colorB)
        }
    }

    let init = () => {
        initCanvas();
        crtDiameter = Utils.getRandomInt(5, 20);        
        crtPadding = 0;
        crtMargin = 0;

        randomize();

        crtRows = Math.floor((height - crtMargin)/ (crtDiameter + crtPadding));
        crtColumns = Math.floor((width - crtMargin)/ (crtDiameter + crtPadding));
        crtScreen = new CrtScreen();
        
        addEvents();
    }

    let addEvents = () => {   
        /*     
		canvas.addEventListener('click', e => {
			crtScreen.setPixel(e.offsetX, e.offsetY);
		}, false);
        
		canvas.addEventListener('mousemove', e => {
			crtScreen.setPixel(e.offsetX, e.offsetY);
		}, false);

		canvas.addEventListener('touchstart', function(e){
			crtScreen.setPixel(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
		});

		canvas.addEventListener('touchmove', function(e){
			e.preventDefault();
			crtScreen.setPixel(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
		});	
        */
    }

    let randomize = () => {        
        hue = Utils.getRandomInt(0, 255);
    }

    let draw = () => {
        drawBackground(ctx, canvas);
        crtScreen.draw(ctx);
    }

    let loop = (timestamp) => {
        let progress = timestamp - lastRender;

        crtScreen.update();

        draw();

        lastRender = timestamp;
        window.requestAnimationFrame(loop);
    }

    init();

    window.requestAnimationFrame(loop);
}
