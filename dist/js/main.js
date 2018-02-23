var example = example || {};
$(function () {

    setPercentage(1);

    var oscPort = new osc.WebSocketPort({
        url: "ws://localhost:8081"
    });
    oscPort.open();
    oscPort.on("message", function (msg) {
        //console.log("message", msg);
        setData(msg);
    });
});

function setPercentage(p){ //https://codepen.io/jwhitfieldseed/pen/JpmfF?page=1&
    console.log(p);
    if (p == 0){
        p = 1;
    }
    var bars = document.querySelectorAll('.progress-bar');
    [].forEach.call(bars, function(bar) {
        bar.setAttribute('data-progress', '' + (p/100));
    });
    if (p >= 99) {
        won();
    }
};

function won(){
    $('.modal').removeClass('ready');
    $('.modal').addClass('won');
}

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

var head, touching = 0, mod = 0, winningLimit = 0.35;

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
    head = loadModel('assets/HeadPlanes_Simple_High2.obj');
    //head = loadModel('assets/HeadPlanes_Simple_Low.obj');
}
function draw() {
    ambientLight(157,173,183);
    directionalLight(255,231,0, 0, 1, -.5);
    directionalLight(2,56,82, 0, -1, 0);

    background(0,153,218);

    if (frameCount % 15 == 1) {
        mAbs = (mDeltaAbs);                 //<<<<<<<<<<< DELTA WAVES
    }
    if (frameCount % 45 == 1) {
        //console.log("abs: ");
        //console.log(mAbs);
    }

    translate(0,100,0);
    rotateX(PI);
    rotateY(PI);

    if (touching == 1) {
        headMotion();
        var modAbs = mAbs + mod;
        console.log(modAbs);
        modAbs = (modAbs == 0.0) ? 1.7 : modAbs;
        console.log(modAbs);
        var mappedEEG = map(constrain(modAbs, winningLimit, 1.7), winningLimit, 1.7, 100, 0);
        setPercentage(Math.floor(mappedEEG));
    } else {
        mod = 0;
        setPercentage(1);
        $('.modal').removeClass('won');
        $('.modal').addClass('ready');
    }
    noStroke();
    ambientMaterial(200);
    //normalMaterial();
    scale(30);
    model(head);
}

prevAX = 0;
function headMotion(){
    if ((mAcc[0] != 0) && (mAcc[0] != 1) && (mAcc[1] != 0) && (mAcc[1] != 1)) {

        var xRot = map(mAcc[0], -1, 1, -PI/3, PI/3);
        //console.log(Math.round(degrees(xRot)));
        rotateX(xRot);

        var yRot = map(mAcc[1], -1, 1, -PI/4 , PI/4 );
        //console.log(Math.round(degrees(yRot)));
        rotateZ(yRot);
    }
}

