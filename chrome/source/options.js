
window.addEventListener('DOMContentLoaded', () => {

	const isObject = (val) => Object.prototype.toString.call(val) === '[object Object]';
	const isString = (val) => Object.prototype.toString.call(val) === '[object String]';

	const username = window.document.querySelector('input#username');
	const token    = window.document.querySelector('input#token');

    let button = window.document.querySelector('button');
	if (button !== null) {

		button.onclick = () => {

			let data = {
				username: username.value.trim(),
				token:    token.value.trim()
			};

			if (
				isString(data.username) === true
				&& isString(data.token) === true
				&& data.username.length >= 3
				&& data.username.startsWith('@')
				&& data.username.length < 40
				&& data.token.length === 40
			) {

				chrome.storage.sync.set({
					'github-scrumboard': data
				});

			}

		};

	}


	chrome.storage.sync.get('github-scrumboard', (blob) => {

		let data = blob['github-scrumboard'] || null;

		if (
			isObject(data) === true
			&& isString(data.username) === true
			&& isString(data.token) === true
		) {

			username.value = data.username;
			token.value    = data.token;

		}

	});

});

