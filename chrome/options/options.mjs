
import { CACHE, Storage } from '../shared/Storage.mjs';



const render = (board) => {

	let element = document.createElement('li');

	element.setAttribute('data-organization', board.organization);
	element.setAttribute('data-repository',   board.repository);

	element.innerHTML = [
		board.organization + '/' + board.repository + ': ',
		'<a target="_blank" href="https://github.com/' + board.organization + '/' + board.repository + '/issues">online</a>',
		' ',
		'<a target="_blank" href="' + chrome.runtime.getURL('offline/index.html') + '?id=' + board.organization + '/' + board.repository + '">offline</a>',
		' with ' + board.issues.length + ' issues '
	].join('');

	return element;

};



window.addEventListener('DOMContentLoaded', () => {

	const isArray  = (val) => Object.prototype.toString.call(val) === '[object Array]';
	const isString = (val) => Object.prototype.toString.call(val) === '[object String]';

	const document = window.document;
	const storage  = new Storage(chrome);
	const elements = {
		username: document.querySelector('input#username'),
		token:    document.querySelector('input#token'),
		boards:   document.querySelector('ul#boards'),
		save:     document.querySelector('button#save')
	};



	elements.save.onclick = () => {

		storage.save({
			username: elements.username.value.trim(),
			token:    elements.token.value.trim(),
			boards:   CACHE.boards
		});

	};

	storage.read((data) => {

		if (data !== null) {

			if (isString(data.username) === true) {
				elements.username.value = data.username;
			}

			if (isString(data.token) === true) {
				elements.token.value = data.token;
			}

			if (
				isArray(data.boards) === true
				&& data.boards.length > 0
			) {

				Array.from(elements.boards.children).forEach((element) => {
					element.parentNode.removeChild(element);
				});

				data.boards.sort((a, b) => {
					if (a.organization < b.organization) return -1;
					if (a.organization > b.organization) return  1;
					if (a.repository   < b.repository)   return -1;
					if (a.repository   > b.repository)   return  1;
					return 0;
				}).forEach((board) => {
					elements.boards.appendChild(render(board));
				});

			}

		}

	});

	let time = new Date();
	if (time.getHours() > 20 || time.getHours() < 8) {

		let body = window.document.querySelector('body');
		if (body !== null) {
			body.setAttribute('data-theme', 'dark');
		}

	}

});

