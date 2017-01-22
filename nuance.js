const Throttle = require('promise-throttle');
const rp = require('request-promise-native');

class Nuance {
		constructor(credentials, identity) {
			this._identity = identity;
			this._credentials = credentials;
		}

		_getNLU(text, params = {}) {
			const options = {
				method: 'POST',
				uri: 'https://webapi-demo.nuance.mobi:11443/nina-webapi/NinaDoNLU/',
				headers: Object.assign({}, this._credentials),
				json: true,
				body: Object.assign({}, this._identity, params, { text, nlu_engine: 'NLE' })
			};

			return rp(options);
		}

		processMessages(messages, onComplete) {
			const t = new Throttle({
				requestsPerSecond: 5,
				promiseImplementation: Promise  // the Promise library you are using
			});

			messages
				.map(x => t.add(this._getNLU.bind(this, x)))
				.forEach(x => x.then(onComplete))
		}
}

module.exports = Nuance;