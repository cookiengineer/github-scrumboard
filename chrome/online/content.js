
const isModule = (val) => Object.prototype.toString.call(val) === '[object Module]';



(async () => {

	let url = chrome.runtime.getURL('online/online.mjs');
	let mod = await import(url);

	if (isModule(mod) === true) {
		mod.init(chrome);
	}

})();

