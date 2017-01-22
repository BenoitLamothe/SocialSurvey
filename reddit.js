const snoowrap = require('snoowrap');
const rp = require('request-promise-native');


module.exports = {
	provide(key, secret) {

		return new Promise((resolve, reject) => {
			const options = {
				method: 'POST',
				uri: 'https://www.reddit.com/api/v1/access_token',
				headers: {
					'Authorization': `Basic ${new Buffer(key + ':' + secret).toString('base64')}`,
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: 'grant_type=client_credentials'
			};

			rp(options)
				.then((body) => {
					const resp = JSON.parse(body);
					resolve(new RedditClient(new snoowrap({
						userAgent: 'social-survey',
						accessToken: resp.access_token,
						retryErrorCodes: []
					})));
				})
				.catch(reject);
		})
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
				.then(comments => comments.map(x => ({ raw_text: x.body, provider: 'reddit', guess_location: undefined })))
				.catch(() => []);
	}
}