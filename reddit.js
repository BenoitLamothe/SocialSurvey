const snoowrap = require('snoowrap');

module.exports = {
	provide(token) {
		return new Promise((resolve) => resolve(new snoowrap({
			userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36',
			accessToken: token,
		})));
	}
};