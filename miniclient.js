const WebSocket = require('ws');

var ws = new WebSocket('ws://localhost:8080/');

ws.on('open', function () {
    var queryObj = {
        command: "search",
        providers: ['twitter', 'reddit'],
        args: {
            query: {
                text: "obama",
                type: "mixed",
                time: "month",
                max: 100
            }
        }
    };

    ws.send(JSON.stringify(queryObj));
    console.log("Sent");
});

ws.on('message', function (msg) {
    console.log(msg);
});