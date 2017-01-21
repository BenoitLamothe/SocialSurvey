const rp = require('request-promise-native');

module.exports = class Nuance {
		constructor(credentials, identity) {
			this._identity = identity;
			this._credentials = credentials;
		}

		getNLU(text, params = {}) {
			const options = {
				method: 'POST',
				uri: 'https://webapi-demo.nuance.mobi:11443/nina-webapi/NinaDoNLU/',
				headers: Object.assign({}, this._credentials),
				json: true,
				body: Object.assign({}, this._identity, params, { text, nlu_engine: 'NLE' })
			};

			return rp(options);
		}
};