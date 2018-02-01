var example = example || {};
$(function () {

    setPercentage(50);

    var oscPort = new osc.WebSocketPort({
        url: "ws://localhost:8081"
    });
    oscPort.open();
    oscPort.on("message", function (msg) {
        //console.log("message", msg);
        setData(msg);
    });
});

function setPercentage(p){
    var circ1 = $('.circularProgress');
    var textElement = $('.circularProgress__overlay');
    circ1[0].className = 'circularProgress --' + p;
    circ1[1].className = 'circularProgress --' + (100-p);
    textElement.eq(0).text(p+'%');
    textElement.eq(1).text(100-p+'%');
};

Number.prototype.toFixedDown = function(digits) {
    var re = new RegExp("(\\d+\\.\\d{" + digits + "})(\\d)"),
        m = this.toString().match(re);
    return m ? parseFloat(m[1]) : this.valueOf();
};

var canvas;


var maxParticles, particleBreakDistance;
//var particleCountSlider, lineDistanceSlider, speedSlider;
var particles = [];

var mAlphaAbs = 0.01, mBetaAbs = 0.01, mDeltaAbs = 0.01, mThetaAbs = 0.01, mGammaAbs = 0.01, mAcc = [0,0,0], mAbs;

var head, touching = 0, mod = 0;

function setData(msg){
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
}

function setup() {
    canvas = createCanvas(windowWidth, windowHeight, WEBGL);

    console.log("Canvas Size :" + width + "x" + height);
    canvas.parent('mainCanvas');
    frameRate(30);
    strokeWeight(2);
    stroke(255);
}
function preload() {
    //head = loadModel('assets/HeadPlanes_Simple_High.obj');
    head = loadModel('assets/HeadPlanes_Simple_Low.obj');
}
function draw() {
    ambientLight(157,173,183);
    directionalLight(255,231,0, 0, 1, -.5);
    directionalLight(2,56,82, 0, -1, 0);

    background(0,153,218);

    if (frameCount % 15 == 1) {
        mAbs = (mDeltaAbs);
        console.log("abs: ");
        console.log(mAbs);
    }
    if (frameCount % 45 == 1) {
        //mod -= .02;
    }

    translate(0,100,0);
    rotateX(PI);

    if (touching == 1) {
        headMotion();
        var modAbs = mAbs + mod;
        console.log(modAbs);
        var mappedEEG = map(constrain(modAbs, .2, 1.7), -.2, 1.7, 0, 100);
        setPercentage(Math.floor(mappedEEG));
    } else {
        mod = 0;
        setPercentage(50);
    }
    noStroke();
    ambientMaterial(200);
    //normalMaterial();
    scale(30);
    model(head);

    //get edges to work from  https://raw.githubusercontent.com/Lucaslpena/MuseWebInstallation/9ccf022c88b991aa955ca9107ea159268d7491d1/dist/js/main.js?token=AG26OQe69jmrCpFlDxoZHruGyjgGkI7gks5adaP6wA%3D%3D
}

prevAX = 0;
function headMotion(){
    if ((mAcc[0] != 0) && (mAcc[0] != 1) && (mAcc[1] != 0) && (mAcc[1] != 1)) {

        var xRot = map(mAcc[0], -1, 1, PI/3, -PI/3);
        //console.log(Math.round(degrees(xRot)));
        rotateX(xRot);

        var yRot = map(mAcc[1], -1, 1, PI/4 , -PI/4 );
        //console.log(Math.round(degrees(yRot)));
        rotateZ(yRot);
    }
}

