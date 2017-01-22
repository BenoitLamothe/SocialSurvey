const rp = require('request-promise-native');
const Twitter = require('twitter');
const Sanitize = require('./sanitize');
const tweetsPerCall = 100;

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

	handleQuery(query) {
        return new Promise((fullfil, reject) => {
            const _asyncSearchTwitter = (params, collectedTweets, maxId) => {
                if(collectedTweets.length >= query.max) { // base case
                    fullfil(collectedTweets);
                } else {
                    this._client.get('search/tweets', params, function (error, tweets, response) {
                        if(tweets.search_metadata.count <= 0) {
                            fullfil(collectedTweets);
                        } else {
                            const currentTweets = tweets.statuses.map(t => ({ raw_text: t.text, provider: 'TWITTER' }));
                            const toCompletionTweetCount = query.max - collectedTweets.length;
                            if(toCompletionTweetCount <= tweetsPerCall) {
                                currentTweets.splice(toCompletionTweetCount, tweetsPerCall - toCompletionTweetCount);
                            }

                            collectedTweets.push(...currentTweets);
                            if(maxId > -1) { params.max_id = maxId; }
                            _asyncSearchTwitter(params, collectedTweets, tweets.search_metadata.max_id)
                        }
                    });
                }
            };

            var params = {
                q: query.text,
                lang: 'en',
                result_type: query.type,
                count: tweetsPerCall
            };

            if(query.until != undefined) { params.until = query.until; }
            //if(query.type =)
            _asyncSearchTwitter(params, [], -1);
        });
    }
}
