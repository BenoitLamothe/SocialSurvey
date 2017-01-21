const Nuance = require('./nuance');

Nuance({
	nmaid: 'Nuance_ConUHack2017_20170119_210049',
	nmaidKey: '0d11e9c5b897eefdc7e0aad840bf4316a44ea91f0d76a2b053be294ce95c7439dee8c3a6453cf7db31a12e08555b266d54c2300470e4140a4ea4c8ba285962fd',
}, {
	appName: 'SocialSurvey',
	companyName: 'ConUHacks',
	cloudModelVersion: '1.0.0',
	clientAppVersion: '0.0',
}).then((api) => {
	console.log('Nina is ready');
	api.send({
		command: {
			name: 'NinaDoNLU',
			text: 'My friend died last week',
			nlu_engine: 'NLE',
		}
	});
});
