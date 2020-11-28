
import { Scrumboard     } from '../shared/Scrumboard.mjs';
import { CACHE, Storage } from '../shared/Storage.mjs';



const elements = {
	article: window.document.querySelector('dialog article'),
	dialog:  window.document.querySelector('dialog'),
	main:    window.document.querySelector('main'),
	title:   window.document.querySelector('title')
};



const render_link = (link) => {

	if (link.startsWith('https://github.com')) {

		if (link.includes('/commit/')) {

			let commit = link.split('/commit/').pop().split('?').shift();
			if (/^([a-z0-9]+)$/g.test(commit)) {
				return '<a target="_blank" href="' + link + '">' + commit.substr(0, 7) + '</a>';
			}

		}

		if (link.includes('/issue/')) {

			let issue = link.split('/issue/').pop().split('?').shift();
			if (/^([0-9]+)$/g.test(issue)) {
				return '<a target="_blank" href="' + link + '">#' + issue + '</a>';
			}

		}

	}

	return '<a target="_blank" href="' + link + '">' + link + '</a>';

};

const render_code = (line) => {

	if (line.includes('<')) {
		line = line.split('<').join('&lt;');
	}

	if (line.includes('>')) {
		line = line.split('>').join('&gt;');
	}

	return line;

};

const render_inline = (line) => {

	if (line.includes('`') === true) {

		let tmp = line.split('`');
		if (tmp.length % 2 === 1) {

			line = tmp.map((chunk, c) => {
				return (c % 2 === 1) ? '<code>' + chunk + '</code>' : chunk;
			}).join('');

		}

	}

	let index1 = line.indexOf('[');
	let index2 = line.indexOf(']', index1 + 1);
	let index3 = line.indexOf('(', index2 + 1);
	let index4 = line.indexOf(')', index3 + 1);

	if (
		index1 !== -1
		&& index2 !== -1
		&& index3 !== -1
		&& index4 !== -1
	) {

		let desc = line.substr(index1 + 1, index2 - index1 - 1);
		let href = line.substr(index3 + 1, index4 - index3 - 1);

		if (line.substr(index1 - 1, 1) === '!') {
			line = line.substr(0, index1 - 1) + '(image) <a target="_blank" href="' + href + '">' + desc + '</a>' + line.substr(index4 + 1);
		} else {
			line = line.substr(0, index1) + '<a target="_blank" href="' + href + '">' + desc + '</a>' + line.substr(index4 + 1);
		}

	}

	if (line.includes(' https://')) {

		let index1 = line.indexOf(' https://') + 1;
		let index2 = line.indexOf(' ', index1);

		if (index1 !== -1 && index2 !== -1) {

			line = line.substr(0, index1) + render_link(line.substr(index1, index2 - index1 - 1)) + line.substr(index2);

		}


	} else if (line.includes(' http://')) {

		// TODO: render link

	}

	return line;

};

const render = (content) => {

	let state = {
		code: false,
		list: false
	};

	return content.split('\n').map((line) => {

		if (line.startsWith('### ')) {
			return '<h3>' + line.substr(4) + '</h3>';
		} else if (line.startsWith('## ')) {
			return '<h2>' + line.substr(3) + '</h2>';
		} else if (line.startsWith('# ')) {
			return '<h1>' + line.substr(2) + '</h1>';
		}


		let prefix = '';

		if (line.startsWith('```')) {

			if (state.list === true) {
				state.list = false;
				prefix += '</ul>';
			}

			if (state.code === false) {
				state.code = true;
				prefix += '<pre class="' + line.substr(3).trim() + '"><code>';
				line    = '';
			} else {
				state.code = false;
				prefix += '</code></pre>';
				line    = '';
			}

		} else if (state.code === true) {

			line = render_code(line);

		} else if (line.startsWith('---')) {

			line = '<hr/>';

		} else if (line.startsWith('- ')) {

			if (state.list === false) {
				state.list = true;
				prefix = '<ul>';
			}

			if (line.startsWith('- [x]')) {
				line = '- <input type="checkbox" checked="true"/>' + line.substr(5);
			} else if (line.startsWith('- [ ]')) {
				line = '- <input type="checkbox"/>' + line.substr(5);
			}

			line = '<li>' + render_inline(line.substr(2)) + '</li>';

		} else {

			if (state.list === true) {
				state.list = false;
				prefix += '</ul>';
			}

			if (line.trim() !== '') {
				line = '<p>' + render_inline(line) + '</p>';
			}

		}

		return prefix + line;

	}).join('\n');

};



const init = function(chrome) {

	let dialog = elements.dialog;
	if (dialog !== null) {

		dialog.onclick = (event) => {

			if (event.target === dialog) {
				dialog.removeAttribute('open');
			}

		};

		let button = dialog.querySelector('button');
		if (button !== null) {
			button.onclick = () => {
				elements.dialog.removeAttribute('open');
			};
		}

	}


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

			board.ondetail = (issue) => {

				let headline = elements.article.querySelector('h3');
				if (headline !== null) {
					headline.innerHTML = issue.title;
				}

				Array.from(elements.article.querySelectorAll('section')).forEach((section) => {
					section.parentNode.removeChild(section);
				});

				let section = document.createElement('section');
				section.innerHTML = [
					'<h4>' + issue.user + ' opened at ' + issue.time + ':</h4>',
					render(issue.body)
				];
				elements.article.appendChild(section);

				issue.comments.forEach((comment) => {

					let section = document.createElement('section');
					section.innerHTML = [
						'<h4>' + comment.user + ' commented at ' + comment.time + ':</h4>',
						render(comment.body)
					].join('');
					elements.article.appendChild(section);

				});

				elements.dialog.setAttribute('open', 'true');

			};

			elements.title.innerHTML = 'Offline Scrumboard for ' + settings.organization + '/' + settings.repository;
			elements.main.appendChild(board.element);

		} else {

			if (settings.organization !== null && settings.repository !== null) {

				let link = elements.main.querySelector('fieldset a');
				if (link !== null) {

					let href = 'https://github.com/' + settings.organization + '/' + settings.repository + '/issues';

					link.setAttribute('href', href);
					link.innerHTML = href;

				}

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

};


init(chrome);

