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
    return Math.round(this.nextRange(min, max));
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

  dice = (faces = 6) => {
    return this.nextInt(1, faces) == 1;
  }

  getElementByProbability(elements, probabilities) {
    if (elements.length !== probabilities.length) {
      throw new Error("Arrays must be the same length!");
    }

    const r = this.next();
    let accumulated = 0;

    for (let i = 0; i < elements.length; i++) {
      accumulated += probabilities[i];
      if (r < accumulated) {
        return elements[i];
      }
    }

    return elements[elements.length - 1];
  }

}
