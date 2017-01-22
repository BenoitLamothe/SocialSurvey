const snoowrap = require('snoowrap');

module.exports = {
	provide(token) {
		return new Promise((resolve) => resolve(new RedditClient(new snoowrap({
			userAgent: 'social-survey',
			accessToken: token
		}))))
	}
};

class RedditClient {
	constructor(client) {
		this._client = client;
	}

	handleQuery(query) {
			return this._client
				.getSubreddit('inthenews')
				.search({query: query.text, time: query.time})
				.then(submissions => submissions.map(x => x.expandReplies({depth: 0, limit: 1})))
				.then(submissions => Promise.all(submissions))
				.then(submissions => submissions.filter(x => x.comments.length > 0))
				.then(submissions => submissions.map(x => x.comments))
				.then(comments => comments.reduce((a, b) => [...a, ...b], []))
				.then(comments => comments.map(x => ({ raw_text: x.body })))
				.catch(() => []);
	}
}