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
        for (let i=0; i<words; i++){            
            name += Text.generateWord(random) + " ";
        }
        return name;
    }

    /*Japanese---------------------------------------------------------------------*/

    static getRandomKana = (random) => {        
        const syllables = [
            // (Gojuon)
            "a", "i", "u", "e", "o",
            "ka", "ki", "ku", "ke", "ko",
            "sa", "shi", "su", "se", "so",
            "ta", "chi", "tsu", "te", "to",
            "na", "ni", "nu", "ne", "no",
            "ha", "hi", "fu", "he", "ho",
            "ma", "mi", "mu", "me", "mo",
            "ya", "yu", "yo",
            "ra", "ri", "ru", "re", "ro",
            "wa", "wo",
            "n",

            //(Dakuon y Handakuon)
            "ga", "gi", "gu", "ge", "go",
            "za", "ji", "zu", "ze", "zo",
            "da", "ji", "zu", "de", "do",
            "ba", "bi", "bu", "be", "bo",
            "pa", "pi", "pu", "pe", "po",

            //(Yoon)
            "kya", "kyu", "kyo",
            "sha", "shu", "sho",
            "cha", "chu", "cho",
            "nya", "nyu", "nyo",
            "hya", "hyu", "hyo",
            "mya", "myu", "myo",
            "rya", "ryu", "ryo",
            "gya", "gyu", "gyo",
            "ja", "ju", "jo",
            "bya", "byu", "byo",
            "pya", "pyu", "pyo"
            ];
        return random.getRandomFromArray(syllables);
    }

    static isYoon = (syllable) => {  
        return ["kya", "kyu", "kyo",
            "sha", "shu", "sho",
            "cha", "chu", "cho",
            "nya", "nyu", "nyo",
            "hya", "hyu", "hyo",
            "mya", "myu", "myo",
            "rya", "ryu", "ryo",
            "gya", "gyu", "gyo",
            "ja", "ju", "jo",
            "bya", "byu", "byo",
            "pya", "pyu", "pyo"
            ].includes(syllable); 
    } 

    static isDakuon = (syllable) => {  
        return ["ga", "gi", "gu", "ge", "go",
            "za", "ji", "zu", "ze", "zo",
            "da", "ji", "zu", "de", "do",
            "ba", "bi", "bu", "be", "bo",
            "pa", "pi", "pu", "pe", "po"
            ].includes(syllable); 
    } 

    static generateJapaneseWord = (random, minSyllables=2, maxSyllables=5) => {
        let word = "";
        let syllableCount = random.nextInt(minSyllables, maxSyllables);
        let lastSyllable = "";
        let hasDakuon = false;
                
        for (let i = 0; i < syllableCount; i++){
            let nextSyllable = Text.getRandomKana(random);            
            if (word.length === 0 && nextSyllable === "n") continue;             
            if (lastSyllable === "n" && nextSyllable === "n") continue;
            if (hasDakuon && Text.isDakuon(nextSyllable)) continue; 
            if (Text.isYoon(lastSyllable) && Text.isYoon(nextSyllable)) continue;
            if ((word.length + nextSyllable.length) > 10) {
                continue;
            }
            word += nextSyllable;
            lastSyllable = nextSyllable;
            if (Text.isDakuon(nextSyllable)) hasDakuon = true;
        }

        return Text.capitalizeFirstLetter(word);
    }

    static generateJapaneseName = (random, minWords=1, maxWords=3) => {
        let name = ""
        let words = random.nextInt(minWords, maxWords);
        for (let i=0; i<words; i++){            
            name += Text.generateJapaneseWord(random) + " ";
        }
        return name;
    }    

    /*Korean---------------------------------------------------------------------*/

    static getRandomKoreanInitialConsonant = (random) => {        
        const syllables = [
                "g", "n", "d", "r", "m", "b", "s", "j", "ch", "k", "t", "p", "h", "kk", "tt", "pp"       
            ];
        return random.getRandomFromArray(syllables);
    }

    static getRandomKoreanVowel = (random) => {        
        const syllables = [
                "a", "eo", "o", "u", "eu", "i", "ae", "e"       
            ];
        return random.getRandomFromArray(syllables);
    }


    static getRandomKoreanFinishingConsonant = (random) => {        
        const syllables = [
                "n", "m", "ng", "l", "k", "p", "t"       
            ];
        return random.getRandomFromArray(syllables);
    }

    static generateKoreanSyllable = (random) => {
        let syllable = Text.getRandomKoreanInitialConsonant(random) + Text.getRandomKoreanVowel(random);
        if (random.nextInt(0, 100) < 40) syllable += Text.getRandomKoreanFinishingConsonant(random);
        return syllable;
    }

    static generateKoreanWord(random, syllables = 2) {
        let word = "";
        
        for (let i = 0; i < syllables; i++) {
            word += Text.generateKoreanSyllable(random);
        }
        
        return Text.capitalizeFirstLetter(word);
    }

    static generateKoreanName = (random, minWords=1, maxWords=3) => {
        let name = ""
        let words = random.nextInt(minWords, maxWords);
        for (let i=0; i<words; i++){            
            name += Text.generateKoreanWord(random) + " ";
        }
        return name;
    }    

    /*Chinese---------------------------------------------------------------------*/
 
      static getRandomChineseInitialConsonant = (random) => {        
        const syllables = [
                "b", "p", "m", "f", "d", "t", "n", "l", "g", "k", "h", "j", "q", "x", "zh", "ch" , "sh", "r", "z", "c", "s"    
            ];
        return random.getRandomFromArray(syllables);
    }

    static getRandomChineseFinishing = (random) => {        
        const syllables = [
                "a", "o", "e", "i", "u", "ai", "ei", "ui", "ao", "ou", "iu", "ie", "ue", "er", 
                "an", "en", "in", "un", "ang", "eng", "ing", "ong"       
            ];
        return random.getRandomFromArray(syllables);
    }

    static generateChineseSyllable = (random) => {
        let syllable = Text.getRandomChineseInitialConsonant(random) + Text.getRandomChineseFinishing(random);
        return syllable;
    }

    static generateChineseWord(random, syllables = 2) {
        let word = "";
        
        for (let i = 0; i < syllables; i++) {
            word += Text.generateChineseSyllable(random);
        }
        
        return Text.capitalizeFirstLetter(word);
    }

    static generateChineseName = (random, minWords=1, maxWords=3) => {
        let name = ""
        let words = random.nextInt(minWords, maxWords);
        for (let i=0; i<words; i++){            
            name += Text.generateChineseWord(random) + " ";
        }
        return name;
    }    
}
