
import { Github         } from '../shared/Github.mjs';
import { Scrumboard     } from '../shared/Scrumboard.mjs';
import { CACHE, Storage } from '../shared/Storage.mjs';



const isArray  = (val) => Object.prototype.toString.call(val) === '[object Array]';
const elements = {
	main: window.document.querySelector('div.repository-content div[aria-label="Issues"]'),
	menu: window.document.querySelector('div.repository-content div#js-issues-toolbar')
};

const filter_issue = (issue, filters) => {

	if (filters.milestone !== null) {

		if (issue.milestone === filters.milestone) {
			return true;
		} else {
			return false;
		}

	}

	if (filters.assignee !== null) {

		let found = issue.assignees.filter((a) => a.name === filters.assignee) || null;
		if (found !== null) {
			return true;
		} else {
			return false;
		}

	}

	return true;

};



const init = function(chrome) {

	let storage = new Storage(chrome);

	storage.read(() => {

		let filters = {
			assignee:  null,
			milestone: null
		};

		let settings = {
			token:        CACHE.token,
			organization: null,
			repository:   null
		};

		let pathname = window.location.pathname;
		if (pathname.endsWith('/issues') === true) {

			settings.organization = pathname.split('/')[1];
			settings.repository   = pathname.split('/')[2];

		}

		let search = window.location.search;
		if (search.startsWith('?q=') === true) {

			let chunk = decodeURIComponent(search.substr(4).split('&').shift());
			if (chunk.includes('+assignee:')) {

				let tmp = chunk.split('+assignee:').pop().split('+').shift();
				if (/^([a-z0-9-]{3,39})$/g.test(tmp) === true) {
					filters.assignee = tmp;
				}

			} else if (chunk.includes('+no:assignee')) {
				filters.assignee = null;
			}

			if (chunk.includes('+milestone:')) {

				let tmp = chunk.split('+milestone:').pop();
				if (tmp.startsWith('"')) {
					filters.milestone = decodeURIComponent(tmp.substr(1, tmp.indexOf('"', 1) - 1)).split('+').join(' ');
				} else {
					filters.milestone = tmp.split('+').shift();
				}

			} else if (chunk.includes('+no:milestone')) {
				filters.milestone = null;
			}

		}


		console.log(filters);


		[
			...Array.from(elements.main.children),
			elements.menu.querySelector('details#author-select-menu'),
			elements.menu.querySelector('details#project-select-menu'),
			elements.menu.querySelector('details#label-select-menu'),
			elements.menu.querySelector('details#sort-select-menu')
		].forEach((element) => {

			if (element !== null) {
				element.parentNode.removeChild(element);
			}

		});


		let GITHUB = new Github(settings);

		GITHUB.query('GET', 'labels', null, (labels) => {

			if (isArray(labels) === true) {

				[ 'todo', 'in-progress', 'in-testing' ].forEach((label) => {

					let check = labels.find((l) => l.name === label) || null;
					if (check === null) {

						GITHUB.query('POST', 'labels', {
							name:  label,
							color: '#22ccff'
						});

					}

				});

			}


		});

		GITHUB.query('GET', 'issues', {
			state:    'open',
			per_page: 254
		}, (issues_open) => {

			GITHUB.query('GET', 'issues', {
				state:    'closed',
				per_page: 254
			}, (issues_closed) => {

				let issues = [];

				if (isArray(issues_open) === true) {
					issues_open.forEach((i) => issues.push(i));
				}

				if (isArray(issues_closed) === true) {
					issues_closed.forEach((i) => issues.push(i));
				}


				let cache = CACHE.boards.find((b) => b.organization === settings.organization && b.repository === settings.repository) || null;
				if (cache !== null) {

					cache.issues = issues;

				} else if (cache === null) {

					cache = {
						organization: settings.organization,
						repository:   settings.repository,
						issues:       issues
					};

					CACHE.boards.push(cache);

				}


				storage.save(CACHE);


				let board = new Scrumboard({
					issues:       issues.filter((i) => filter_issue(i, filters)),
					organization: settings.organization,
					repository:   settings.repository
				});

				board.onchange = (issue, action) => {

					if (action.label !== null) {

						let found = issue.labels.find((l) => l.name === action.label) || null;
						if (found === null) {

							issue.labels = issue.labels.filter((l) => {
								return [ 'todo', 'in-progress', 'in-testing' ].includes(l.name) === false;
							});

							issue.labels.push({
								name:  action.label,
								color: '#22ccff'
							});

							GITHUB.query('PUT', 'issues/' + issue.number + '/labels', {
								labels: issue.labels.map((l) => l.name)
							});

						}

					}

					if (
						(
							issue.state === 'open'
							&& action.state === 'closed'
						) || (
							issue.state === 'closed'
							&& action.state === 'open'
						)
					) {

						issue.state = action.state;

						GITHUB.query('PATCH', 'issues/' + issue.number, {
							state: action.state
						});

					}

				};

				elements.main.appendChild(board.element);

			});

		});

	});

};


export { init };

export default init;

