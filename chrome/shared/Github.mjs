
const isArray    = (val) => Object.prototype.toString.call(val) === '[object Array]';
const isFunction = (val) => Object.prototype.toString.call(val) === '[object Function]';
const isObject   = (val) => Object.prototype.toString.call(val) === '[object Object]';
const isString   = (val) => Object.prototype.toString.call(val) === '[object String]';



const TRANSFORMER = {

	label: (data) => {

		return {
			name:  data.name,
			color: data.color || '#22ccff'
		};

	},

	issue: (data) => {

		let issue = {
			assignees: [],
			labels:    [],
			milestone: null,
			number:    data.number,
			state:     data.state,
			title:     data.title
		};


		if (isArray(data.assignees) === true) {
			issue.assignees = data.assignees.map((assignee) => {
				return {
					avatar: assignee.avatar_url,
					name:   assignee.login
				};
			});
		}

		if (isArray(data.labels) === true) {
			issue.labels = data.labels.map((label) => {
				return TRANSFORMER.label(label);
			});
		}

		if (
			isObject(data.milestone) === true
			&& isString(data.milestone.title) === true
		) {
			issue.milestone = data.milestone.title;
		}


		return issue;

	}

};



const Github = function(data) {

	this.organization = null;
	this.repository   = null;
	this.token        = null;


	if (isObject(data) === true) {

		if (isString(data.organization) === true) {
			this.organization = data.organization;
		}

		if (isString(data.repository) === true) {
			this.repository = data.repository;
		}

		if (isString(data.token) === true) {
			this.token = data.token;
		}

	}

};


Github.prototype = {

	query: function(type, method, data, callback) {

		type     = [ 'GET', 'PATCH', 'POST', 'PUT' ].includes(type)   ? type     : null;
		method   = [ 'labels', 'issues'            ].includes(method) ? method   : null;
		data     = isObject(data)                                     ? data     : null;
		callback = isFunction(callback)                               ? callback : () => {};


		if (
			this.token !== null
			&& this.organization !== null
			&& this.repository !== null
			&& type !== null
			&& method !== null
		) {

			let xhr    = new XMLHttpRequest();
			let search = '';
			let url    = 'https://api.github.com/repos/' + this.organization + '/' + this.repository + '/' + method;


			if (type === 'GET') {

				if (isObject(data) === true) {

					Object.keys(data).forEach((key, k) => {

						if (k === 0) {
							search += '?' + key + '=' + data[key];
						} else {
							search += '&' + key + '=' + data[key];
						}

					});

				}

			}

			xhr.open(type, url + search, true);
			xhr.setRequestHeader('Authorization', 'token ' + this.token);

			xhr.onload = () => {

				if (xhr.status === 401) {

					callback(null, {
						error: 'The Personal Access Token is invalid!'
					});

				} else if (xhr.status === 200 || xhr.status === 304) {

					let data = null;

					try {
						data = JSON.parse(xhr.responseText);
					} catch (err) {
						data = null;
					}

					if (method === 'labels') {
						data = data.map((d) => TRANSFORMER.label(d));
						data = data.sort((a, b) => {
							if (a.name < b.name) return  1;
							if (a.name > b.name) return -1;
							return 0;
						});
					}

					if (method === 'issues') {

						if (isArray(data) === true) {
							data = data.map((d) => TRANSFORMER.issue(d));
							data = data.sort((a, b) => {
								if (a.number < b.number) return  1;
								if (a.number > b.number) return -1;
								return 0;
							});
						}

					}

					callback(data);

				} else {

					callback(null);

				}

			};

			xhr.onerror = xhr.ontimeout = () => {

				if (xhr.status === 401) {
					callback(null, {
						error: 'The Personal Access Token is invalid!'
					});
				} else {
					callback(null);
				}

			};


			if (type === 'GET') {

				xhr.send(null);

			} else if (type === 'PATCH') {

				if (data !== null) {
					xhr.send(JSON.stringify(data));
				} else {
					xhr.send(null);
				}

			} else if (type === 'POST') {

				if (data !== null) {
					xhr.send(JSON.stringify(data));
				} else {
					xhr.send(null);
				}

			} else if (type === 'PUT') {

				if (data !== null) {
					xhr.send(JSON.stringify(data));
				} else {
					xhr.send(null);
				}

			}

		} else {

			callback(null);

		}

	}

};


export { Github };

