{
    let CANVAS_ID = "myCanvas"
    let RAD_CONST = 0.0175;

    let ledRows = 50;
    let ledColumns = 50;

    let ledMargin = 30;
    let ledPadding = 30;
    let ledDiameter = 20;

    let width = 0;
    let height = 0;

    let lastRender = 0;

    let hue = 150;

    let lastPosY = null;
    let lastPosX = null;

    let canvas;
    let ctx;

    let ledScreen;
    
	const Attribute = Object.freeze({
		Diameter: Symbol("diameter"),
		Hue: Symbol("hue"),		
		Saturation: Symbol("saturation"),
		Lightness: Symbol("lightness")		
	});
        
	const Condition = Object.freeze({
		Lower: Symbol("lower"),		
		Greater: Symbol("greater"),
        Equal: Symbol("equal"),
        Between: Symbol("between")
	});

    class RuleSet{
        constructor(localRule, neighboursRule) {
            this.localRule = localRule;
            this.neighboursRule = neighboursRule;
        }
    }

    class Rule {
        constructor(condition, value, value2, attribute, amount){
            this.value = value;
            this.value2 = value2;
            this.condition = condition;
            this.attribute = attribute;
            this.amount = amount;
        }
    }

    class LedScreen {
        constructor() {
            this.leds = [];
            this.ledsBuffer = [];         
            this.rules = [];   
            this.generateLeds();
        }

        generateLeds = () => {
            for (let x = 0; x < ledColumns; x++) {
                this.leds[x] = new Array(ledRows);
                this.ledsBuffer[x] = new Array(ledRows);
            }

            for (let x = 0; x < ledColumns; x++) {
                for (let y = 0; y < ledRows; y++) {
                    let led = new Led(x, y);
                    this.leds[x][y] = led;
                    let ledBuffer = new Led(x, y);
                    this.ledsBuffer[x][y] = ledBuffer;
                }
            }
        }

        draw = (ctx) => {
            for (let x = 0; x < ledColumns; x++) {
                for (let y = 0; y < ledRows; y++) {
                    this.ledsBuffer[x][y].draw(ctx);
                }
            }
        }

        copyBuffer = () => {
            for (let x = 0; x < ledColumns; x++) {
                for (let y = 0; y < ledRows; y++) {
                    this.leds[x][y].diameter =  this.ledsBuffer[x][y].diameter;
                    this.leds[x][y].hue =  this.ledsBuffer[x][y].hue;
                    this.leds[x][y].saturation =  this.ledsBuffer[x][y].saturation;
                    this.leds[x][y].lightness =  this.ledsBuffer[x][y].lightness;
                }
            }    
        }

        getLedValueSafe = (x, y, rule) => {
            if (x < 0 || y < 0 || x >= ledColumns || y >= ledRows)
                return 0
            else
                switch(rule.attribute){
                    case Attribute.Diameter:
                        return this.leds[x][y].diameter;
                    case Attribute.Hue:
                        return this.leds[x][y].hue;
                    case Attribute.Saturation:
                        return this.leds[x][y].saturation;
                    case Attribute.Lightness:
                        return this.leds[x][y].lightness;
                }
        }

        ruleFulfilled = (rule, sum) => {
            let result = false;
            switch(rule.condition){
				case Condition.Lower:
					result = (sum < rule.value);
					break;
				case Condition.Greater:
					result = (sum > rule.value);
					break;		
                case Condition.Equal:
                    result = (sum == rule.value);
                    break;		
                case Condition.Between:
                    result = (sum >= rule.value && sum <= rule.value2);
                    break;		
			}
            return result;
        }

        applyRule = (rule, led) => {
			switch(rule.attribute){
				case Attribute.Diameter:
					led.diameter *= rule.amount;
                    led.radius = led.diameter / 2;
					break;
				case Attribute.Hue:
					led.hue *= rule.amount;
					break;
				case Attribute.Saturation:
					led.saturation *= rule.amount;
					break;					
                case Attribute.Lightness:
					led.lightness *= rule.amount;
					break;				
			}
        }

        calculateLedStatus = (x, y) => {  
            this.rules.forEach(rule => {
                let neighboursResult = 0;

                this.ledsBuffer[x][y].diameter = this.leds[x][y].diameter; 
                this.ledsBuffer[x][y].radius = this.leds[x][y].radius; 
                this.ledsBuffer[x][y].hue = this.leds[x][y].hue; 
                this.ledsBuffer[x][y].saturation = this.leds[x][y].saturation; 
                this.ledsBuffer[x][y].lightness = this.leds[x][y].lightness; 

                neighboursResult += (this.getLedValueSafe(x, y-1, rule.neighboursRule));
                neighboursResult += (this.getLedValueSafe(x, y+1, rule.neighboursRule));
                neighboursResult += (this.getLedValueSafe(x-1, y-1, rule.neighboursRule));
                neighboursResult += (this.getLedValueSafe(x+1, y-1, rule.neighboursRule));
                neighboursResult += (this.getLedValueSafe(x-1, y, rule.neighboursRule));
                neighboursResult += (this.getLedValueSafe(x+1, y, rule.neighboursRule));
                neighboursResult += (this.getLedValueSafe(x-1, y+1, rule.neighboursRule));
                neighboursResult += (this.getLedValueSafe(x+1, y+1, rule.neighboursRule));

                //neighboursResult /= 8;

                if (this.ruleFulfilled(rule.localRule, this.getLedValueSafe(x, y, rule.localRule)) && this.ruleFulfilled(rule.neighboursRule, neighboursResult))
                    this.applyRule(rule.neighboursRule, this.ledsBuffer[x][y]);

            });      
        }

        update = () => {            
            for (let x = 0; x < ledColumns; x++) {
                for (let y = 0; y < ledRows; y++) {
                    this.calculateLedStatus(x, y);
                }
            }                  
        }
    }

    class Led {
        constructor(column, row) {
            this.diameter = ledDiameter;
            this.radius = ledDiameter / 2;
            this.row = row;
            this.column = column;
            this.x = ledMargin + column * ledPadding + column * this.diameter;
            this.y = ledMargin + row * ledPadding + row * this.diameter;            
            
        }

        getColor = () => {
            return `hsl(${this.hue}, ${this.saturation}%, ${this.lightness}%)`;
        }

        draw = (ctx) => {
            Utils.drawCircle(ctx, this.x + this.radius, this.y + this.radius, this.radius, this.getColor(), this.getColor())
        }
    }

    class Utils {
        static scale = (number, inMin, inMax, outMin, outMax) => {
            return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
        }

        static sleep(ms){
            let waitUntil = new Date().getTime() + ms;
            while(new Date().getTime() < waitUntil) continue;
        };

        static angleBetweenTwoPoints(x1, y1, x2, y2) {
            let angle = Math.atan2(y2 - y1, x2 - x1);
            angle *= 180 / Math.PI;
            if (angle < 0) angle = 360 + angle;
            return angle;
        }

        static getRandomFromArray = (array) => {
            return array[(Math.floor(Math.random() * array.length))];
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

        static drawCircle = (ctx, x, y, radius, color = '#00FF00', fillColor = '#00FF00') => {
            ctx.strokeStyle = color;
            ctx.fillStyle = fillColor;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
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

        ledDiameter = Utils.getRandomInt(5, 20);        
        ledPadding = Utils.getRandomInt(0, 20);
        ledMargin = ledPadding;

        ledRows = Math.floor((height - ledMargin)/ (ledDiameter + ledPadding));
        ledColumns = Math.floor((width - ledMargin)/ (ledDiameter + ledPadding));
        ledScreen = new LedScreen();
        
        randomize();

        addEvents();

    }

    let addEvents = () => {      
    }

    let randomize = () => {
        for (let x = 0; x < ledColumns; x++) {
            for (let y = 0; y < ledRows; y++) {
                //ledScreen.leds[x][y].diameter =  Utils.getRandomInt(0, 20);
                //ledScreen.leds[x][y].radius = ledScreen.leds[x][y].diameter / 2;
                ledScreen.leds[x][y].hue =  Utils.getRandomInt(0, 255);
                ledScreen.leds[x][y].saturation =  Utils.getRandomInt(0, 100);
                ledScreen.leds[x][y].lightness =  Utils.getRandomInt(0, 100);

                /*
                ledScreen.ledsBuffer[x][y].diameter =  ledScreen.leds[x][y].diameter;
                ledScreen.ledsBuffer[x][y].radius = ledScreen.leds[x][y].diameter / 2;
                ledScreen.ledsBuffer[x][y].hue = ledScreen.leds[x][y].radius;
                ledScreen.ledsBuffer[x][y].saturation =  ledScreen.leds[x][y].saturation;
                ledScreen.ledsBuffer[x][y].lightness =  ledScreen.leds[x][y].lightness;
                */
            
            }
        }    

        //setRandomRules();
        
        setRules();
    }

    
    let setRules = () => {    
        let rule1L = new Rule(Condition.Greater, 50, 0, Attribute.Lightness, 0);    
        let rule1N = new Rule(Condition.Lower, 200, 0, Attribute.Lightness, 0); 
        let ruleSet1 = new RuleSet(rule1L, rule1N);
        ledScreen.rules.push(ruleSet1); 
        
        let rule2L = new Rule(Condition.Greater, 50, 0, Attribute.Lightness, 0);    
        let rule2N = new Rule(Condition.Greater, 300, 0, Attribute.Lightness, 0); 
        let ruleSet2 = new RuleSet(rule2L, rule2N);
        ledScreen.rules.push(ruleSet2); 

        let rule3L = new Rule(Condition.Greater, 50, 0, Attribute.Lightness, 0);
        let rule3N = new Rule(Condition.Between, 200, 300, Attribute.Lightness, 50);
        let ruleSet3 = new RuleSet(rule3L, rule3N);
        ledScreen.rules.push(ruleSet3);

        let rule4L = new Rule(Condition.Lower, 51, 0, Attribute.Lightness, 0);
        let rule4N = new Rule(Condition.Between, 301, 350, Attribute.Lightness, 50);
        let ruleSet4 = new RuleSet(rule4L, rule4N);
        ledScreen.rules.push(ruleSet4);       
    }

    let setRandomRules = () => {
        let numberOfRules = Utils.getRandomInt(1, 5);
        for(let i = 0; i < numberOfRules; i++){

			let randCondition = Utils.getRandomInt(0, Object.keys(Condition).length);
			let condition = Condition[Object.keys(Condition)[randCondition].toString()];            
            
			let randAttribute = Utils.getRandomInt(0, Object.keys(Attribute).length);
			let attribute = Attribute[Object.keys(Attribute)[randAttribute].toString()];

            let value = 0;
            switch(attribute){
                case Attribute.Diameter:
                    value = Utils.getRandomInt(0, 50);  
                    break;
                case Attribute.Hue:
                    value = Utils.getRandomInt(0, 255);  
                    break;
                case Attribute.Saturation:
                    value = Utils.getRandomInt(0, 100);  
                    break;
                case Attribute.Lightness:
                    value = Utils.getRandomInt(0, 300);  
                    break;
            }            
            
            let amount = Utils.getRandomFloat(0, 2, 2);

            let rule = new Rule( condition, value, 0, attribute, amount);
            ledScreen.rules.push(rule);
        }
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
        ledScreen.copyBuffer();
    }

    let loop = (timestamp) => {
        let progress = timestamp - lastRender;

        ledScreen.update();

        draw();

        Utils.sleep(200);

        lastRender = timestamp;
        window.requestAnimationFrame(loop);
    }

    init();

    window.requestAnimationFrame(loop);
}
