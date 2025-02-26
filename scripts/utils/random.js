class Random {
  constructor(seed) {
    this.seed = seed || Math.floor(Math.random() * 9999999);
  }

  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280; 
    return this.seed / 233280;
  }

  nextRange(min, max) {
    return min + this.next() * (max - min);
  }

  nextInt(min, max) {
    return Math.floor(this.nextRange(min, max));
  }
  
  getRandomFromArray = (array) => {
      return array[(Math.floor(this.next() * array.length))];
  }

  shuffleArray = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(this.next() * (i + 1));
          const temp = array[i];
          array[i] = array[j];
          array[j] = temp;
      }
  }	

  nextBool = () => {
    return this.next() < 0.5;
  }

    /*       
    static getRandomInt = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    static getRandomFloat = (min, max, decimals) => {
        const str = (Math.random() * (max - min) + min).toFixed(
            decimals,
        );

        return parseFloat(str);
    }
      */ 
  
}
