class Url {
    static getUrlParam = (param) => {
        const queryString = window.location.search;
		const urlParams = new URLSearchParams(queryString);
		return urlParams.get(param);		
    }

    static setUrlParam = (param, value) => {
        let url = new URL(window.location.href);
        url.searchParams.set(param, value);
        window.history.pushState({}, '', value);
    }
}