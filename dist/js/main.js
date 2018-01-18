$(function () {
    var element = $('.circularProgress');
    var textElement = $('.circularProgress__overlay');

    window.setPercentage = function setPercentage(p){
        element[0].className = 'circularProgress --' + p;
        textElement.text(p+'%');
    }

    window.setPercentage(25);

});


var canvas;

var maxParticles, particleBreakDistance;
var particleCountSlider, lineDistanceSlider, speedSlider;
var particles = [];

function setup() {
    canvas = createCanvas(windowWidth, windowHeight);

    console.log("Canvas Size :" + width + "x" + height);
    canvas.parent('mainCanvas');
    frameRate(60);
    strokeWeight(2);
    stroke(255);

    maxParticles = 1;

    particleCountSlider = createSlider(10, 200, 100);
    particleCountSlider.position(20, 20);

    lineDistanceSlider = createSlider(5, 25, 15);
    lineDistanceSlider.position(20, 60);

    speedSlider = createSlider(-100, 200, 0);
    speedSlider.position(20, 100);
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
                stroke(100*(posi.x/width), 90, 90, 255 - 255*dist/particleBreakDistance );
                //stroke(200,200,200);
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
    background(0,136,210);

    text("particleCount", particleCountSlider.x * 2 + particleCountSlider.width, 35);
    text("lineDistanceSlider", lineDistanceSlider.x * 2 + lineDistanceSlider.width, 75);
    text("speedSlider", speedSlider.x * 2 + speedSlider.width, 105);

    //console.log(speedSlider.value() * .01);


    loadParticles();
    drawParticles();
    particleBreakDistance = max(width, height) / lineDistanceSlider.value();
    //particleBreakDistance = min(particleBreakDistance + 1, width / 12);
}
