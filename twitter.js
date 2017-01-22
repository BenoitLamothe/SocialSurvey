const rp = require('request-promise-native');
const Twitter = require('twitter');
const MapQuest = require('./mapquest');
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

    determinePosition(tweet) {
        if(tweet.geo != undefined) {
            console.log("Geo tag found = " + tweet.geo);
        } else if(tweet.user.location != undefined) {
            console.log("User geo loc = " + tweet.user.location);
        } else if(tweet.user.time_zone) {
            console.log("User time zone = " + tweet.user.time_zone);
        }
    }

    guessBestLocation(tweet) {
        if(tweet.geo != undefined) {
            return tweet.geo;
        } else if(tweet.user.location != undefined && tweet.user.location.length > 0) {
            return tweet.user.location;
        } else if(tweet.user.time_zone != undefined) {
            return tweet.user.time_zone;
        }
    }

	handleQuery(query) {
		return new Promise((resolve) => {
			const params = {
				q: query.text,
				lang: 'en',
				result_type: query.type,
				count: tweetsPerCall
			};

			if (query.until != undefined) {
				params.until = query.until;
			}

			const asyncSearchTwitter = function (params, collectedTweets, maxId) {
				if (collectedTweets.length >= query.max) { // base case
                    MapQuest.batchProcessGeocode(collectedTweets.map(tt => tt.guess_location)).then(guessedLocations => {
                        resolve(collectedTweets.map((x, i) => Object.assign(x, {location: guessedLocations[i]})));
                    });
				} else {
					this._client.get('search/tweets', params, (error, tweets) => {
						if (tweets.search_metadata.count <= 0) {
                            MapQuest.batchProcessGeocode(collectedTweets.map(tt => tt.guess_location)).then(guessedLocations => {
                                resolve(collectedTweets.map((x, i) => Object.assign(x, {location: guessedLocations[i]})));
                            });
						} else {
							const currentTweets = tweets.statuses.map(t => ({
							    raw_text: t.text,
                                provider: 'twitter',
                                guess_location: this.guessBestLocation(t)
							}));

							const toCompletionTweetCount = query.max - collectedTweets.length;
							if (toCompletionTweetCount <= tweetsPerCall) {
								currentTweets.splice(toCompletionTweetCount, tweetsPerCall - toCompletionTweetCount);
							}

							collectedTweets.push(...currentTweets);
							if (maxId > -1) {
								params.max_id = maxId;
							}
							asyncSearchTwitter(tweets.search_metadata.max_id)
						}
					});
				}
			}.bind(this, params, []);

			asyncSearchTwitter(-1);
		});
	}
}
