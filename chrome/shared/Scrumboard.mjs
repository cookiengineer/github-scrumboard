
const isArray    = (val) => Object.prototype.toString.call(val) === '[object Array]';
const isFunction = (val) => Object.prototype.toString.call(val) === '[object Function]';
const isObject   = (val) => Object.prototype.toString.call(val) === '[object Object]';
const isString   = (val) => Object.prototype.toString.call(val) === '[object String]';



const Scrumboard = function(data) {

	this.element      = window.document.createElement('github-scrumboard');
	this.issues       = [];
	this.onchange     = null;
	this.ondetail     = null;
	this.organization = null;
	this.repository   = null;


	if (isObject(data) === true) {

		if (isArray(data.issues) === true) {
			this.issues = data.issues;
		}

		if (isFunction(data.onchange) === true) {
			this.onchange = data.onchange;
		}

		if (isString(data.organization) === true) {
			this.organization = data.organization;
		}

		if (isString(data.repository) === true) {
			this.repository = data.repository;
		}

	}


	this.element.innerHTML = [
		'<github-scrumboard-column>',
		'<h2 class="h4">Backlog</h2>',
		'<github-scrumboard-stack data-state="open"></github-scrumboard-stack>',
		'</github-scrumboard-column>',

		'<github-scrumboard-column>',
		'<h2 class="h4">To Do</h2>',
		'<github-scrumboard-stack data-state="open" data-label="todo"></github-scrumboard-stack>',
		'</github-scrumboard-column>',

		'<github-scrumboard-column>',
		'<h2 class="h4">In Progress</h2>',
		'<github-scrumboard-stack data-state="open" data-label="in-progress"></github-scrumboard-stack>',
		'</github-scrumboard-column>',

		'<github-scrumboard-column>',
		'<h2 class="h4">In Testing</h2>',
		'<github-scrumboard-stack data-state="open" data-label="in-testing"></github-scrumboard-stack>',
		'</github-scrumboard-column>',

		'<github-scrumboard-column>',
		'<h2 class="h4">Done</h2>',
		'<github-scrumboard-stack data-state="closed"></github-scrumboard-stack>',
		'</github-scrumboard-column>',
	].join('');


	Array.from(this.element.querySelectorAll('github-scrumboard-stack')).forEach((stack) => {

		let label = stack.getAttribute('data-label');
		let state = stack.getAttribute('data-state');

		stack.ondragover = (event) => {
			event.preventDefault();
		};

		stack.ondrop = (event) => {

			let issue = null;

			let number = parseInt(event.dataTransfer.getData('number'), 10);
			if (Number.isNaN(number) === false) {
				issue = this.issues.find((i) => i.number === number) || null;
			}

			if (issue !== null) {

				if (this.onchange !== null) {
					this.onchange(issue, {
						label: label,
						state: state
					});
				}

			}

			let element = this.element.querySelector('github-scrumboard-issue[data-number="' + number + '"]');
			if (element !== null) {
				element.parentNode.removeChild(element);
				stack.appendChild(element);
			}

		};

	});


	setTimeout(() => {
		this.update();
	}, 0);

};


Scrumboard.prototype = {

	update: function() {

		Array.from(this.element.querySelectorAll('github-scrumboard-issue')).forEach((element) => {
			element.parentNode.removeChild(element);
		});


		this.issues.forEach((issue) => {

			let element = window.document.createElement('github-scrumboard-issue');
			let content = [];

			if (this.organization !== null && this.repository !== null) {
				content.push('<a target="_blank" href="https://github.com/' + this.organization + '/' + this.repository + '/issues/' + issue.number + '">#' + issue.number + '</a>');
			} else {
				content.push('<span>#' + issue.number + '<span>');
			}

			if (
				isArray(issue.assignees) === true
				&& issue.assignees.length > 0
			) {

				content.push('<figure>');

				issue.assignees.forEach((assignee) => {
					content.push('<img width="32" height="32" src="' + assignee.avatar + '" alt="@' + assignee.name + '" title="@' + assignee.name + '"/>');
				});

				content.push('</figure>');

			}

			if (isString(issue.title) === true) {
				content.push('<h3 class="h5">' + issue.title + '</h3>');
			}

			element.innerHTML = content.join('');
			element.setAttribute('data-number', issue.number);
			element.setAttribute('draggable',   'true');

			element.onclick = (event) => {

				if (this.ondetail !== null) {

					this.ondetail(issue);

					event.preventDefault();
					event.stopPropagation();

				}

			};

			element.ondragstart = (event) => {
				event.dataTransfer.setData('number', issue.number);
			};


			let label = null;
			let state = issue.state;

			if (
				isArray(issue.labels) === true
				&& issue.labels.length > 0
			) {

				label = issue.labels.map((l) => l.name).find((l) => [ 'todo', 'in-progress', 'in-testing' ].includes(l)) || null;

			}


			let stack = null;

			if (state !== null && label !== null) {
				stack = this.element.querySelector('github-scrumboard-stack[data-state="' + state + '"][data-label="' + label + '"]');
			} else if (state !== null) {
				stack = this.element.querySelector('github-scrumboard-stack[data-state="' + state + '"]');
			}

			if (stack !== null) {
				stack.appendChild(element);
			}

		});

	}

};


export { Scrumboard };

