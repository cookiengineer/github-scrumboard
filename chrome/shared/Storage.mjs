
const isArray    = (val) => Object.prototype.toString.call(val) === '[object Array]';
const isFunction = (val) => Object.prototype.toString.call(val) === '[object Function]';
const isObject   = (val) => Object.prototype.toString.call(val) === '[object Object]';
const isString   = (val) => Object.prototype.toString.call(val) === '[object String]';



const CACHE = {
	username: null,
	token:    null,
	boards:   []
};



const Storage = function(chrome) {

	this.chrome = chrome;

};


Storage.prototype = {

	read: function(callback) {

		callback = isFunction(callback) ? callback : () => {};


		this.chrome.storage.sync.get('github-scrumboard', (blob) => {

			let data = blob['github-scrumboard'] || null;

			if (isObject(data) === true) {

				if (isString(data.username) === true) {
					CACHE.username = data.username;
				}

				if (isString(data.token) === true) {
					CACHE.token = data.token;
				}

				if (isArray(data.boards) === true) {
					CACHE.boards = data.boards;
				}

			}


			callback(CACHE);

		});

	},

	save: function(data, callback) {

		callback = isFunction(callback) ? callback : () => {};


		if (isObject(data) === true) {

			if (
				isString(data.username) === true
				&& data.username.length > 2
				&& data.username.length < 40
			) {
				CACHE.username = data.username;
			}

			if (
				isString(data.token) === true
				&& data.token.length === 40
			) {
				CACHE.token = data.token;
			}

			if (isArray(data.boards) === true) {

				let check = data.boards.filter((board) => {

					if (
						isObject(board) === true
						&& isString(board.organization) === true
						&& isString(board.repository) === true
						&& isArray(board.issues) === true
					) {
						return true;
					}

					return false;

				});

				if (check.length === data.boards.length) {
					CACHE.boards = data.boards;
				}

			}

		}


		this.chrome.storage.sync.set({
			'github-scrumboard': CACHE
		});


		setTimeout(() => {
			callback();
		}, 0);

	}

};


export { CACHE, Storage };

