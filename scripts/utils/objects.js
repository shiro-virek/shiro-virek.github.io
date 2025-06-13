class Objects {
    static clone = (original) => {
        return JSON.parse(JSON.stringify(original));
    }

    static cloneWithMethods = (original) => {
        const copy = Object.create(Object.getPrototypeOf(original));
        return Object.assign(copy, original);
    }

    static getRandomObject = () => {
        if (!Url.hasUrlParam('seed')){
			Url.setUrlParam('seed', Date.now());
		}
		return new Random(Url.getUrlParam('seed'));
    } 
}