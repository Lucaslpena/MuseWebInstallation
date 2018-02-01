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
// udpPort.on("message", function (oscMessage) {
//     fitlterMsg(oscMessage);
// });
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
    mAbs = 0.01,
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
        stateMachine = 2;git
    }
}

var fps = 60;

var board = new five.Board({});
var strip = null;
var strip_length = 20;

board.on("ready", function() {

    strip = new pixel.Strip({
        board: this,
        controller: "FIRMATA",
       strips: [ {pin: 6, length: strip_length}, {pin: 3, length: strip_length}  ], // this is preferred form for definition
        //strips: [ {pin: 6, length: strip_length} ], // this is preferred form for definition
        gamma: 2.8, // set to a gamma that works nicely for WS2812
    });

    // strip_top = new pixel.Strip({
    //     board: this,
    //     controller: "FIRMATA",
    //     strips: [ {pin: 3, length: 79}, ], // this is preferred form for definition
    //     gamma: 2.8, // set to a gamma that works nicely for WS2812
    // });


    strip.on("ready", function() {
        strip.show("#000000");
        console.log("Strip ready");
        console.log(strip.length);
        stateCheck();
    });

    function flasher(){
        var colors = ["red", "green", "blue"];
        var current_colors = [0,1,2];
        var pixel_list = [0,1,2];
        var blinker = setInterval(function() {
            if (stateMachine != 1){
                stateCheck();
            }

            strip.color("#000"); // blanks it out
            for (var i=0; i< pixel_list.length; i++) {
                if (++pixel_list[i] >= strip.length) {
                    pixel_list[i] = 0;
                    if (++current_colors[i] >= colors.length) current_colors[i] = 0;
                }
                strip.pixel(pixel_list[i]).color(colors[current_colors[i]]);
            }

            strip.show();
        }, 1000/fps);
    }


    // strip.on("ready", function() {
    //     console.log("initializing strip");
    //     //strip.color("#ff0000");
    //     //strip.show();
    //     //dynamicRainbow(fps);
    //     stateCheck();
    // });
    // strip_top.on("ready", function() {
    //     console.log("initializing strip");
    //     strip.color("#00ff00");
    //     strip.show();
    //     //dynamicRainbow(fps);
    //     // stateCheck();
    // });


    function stateCheck(){
        switch (stateMachine){
            case 2:
                console.log("currently on head");
                meditation();
                break;
            default:  //idle state
                dynamicRainbow(800);
                //flasher();
                break;
        }
    }

    function meditation(){
        var colors = ["red", "green", "blue"];
        var current_colors = [0,1,2];
        var pixel_list = [0,1,2];
        var faker = 0;
        var timer = Date.now();
        var blinker = setInterval(function() {

            // strip.color("#023852"); // blanks it out
            // for (var i=0; i< pixel_list.length; i++) {
            //     if (++pixel_list[i] >= strip.length) {
            //         pixel_list[i] = 0;
            //         if (++current_colors[i] >= colors.length) current_colors[i] = 0;
            //     }
            //     strip.pixel(pixel_list[i]).color(colors[current_colors[i]]);
            // }

            if (stateMachine != 2){
                stateCheck();
            }

            var adjustedmAbs = constrain_range(mAbs + faker, -1, 1);

            if ((Date.now() - timer) > 1500) {
                timer = Date.now();
                //faker -= 0.01;
            }


            //console.log(strip.length);

            console.log(adjustedmAbs);
            var limit = map_range(adjustedmAbs, -1, 1, 0, strip.length);
            console.log(limit);
            strip.color("#023852");
            for (var i = 0; i < parseInt(limit); i++){
                strip.color("#023852");

                strip.pixel(i).color("#FFE700");
            }
            for (var j = 0; parseInt(limit) < strip.length; j++){
                strip.pixel(i).color("#FFE700");
            }

            strip.show();

        }, 1000/fps);

    }


    function dynamicRainbow(){
        console.log( 'dynamicRainbow' );

        var showColor;
        var cwi = 0; // colour wheel index (current position on colour wheel)
        var foo = setInterval(function(){
            // if (stateMachine != 1){
            //     stateCheck();
            // }
            if (++cwi >= 255) {
                cwi = 0;
            }

            for(var i = 0; i < strip.length; i++) {
                showColor = colorWheel( ( cwi+i ) & 255 );
                strip.pixel( i ).color( showColor );
                //strip.pixel( i+ strip.length/2 ).color( showColor );
            }
            strip.show();

        }, 1000/60);
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

function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}
function constrain_range(number, low, high){
    return Math.min(Math.max(parseFloat(number), low), high);
}
