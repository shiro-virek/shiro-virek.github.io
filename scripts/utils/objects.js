class Objects {
    static clone = (original) => {
        return JSON.parse(JSON.stringify(original));
    }

    static getRandomObject = () => {
        if (!Url.hasUrlParam('seed')){
			Url.setUrlParam('seed', Date.now());
		}
		return new Random(Url.getUrlParam('seed'));
    } 
}