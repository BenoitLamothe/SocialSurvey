const Throttle = require('promise-throttle');
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
			const process = function(ma){
				console.log(ma.length);
				if(ma.length === 0) {
					resolve({})
				} else {
					const message = ma.pop().sanitized_text;
					console.log(message);
					this._getNLU(message).then((result) => {
						onComplete(result);
						process()
					})
				}
			}.bind(this, messages);

			for(var i = 0; i < numAsync; i++) {
				process();
			}
		});
	}
}

module.exports = Nuance;