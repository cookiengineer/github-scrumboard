
import { CACHE, Storage } from '../shared/Storage.mjs';



window.addEventListener('DOMContentLoaded', () => {

	const isArray  = (val) => Object.prototype.toString.call(val) === '[object Array]';
	const isString = (val) => Object.prototype.toString.call(val) === '[object String]';

	const document = window.document;
	const storage  = new Storage(chrome);
	const ELEMENTS = {
		username: document.querySelector('input#username'),
		token:    document.querySelector('input#token'),
		boards:   document.querySelector('ul#boards'),
		save:     document.querySelector('button#save'),
		sync:     document.querySelector('button#sync')
	};



	ELEMENTS.save.onclick = () => {

		storage.save({
			username: ELEMENTS.username.value.trim(),
			token:    ELEMENTS.token.value.trim(),
			boards:   CACHE.boards
		});

	};

	ELEMENTS.sync.onclick = () => {

		if (window.navigator.onLine === true) {
			// TODO: Synchronize all issues
		}

	};

	storage.read((data) => {

		if (data !== null) {

			if (isString(data.username) === true) {
				ELEMENTS.username.value = data.username;
			}

			if (isString(data.token) === true) {
				ELEMENTS.token.value = data.token;
			}

			if (
				isArray(data.boards) === true
				&& data.boards.length > 0
			) {

				Array.from(ELEMENTS.boards.children).forEach((element) => {
					element.parentNode.removeChild(element);
				});

				data.boards.sort((a, b) => {
					if (a.organization < b.organization) return -1;
					if (a.organization > b.organization) return  1;
					if (a.repository   < b.repository)   return -1;
					if (a.repository   > b.repository)   return  1;
					return 0;
				}).forEach((board) => {

					let button  = document.createElement('button');
					let element = document.createElement('li');

					button.innerHTML = 'Remove';

					button.onclick = () => {

						let found = CACHE.boards.find((b) => b.organization === board.organization && b.repository === board.repository) || null;
						if (found !== null) {
							CACHE.boards.splice(CACHE.boards.indexOf(found), 1);
						}

						element.parentNode.removeChild(element);

					};

					element.setAttribute('data-organization', board.organization);
					element.setAttribute('data-repository',   board.repository);

					element.innerHTML = [
						board.organization + '/' + board.repository + ': ',
						'<a target="_blank" href="https://github.com/' + board.organization + '/' + board.repository + '/issues">online</a>',
						' ',
						'<a target="_blank" href="' + chrome.runtime.getURL('offline/index.html') + '?id=' + board.organization + '/' + board.repository + '">offline</a>',
						' with ' + board.issues.length + ' issues '
					].join('');

					setTimeout(() => {

						element.appendChild(button);
						ELEMENTS.boards.appendChild(element);

					}, 0);

				});

			}

		}

	});

});

