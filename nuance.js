const rp = require('request-promise-native');
const numAsync = 3;

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
			body: Object.assign({}, this._identity, params, {text, nlu_engine: 'NLE'})
		};

		return rp(options);
	}

	processMessages(messages, onComplete) {
		return new Promise((resolve) => {
			const process = function (ma) {
				if (ma.length === 0) {
					resolve({})
				} else {
					const message = ma.pop();
					this._getNLU(message.sanitized_text).then((response) => {
						if (
							response.QueryResult &&
							response.QueryResult.result_type === 'NinaDoNLU_NLE' &&
							response.QueryResult.final_response === true
						) {
							const result = {
								provider: message.provider,
								raw_text: message.raw_text,
								location: message.location,
								sentiment: response.QueryResult.results
									.map(x => ({confidence: x.confidence, sentiment: x.intent}))
									.sort((a, b) => b.confidence - a.confidence)
							};
							onComplete(result);
						}
						process()
					})
				}
			}.bind(this, messages);

			for (let i = 0; i < numAsync; i++) {
				process();
			}
		});
	}
}

module.exports = Nuance;