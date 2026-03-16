class Text {
    static nextCharacter = (c) => {
        return String.fromCharCode(c.charCodeAt(0) + 1);
    }
    static capitalizeFirstLetter = (text) => {
        if (!text) return "";
        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    static getRandomConsonant = (random) => {        
        const consonants = "bcdfghjklmnpqrstvwxyz".split('');
        return random.getRandomFromArray(consonants);
    }

    static getRandomVowel = (random) => {
        const vowels = "aeiou".split('');
        return random.getRandomFromArray(vowels);
    }

    static isVowel = (c) => {
        return "aeiou".includes(c.toLowerCase());
    }

    static generateWord = (random, minLetters=1, maxLetters=6) => {
        let word = ""
        let letters = random.nextInt(minLetters, maxLetters);
        console.log(letters);
        for (let i=0; i<=letters; i++){
            let putConsonant = random.nextBool();
            if (putConsonant) word += Text.getRandomConsonant(random); 
            const regex = /[aeiou]{2}$/i; 
            if (regex.test(word)) continue;
            word += Text.getRandomVowel(random);
        }
        return Text.capitalizeFirstLetter(word);
    }

    static generateName = (random, minWords=1, maxWords=3) => {
        let name = ""
        let words = random.nextInt(minWords, maxWords);
        for (let i=0; i<=words; i++){
            name += Text.generateWord(random) + " ";
        }
        return name;
    }
    
    /*
    static letters = {
        [
            {
                symbol: 'A',
                pixels: [
                    [0, 1, 0],
                ]
            }
        ]
    };
    */
}
