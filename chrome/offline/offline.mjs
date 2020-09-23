
import { Scrumboard     } from '../shared/Scrumboard.mjs';
import { CACHE, Storage } from '../shared/Storage.mjs';



const elements = {
	main:  window.document.querySelector('main'),
	title: window.document.querySelector('title')
};



const init = function(chrome) {

	let storage = new Storage(chrome);

	storage.read(() => {

		let settings = {
			token:        CACHE.token,
			organization: null,
			repository:   null
		};

		let search = window.location.search;
		if (search.startsWith('?id=') === true) {

			settings.organization = search.substr(4).split('/')[0];
			settings.repository   = search.substr(4).split('/')[1];

		}


		let cache = CACHE.boards.find((b) => b.organization === settings.organization && b.repository === settings.repository) || null;
		if (cache !== null) {

			Array.from(elements.main.children).forEach((element) => {
				element.parentNode.removeChild(element);
			});

			let board = new Scrumboard(cache);

			// board.onchange = (issue, action) => {

			// 	TODO: If navigator.onLine then use Online API
			// 	console.log(issue, action);

			// };

			elements.title.innerHTML = 'Offline Scrumboard for ' + settings.organization + '/' + settings.repository;
			elements.main.appendChild(board.element);

		}

	});

};


init(chrome);

