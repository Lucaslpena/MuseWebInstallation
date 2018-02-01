var osc = require("osc"),
    express = require("express"),
    WebSocket = require("ws"),
    nodeMuse = require("node-muse"),
    Muse = nodeMuse.Muse,
    pixel = require("node-pixel"),
    five = require("johnny-five"),
    SerialPort = require('serialport');

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
        stateMachine = 2;
    } else {
        stateMachine = 1;
    }
    stateCheck();
}

var lastPush = 0;
function stateCheck(){
    switch (stateMachine){
        case 2:

            var adjustedmAbs = constrain_range(mAbs, -1, 1);
            var limit = Math.round(map_range(adjustedmAbs, -1, 1, 0, 79));
            // if( (lastPush == 0) || ( (limit < lastPush+8 )  && (limit > lastPush-8 ) ) ){
            //     lastPush = limit;
                arduinoHeadsetOn(limit);

            // } else {
            //     arduinoHeadsetOn(lastPush);
            // }
            break;
        default:
            arduinoHeadsetOff();
            break;
    }
}

var port = new SerialPort('/dev/tty.usbmodem1411', function (err) {
    if (err) {
        return console.log('Error: ', err.message);
    }
});
// port.write(Buffer.from('A'), function(err) {
//     if (err) {
//         return console.log('Error on write: ', err.message);
//     }
//     console.log('message written');
// });
// Open errors will be emitted as an error event
port.on('error', function(err) {
    console.log('Error: ', err.message);
});
// port.on('readable', function () {
//     console.log('Data:', port.read());
// });
port.on('data', function (data) {
    console.log('Data:', data);
    //arduinoHeadsetOff();
    arduinoHeadsetOn(50);
});

port.on("open", function () {
    console.log('port opened');
});


function arduinoHeadsetOff(){
    console.log("currently OFF head");
    port.write("1000\n");
}
function arduinoHeadsetOn(val){
    console.log("currently on head with value:", val);
    var strd = String(val);
    port.write(strd + "\n");
};
                // setInterval(function() {
                //     port.write(Buffer.from('A'), function (err) {
                //         if (err) {
                //             return console.log('Error on write: ', err.message);
                //         }
                //         console.log('message written');
                //     })
                // },1000);

                // setInterval(function(){
                //     setInterval(function(){
                //         console.log('pushing new value');
                //         port.write("5\n");
                //     }, 100);
                // }, 6000);


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


function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}
function constrain_range(number, low, high){
    return Math.min(Math.max(parseFloat(number), low), high);
}

