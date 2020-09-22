
const isArray    = (val) => Object.prototype.toString.call(val) === '[object Array]';
const isFunction = (val) => Object.prototype.toString.call(val) === '[object Function]';
const isNumber   = (val) => Object.prototype.toString.call(val) === '[object Number]';
const isObject   = (val) => Object.prototype.toString.call(val) === '[object Object]';
const isString   = (val) => Object.prototype.toString.call(val) === '[object String]';



const DOM = {
	main:  window.document.querySelector('div.repository-content div[aria-label="Issues"]'),
	menu:  window.document.querySelector('div.repository-content div#js-issues-toolbar'),
	board: null
};

const ISSUES = [];
let   TOKEN  = null;
const QUERY  = {
	organization: null,
	repository:   null,
	assignee:     null,
	milestone:    null
};


const render = (issue) => {

	ISSUES.push(issue);


	let element = document.createElement('github-scrumboard-issue');

	element.innerHTML = [
		'<a href="https://github.com/' + QUERY.organization + '/' + QUERY.repository + '/issues/' + issue.number + '">#' + issue.number + '</a>',
		'<figure>',
		issue.assignees.map((assignee) => {
			return '<img width="32" height="32" src="' + assignee.avatar_url + '" alt="@' + assignee.login + '" title="@' + assignee.login + '"/>';
		}).join(''),
		'</figure>',
		'<h3 class="h5">' + issue.title + '</h3>'
	].join('');

	element.setAttribute('draggable', 'true');

	element.ondragstart = (event) => {
		event.dataTransfer.setData('number', issue.number);
	};


	let label = issue.labels.find((l) => [ 'todo', 'in-progress', 'in-testing' ].includes(l.name)) || null;
	if (label !== null) {

		let stack = DOM.board.querySelector('github-scrumboard-column[data-state="' + issue.state + '"][data-label="' + label.name + '"] github-scrumboard-stack');
		if (stack !== null) {
			stack.appendChild(element);
		}

	} else {

		let stack = DOM.board.querySelector('github-scrumboard-column[data-state="' + issue.state + '"] github-scrumboard-stack');
		if (stack !== null) {
			stack.appendChild(element);
		}

	}

};

const query = (type, method, data, callback) => {

	type     = [ 'GET', 'POST'      ].includes(type)   ? type     : null;
	method   = [ 'labels', 'issues' ].includes(method) ? method   : null;
	data     = isObject(data)                          ? data     : null;
	callback = isFunction(callback)                    ? callback : () => {};


	if (
		TOKEN !== null
		&& QUERY.organization !== null
		&& QUERY.repository !== null
		&& type !== null
		&& method !== null
	) {

		let xhr = new XMLHttpRequest();
		let url = 'https://api.github.com/repos/' + QUERY.organization + '/' + QUERY.repository + '/' + method;


		if (type === 'GET') {

			let search = '';

			if (isObject(data) === true) {

				Object.keys(data).forEach((key, k) => {

					if (k === 0) {
						search += '?' + key + '=' + data[key];
					} else {
						search += '&' + key + '=' + data[key];
					}

				});

			}

			xhr.open(type, url + search, true);
			xhr.setRequestHeader('Authorization', 'token ' + TOKEN);

			xhr.onload = () => {

				if (xhr.status === 401) {

					notify('The configured Personal Access Token is invalid!');
					callback(null);

				} else if (xhr.status === 200 || xhr.status === 304) {

					let data = null;
					try {
						data = JSON.parse(xhr.responseText);
					} catch (err) {
						data = null;
					}

					if (
						isArray(data) === true
						&& data.length > 0
						&& isNumber(data[0].number) === true
					) {

						data = data.sort((a, b) => {
							if (a.number < b.number) return  1;
							if (a.number > b.number) return -1;
							return 0;
						});

					}

					callback(data);

				} else {

					callback(null);

				}

			};

			xhr.onerror = xhr.ontimeout = () => {

				if (xhr.status === 401) {
					notify('The configured Personal Access Token is invalid!');
				}

				callback(null);

			};

			xhr.send(null);

		} else if (type === 'POST') {

			xhr.open(type, url, true);
			xhr.setRequestHeader('Authorization', 'token ' + TOKEN);

			if (data !== null) {
				xhr.send(JSON.stringify(data));
			} else {
				xhr.send(null);
			}

		}

	} else {

		callback(null);

	}

};

const initialize = () => {

	let board = window.document.querySelector('github-scrumboard');
	if (board !== null) {

		DOM.board = board;


		DOM.board.querySelectorAll('github-scrumboard-column').forEach((column) => {

			let label = column.getAttribute('data-label');
			let state = column.getAttribute('data-state');

			let stack = column.querySelector('github-scrumboard-stack');
			if (stack !== null) {

				stack.ondragover = (event) => {
					event.preventDefault();
				};

				stack.ondrop = (event) => {

					let number = parseInt(event.dataTransfer.getData('number'), 10);
					if (Number.isNaN(number) === false) {

						let issue = ISSUES.find((i) => i.number === number) || null;
						if (issue !== null) {

							if (label !== null) {

								let found = issue.labels.find((l) => l.name === label) || null;
								if (found === null) {

									let labels = issue.labels.map((l) => l.name).filter((label) => {
										return [ 'todo', 'in-progress', 'in-testing' ].includes(label) === false;
									}).concat(label);

									query('PUT', 'issues/' + issue.number + '/labels', {
										labels: labels
									}, () => {

										// TODO THIS IS BROKEN

										// issue.labels = labels.map((label) => {
										// 	name: label
										// });
									});

								}

							}

							if (state !== null && issue.state !== state) {

								if (state === 'closed') {

									let labels = issue.labels.map((l) => l.name).filter((label) => {
										return [ 'todo', 'in-progress', 'in-testing' ].includes(label) === false;
									});

									query('PUT', 'issues/' + issue.number + '/labels', {
										labels: labels
									}, () => {

										// TODO THIS IS BROKEN

										// issue.labels = labels.map((label) => {
										// 	name: label
										// });
									});

								}

								query('PATCH', 'issues/' + issue.number, {
									state: state
								}, () => {
									issue.state = state;
								});

								let element = event.srcElement || null;
								if (element !== null) {

									element.parentNode.removeChild(element);
									stack.appendChild(element);

									// TODO: Resort stack based on numbers

								}

							}

						}

					}

				};

			}

		});


		query('GET', 'labels', null, (data) => {

			if (isArray(data) === true) {

				[ 'todo', 'in-progress', 'in-testing' ].forEach((label) => {

					let found = data.find((d) => d.name === label) || null;
					if (found === null) {

						query('POST', 'labels', {
							name:  label,
							color: '#22ccff'
						});

					}

				});

			}

		});

		query('GET', 'issues', {
			state:    'open',
			per_page: 254
		}, (issues) => {

			if (isArray(issues) === true) {

				if (QUERY.milestone !== null) {

					issues = issues.filter((issue) => {

						if (
							issue.milestone !== null
							&& issue.milestone.title === QUERY.milestone
						) {
							return true;
						}

						return false;

					});

				}

				if (QUERY.assignee !== null) {

					issues = issues.filter((issue) => {

						if (isArray(issue.assignees) === true) {

							let found = issue.assignees.find((a) => a.login === QUERY.assignee) || null;
							if (found !== null) {
								return true;
							}

						}

						return false;

					});

				}


				issues.forEach((issue) => {

					if (
						isString(issue.state) === true
						&& isArray(issue.labels) === true
					) {
						render(issue);
					}

				});

			}

		});

		query('GET', 'issues', {
			state:    'closed',
			per_page: 254
		}, (issues) => {

			if (isArray(issues) === true) {

				issues.forEach((issue) => {

					if (
						isString(issue.state) === true
						&& isArray(issue.labels) === true
					) {
						render(issue);
					}

				});

			}

		});

	}

};



/*
 * QUERY INTEGRATION
 */

if (window.location.pathname.endsWith('/issues') === true) {

	QUERY.organization = window.location.pathname.split('/')[1];
	QUERY.repository   = window.location.pathname.split('/')[2];

}

if (window.location.search.includes('?q') === true) {

	let chunk = decodeURIComponent(window.location.search.split('?q=').pop().split('&').shift());


	if (chunk.includes('+assignee:')) {

		let tmp = chunk.split('+assignee:').pop().split('+').shift();
		if (/^([a-z0-9\-]{3,39})$/g.test(tmp) === true) {
			QUERY.assignee = tmp;
		}

	} else if (chunk.includes('+no:assignee')) {
		QUERY.assignee = null;
	}


	if (chunk.includes('+milestone:')) {

		let tmp = chunk.split('+milestone:').pop();
		if (tmp.startsWith('"')) {
			QUERY.milestone = decodeURIComponent(tmp.substr(1, tmp.indexOf('"', 1) - 1)).split('+').join(' ');
		} else {
			QUERY.milestone = tmp.split('+').shift();
		}

	} else if (chunk.includes('+no:milestone')) {
		QUERY.milestone = null;
	}

	console.log(QUERY);

}



REMOVE = [
	DOM.menu.querySelector('details#author-select-menu'),
	DOM.menu.querySelector('details#project-select-menu'),
	DOM.menu.querySelector('details#label-select-menu'),
	DOM.menu.querySelector('details#sort-select-menu')
].forEach((element) => {

	if (element !== null) {
		element.parentNode.removeChild(element);
	}

});



chrome.storage.sync.get('github-scrumboard', (blob) => {

	let data = blob['github-scrumboard'] || null;

	if (
		isObject(data) === true
		&& isString(data.token) === true
	) {

		TOKEN = data.token;

		Array.from(DOM.main.children).forEach((node) => {
			node.parentNode.removeChild(node);
		});

		let element = document.createElement('github-scrumboard');

		element.innerHTML = [
			'<github-scrumboard-column data-state="open">',
			'<h2 class="h4">Backlog</h2>',
			'<github-scrumboard-stack></github-scrumboard-stack>',
			'</github-scrumboard-column>',

			'<github-scrumboard-column data-state="open" data-label="todo">',
			'<h2 class="h4">To Do</h2>',
			'<github-scrumboard-stack></github-scrumboard-stack>',
			'</github-scrumboard-column>',

			'<github-scrumboard-column data-state="open" data-label="in-progress">',
			'<h2 class="h4">In Progress</h2>',
			'<github-scrumboard-stack></github-scrumboard-stack>',
			'</github-scrumboard-column>',

			'<github-scrumboard-column data-state="open" data-label="in-testing">',
			'<h2 class="h4">In Testing</h2>',
			'<github-scrumboard-stack></github-scrumboard-stack>',
			'</github-scrumboard-column>',

			'<github-scrumboard-column data-state="closed">',
			'<h2 class="h4">Done</h2>',
			'<github-scrumboard-stack></github-scrumboard-stack>',
			'</github-scrumboard-column>',
		].join('');

		DOM.main.appendChild(element);

		setTimeout(() => {
			initialize();
		}, 500);

	} else {

		// TODO: Display Notification Bar

	}

});


window.ISSUES = ISSUES;

