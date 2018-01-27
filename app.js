var osc = require("osc"),
    express = require("express"),
    WebSocket = require("ws"),
    nodeMuse = require("node-muse"),
    Muse = nodeMuse.Muse,
    pixel = require("node-pixel"),
    five = require("johnny-five");

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

var mAlphaAbs = 0.01,
    mBetaAbs = 0.01,
    mDeltaAbs = 0.01,
    mThetaAbs = 0.01,
    mGammaAbs = 0.01,
    mAbs,
    touching = 0,
    stateMachine = 1;
function fitlterMsg(msg){
    //console.log(msg);

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
        case ('/muse/elements/touching_forehead'):
            touching = msg.args[0];
            break;
        case ('/muse/acc'):
            mAcc = msg.args;
            break;
        default :
            break;
    }

    mAbs = (mAlphaAbs + mBetaAbs + mDeltaAbs + mGammaAbs + mThetaAbs) / 5;
    //console.log(mAbs);
    // console.log(mAlphaAbs);
    // console.log(mBetaAbs);
    // console.log(mDeltaAbs);
    // console.log(mGammaAbs);
    // console.log(mThetaAbs);

    if (touching == 1){
        stateMachine = 2;
    }
}

var fps = 30;

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
        console.log("initializing strip");
        //strip.color("#ff0000");
        //strip.show();
        //dynamicRainbow(fps);
        stateCheck();
    });

    function stateCheck(){
        switch (stateMachine){
            case 2:
                strip.color("#ff0000");
                strip.show();
                break;
            default:  //idle state
                dynamicRainbow();
                break;
        }
    }

    function dynamicRainbow(delay){
        console.log( 'dynamicRainbow' );
        var showColor;
        var cwi = 0; // colour wheel index (current position on colour wheel)
        var foo = setInterval(function(){
            if (++cwi > 255) {
                cwi = 0;
            }

            for(var i = 0; i < strip.length; i++) {
                showColor = colorWheel( ( cwi+i ) & 255 );
                strip.pixel( i ).color( showColor );
            }
            strip.show();
            if (stateMachine != 1){

                stateCheck();
            }
        }, 1000/delay);
    }

    // Input a value 0 to 255 to get a color value.
    // The colors are a transition r - g - b - back to r.
    function colorWheel( WheelPos ){
        var r,g,b;
        WheelPos = 255 - WheelPos;

        if ( WheelPos < 85 ) {
            r = 255 - WheelPos * 3;
            g = 0;
            b = WheelPos * 3;
        } else if (WheelPos < 170) {
            WheelPos -= 85;
            r = 0;
            g = WheelPos * 3;
            b = 255 - WheelPos * 3;
        } else {
            WheelPos -= 170;
            r = WheelPos * 3;
            g = 255 - WheelPos * 3;
            b = 0;
        }
        // returns a string with the rgb value to be used as the parameter
        return "rgb(" + r +"," + g + "," + b + ")";
    }
});
