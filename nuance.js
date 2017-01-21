const WebSocketClient = require('websocket').w3cwebsocket;

const HOST = 'nim-rd.nuance.mobi';
const PORT = 9443;
const SOCKET_PATH = 'nina-webapi/nina';


const Nuance = (identity, credentials) => {
		return new Promise((resolve) => {
				new NuanceAPI(identity, credentials, resolve)
		})
};

class NuanceAPI {
	constructor(identity, credentials, rdyfn) {
		this.identity = identity;
		this.credentials = credentials;
		this.rdyfn = rdyfn;
		this.ws = new WebSocketClient(`wss://${HOST}:${PORT}/${SOCKET_PATH}`);

		this.ws.onopen = this._onOpen.bind(this);
		this.ws.onclose = this._onClose.bind(this);
		this.ws.onmessage = this._onMessage.bind(this);
	}

	_onOpen() {
		console.log('_onOpen', JSON.stringify({
			connect: this.identity,
		}));
		console.log('_onOpen', JSON.stringify({
			command: Object.assign({
				name: "NinaStartSession",
				apiVersion: 'LATEST',
			}, this.credentials)
		}));
		this.ws.send(JSON.stringify({
			connect: this.identity,
		}));
		this.ws.send(JSON.stringify({
			command: Object.assign({
				name: "NinaStartSession",
				apiVersion: 'LATEST',
			}, this.credentials)
		}));
	}

	_onClose(event) {
		console.log('_onClose', event)
	}

	_onMessage(event) {
		console.log('_onMessage', event.data);

		const response = JSON.parse(event.data);

		switch(Object.keys(response)[0]){
			case 'QueryResult':
					if (response.QueryResult.result_type === 'NinaStartSession' && response.QueryResult.final_response === true) {
						this.rdyfn(this);
					}
				break;
		}
	}

	send(msg) {
		console.log('send', JSON.stringify(msg));
		this.ws.send(JSON.stringify(msg))
	}
}

module.exports = Nuance;