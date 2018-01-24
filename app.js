// var http = require('http');
// var fs = require('fs');
//
// function onRequest(request, response){
//     response.writeHead(200, {'Content-Type': 'text/html'});
//     fs.readFile('./dist/index.html', null, function(error, data) {
//       if (error) {
//         response.writeHead(404);
//         response.write('File not found!!');
//       } else {
//         response.write(data);
//       }
//         response.end();
//     });
// }
// http.createServer(onRequest).listen(3000);
/** --Connection To OSC is confirmed--
// var osc = require("osc");
// var getIPAddresses = function () {
//     var os = require("os"),
//         interfaces = os.networkInterfaces(),
//         ipAddresses = [];
//
//     for (var deviceName in interfaces) {
//         var addresses = interfaces[deviceName];
//         for (var i = 0; i < addresses.length; i++) {
//             var addressInfo = addresses[i];
//             if (addressInfo.family === "IPv4" && !addressInfo.internal) {
//                 ipAddresses.push(addressInfo.address);
//             }
//         }
//     }
//     return ipAddresses;
// };
//
// var udpPort = new osc.UDPPort({
//     localAddress: "0.0.0.0",
//     localPort: 5001
// });
//
// udpPort.on("ready", function () {
//     var ipAddresses = getIPAddresses();
//
//     console.log("Listening for OSC over UDP.");
//     ipAddresses.forEach(function (address) {
//         console.log(" Host:", address + ", Port:", udpPort.options.localPort);
//     });
// });
//
//
// GLOBAL.window = GLOBAL;
// udpPort.on("message", function (oscMessage) {
//     console.log(oscMessage);
//     GLOBAL = oscMessage;
// });
//
// udpPort.on("error", function (err) {
//     console.log(err);
// });
//
// udpPort.open();
 **/

var osc = require("osc"),
    express = require("express"),
    WebSocket = require("ws"),
    nodeMuse = require("node-muse"),
    Muse = nodeMuse.Muse;


var getIPAddresses = function () {
    var os = require("os"),
        interfaces = os.networkInterfaces(),
        ipAddresses = [];
    for (var deviceName in interfaces) {
        var addresses = interfaces[deviceName];
        for (var i = 0; i < addresses.length; i++) {
            var addressInfo = addresses[i];
            if (addressInfo.family === "IPv4" && !addressInfo.internal) {
                ipAddresses.push(addressInfo.address);
            }
        }
    }
    return ipAddresses;
};

// Bind to a UDP socket to listen for incoming OSC events.
var udpPort = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: 5002
});
udpPort.on("message", function (oscMessage) {
    fitlterMsg(oscMessage);
});
udpPort.on("ready", function () {
    var ipAddresses = getIPAddresses();
    console.log("Listening for OSC over UDP.");
    ipAddresses.forEach(function (address) {
        console.log(" Host:", address + ", Port:", udpPort.options.localPort);
    });
    console.log("To start the demo, go to http://localhost:8081 in your web browser.");
});

udpPort.open();

// Create an Express-based Web Socket server to which OSC messages will be relayed.
var appResources = __dirname + "/dist",
    app = express(),
    server = app.listen(8081),
    wss = new WebSocket.Server({
        server: server
    });

app.use("/", express.static(appResources));
wss.on("connection", function (socket) {
    console.log("A Web Socket connection has been established!");
    var socketPort = new osc.WebSocketPort({
        socket: socket
    });
     console.log(socketPort);
    var relay = new osc.Relay(udpPort, socketPort, {
        raw: true
    });
});

var mAlphaAbs = 0.01, mBetaAbs = 0.01, mDeltaAbs = 0.01, mThetaAbs = 0.01, mGammaAbs = 0.01, mAbs;
function fitlterMsg(msg){
    console.log(msg);

    switch (msg.address){
        case ('/muse/elements/alpha_absolute'):
            mAlphaAbs = msg.args[0];
            break;
        case ('/muse/elements/beta_absolute'):
            mBetaAbs = msg.args[0];
            break;
        case ('/muse/elements/delta_absolute'):
            mDeltaAbs = msg.args[0];
            break;
        case ('/muse/elements/gamma_absolute'):
            mGammaAbs = msg.args[0];
            break;
        case ('/muse/elements/theta_absolute'):
            mThetaAbs = msg.args[0];
            break;
        case ('/muse/acc'):
            mAcc = msg.args;
            break;
        default :
            break;
    }

    mAbs = (mAlphaAbs + mBetaAbs + mDeltaAbs + mGammaAbs + mThetaAbs) / 5;
    console.log(mAbs);
    // console.log(mAlphaAbs);
    // console.log(mBetaAbs);
    // console.log(mDeltaAbs);
    // console.log(mGammaAbs);
    // console.log(mThetaAbs);
}



pixel = require("node-pixel");
five = require("johnny-five");

var board = new five.Board({});
var strip = null;

board.on("ready", function() {

    strip = new pixel.Strip({
        board: this,
        controller: "FIRMATA",
        strips: [ {pin: 6, length: 42}, ], // this is preferred form for definition
        gamma: 2.8, // set to a gamma that works nicely for WS2812
    });

    strip.on("ready", function() {
        // do stuff with the strip here.
        strip.color("#ff0000");
        strip.show();
    });
});