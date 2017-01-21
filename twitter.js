const rp = require('request-promise-native');
const Twitter = require('twitter');


module.exports = {
	provide(key, secret){
		return new Promise((resolve, reject) => {
			const options = {
				method: 'POST',
				uri: 'https://api.twitter.com/oauth2/token',
				headers: {
					'Authorization': `Basic ${new Buffer(key + ':' + secret).toString('base64')}`,
					'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8.'
				},
				body: 'grant_type=client_credentials'
			};

			rp(options)
				.then((body) => {
					const resp = JSON.parse(body);
					resolve(new TwitterClient(new Twitter({
						consumer_key: key,
						consumer_secret: secret,
						bearer_token: resp.access_token,
					})));
				})
				.catch(reject);
		});
	}
};


class TwitterClient {
	constructor(client) {
		this._client = client;
	}
}