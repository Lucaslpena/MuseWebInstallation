var example = example || {};
$(function () {

    var circ1 = $('.circularProgress');
    var textElement = $('.circularProgress__overlay');
    window.setPercentage = function setPercentage(p){
        circ1[0].className = 'circularProgress --' + p;
        circ1[1].className = 'circularProgress --' + (100-p);
        textElement.eq(0).text(p+'%');
        textElement.eq(1).text(100-p+'%');
    };
    window.setPercentage(50);

    var oscPort = new osc.WebSocketPort({
        url: "ws://localhost:8081"
    });
    oscPort.open();
    oscPort.on("message", function (msg) {
        //console.log("message", msg);
        setData(msg);
    });
});

Number.prototype.toFixedDown = function(digits) {
    var re = new RegExp("(\\d+\\.\\d{" + digits + "})(\\d)"),
        m = this.toString().match(re);
    return m ? parseFloat(m[1]) : this.valueOf();
};

var canvas;

var maxParticles, particleBreakDistance;
var particleCountSlider, lineDistanceSlider, speedSlider;
var particles = [];

var mAlphaAbs = 0.01, mBetaAbs = 0.01, mDeltaAbs = 0.01, mThetaAbs = 0.01, mGammaAbs = 0.01, mAcc = [0,0,0], mAbs;

var head, touching = 0;

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

    maxParticles = 1;

    // particleCountSlider = createSlider(10, 200, 100);
    // particleCountSlider.position(20, 20);
    //
    // lineDistanceSlider = createSlider(5, 25, 15);
    // lineDistanceSlider.position(20, 60);
    //
    // speedSlider = createSlider(-100, 200, 0);
    // speedSlider.position(20, 100);
}
function preload() {
    head = loadModel('assets/head.obj');
}
function loadParticles(){
    while (particles.length != particleCountSlider.value()) {
        if (particles.length < particleCountSlider.value()) {
            obj = [createVector(random(width), random(height)), createVector(random(4) - 2, random(4) - 2)]; //pos, speed
            particles.push(obj);
        } else {
            particles.pop();
        }
    }
}
function drawParticles() {

    colorMode(HSB, 100);
    for (var i = 0; i < particles.length; i++) {
        var posi = particles[i][0];
        for (var j = i + 1; j < particles.length; j++) {
            var posj = particles[j][0];
            var dist = posi.dist(posj);
            if (dist <= particleBreakDistance) {
                strokeWeight(2-(dist/particleBreakDistance));
                //stroke(100*(posi.x/width), 90, 90, 255 - 255*dist/particleBreakDistance );
                stroke(200,200,200);
                line(posi.x, posi.y, posj.x, posj.y);
            }
        }
    }

    colorMode(RGB, 255);
    fill(247,240,38,150);
    noStroke();

    //var mousePos = createVector(mouseX, mouseY);

    var size = 5;
    for (var i = 0; i < particles.length; i++) {
        var pos = particles[i][0];
        var speed = particles[i][1];
        ellipse(pos.x, pos.y, size, size);

        var newSpeed = speed.copy(); // needed for reference breaking
        newSpeed.setMag(particles[i][1].mag() + (speedSlider.value() * .01));

        newSpeed.limit(4);
        pos.add(newSpeed);


        //var distToMouse = mousePos.dist(pos);

        // if (distToMouse < repelDist) {
        //     var repel = createVector(pos.x - mousePos.x, pos.y - mousePos.y);
        //     var distFrac = (repelDist - distToMouse) / repelDist;
        //     repel.setMag(50 * distFrac * distFrac);
        //     pos.add(repel);
        // }

        if (pos.x > width) {
            pos.x -= width;
            pos.y += random(height / 10) - height / 20;
        }
        else if (pos.x < 0) {
            pos.x += width;
            pos.y += random(height / 10) - height / 20;
        }

        if (pos.y > height) {
            pos.y -= height;
            pos.x += random(width / 10) - width / 20;
        }
        else if (pos.y < 0) {
            pos.y += height;
            pos.x += random(width / 10) - width / 20;
        }
    }

}
function draw() {
    background(0,153,218);

    //rotateX(mouseY/100);
    //rotateY(mouseX/100);

    // text("particleCount", particleCountSlider.x * 2 + particleCountSlider.width, 35);
    // text("lineDistanceSlider", lineDistanceSlider.x * 2 + lineDistanceSlider.width, 75);
    // text("speedSlider", speedSlider.x * 2 + speedSlider.width, 105);

    //console.log(speedSlider.value() * .01);

    translate(-width/2,-height/2,0);


    // loadParticles();
    // drawParticles();
    //particleBreakDistance = max(width, height) / map(mAbs, -0.4, 0.8, 5, 25);

    if (millis() % 10 == 0) {
        mAbs = (mAlphaAbs + mBetaAbs + mDeltaAbs + mGammaAbs + mThetaAbs) / 5;
        console.log(mAbs);
    }
    translate(width / 2, height / 2 + 50, 0);
    if (touching == 1) {
        var limAX = constrain(mAcc[0], -.5, .5);
        rotateX(radians(map(limAX, -.5, .5, 45, -45)));
        var limAZ = constrain(mAcc[1], -.3, .3);
        rotateZ(radians(map(limAZ, -.3, .3, -25, 25)));
    }
    scale(260);
   model(head);
}
