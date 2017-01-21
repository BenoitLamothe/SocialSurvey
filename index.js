const WebSocket = require('ws');

const Nuance = require('./nuance');
const TwitterProvider = require('./twitter');
const RedditProvider = require('./reddit');

const nuance = new Nuance({
	nmaid: 'Nuance_ConUHack2017_20170119_210049',
	nmaidKey: '0d11e9c5b897eefdc7e0aad840bf4316a44ea91f0d76a2b053be294ce95c7439dee8c3a6453cf7db31a12e08555b266d54c2300470e4140a4ea4c8ba285962fd',
}, {
	appName: 'SocialSurvey',
	companyName: 'ConUHacks',
	cloudModelVersion: '1.0.0',
	clientAppVersion: '0.0',
});

const TWITTER_PROVIDER = 'twitter';
const REDDIT_PROVIDER = 'reddit';
const PROVIDERS = [
	TWITTER_PROVIDER,
	REDDIT_PROVIDER,
];

const CMD_SEARCH = 'search';

Promise.all([
	TwitterProvider.provide('9fwnAGzG8KUYrSjZStsvNnLTS', 'KkvpF6btanqadmskdLJBxtTdPMWRyB0c2LFmSJLWSHBl1zK2Tn'),
	RedditProvider.provide('k06yRu5qViNBmelHGLTgHruPczw')
]).then((providers) => providers.reduce((a, b, i) => Object.assign({}, a, {[PROVIDERS[i]]: b}), {}))
	.then((providers) => {
		const wss = new WebSocket.Server({port: 8080});

		wss.on('connection', (ws) => {

			ws.on('message', (rawMessage) => {
				try {
					const msg = JSON.parse(rawMessage);

					switch(msg.command) {
						case CMD_SEARCH:
								const messages = msg.providers
									.map(x => providers[x])
									.reduce((a, b) => [...a, ...b.handleQuery('')], []);

								nuance.processMessages(messages, (result) => {
									// send result to ws
								});
							break;
					}
				}
				catch (error) {
					console.log(error)
				}
			});
		});
	});



