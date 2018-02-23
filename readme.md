# Interactive EEG - LED Installation
This code was used to create an interactive installation using the [Muse](http://www.choosemuse.com/) sensor to create a little game where you have to become _"focused"_. Once you reach a _"focused"_ threshold, you win the game. 
Feedback includes:
* a 3d model which responds to your head movement. This is connected through the Muse accelerometer to alter the rotation of the model; limited, but in two degrees of freedom.
* a bar under the head model to show focused state. This is mapped between an average starting limit and a threshold. Once passed will present a message on the screen.
* LED control that shows the same data as the bar in the web-page, mapped between two points. When the threshold is reached it flashes.

# The Client
This installation was made for the [MIPS](https://www.youtube.com/watch?v=hAfBOaPqLWo) conference of [Milestone Systems](https://www.milestonesys.com/about-us/) 

See the photos file for more images and videos of the installation in use!

## How to run
To run this with nodemon... sloppy I know but its quick
``nodemon --watch dist/index.html --watch dist/js/main.js --watch dist/css/app.css ./app.js``
``npm run watch-sass``

with arduino plugged in:
``ls /dev/{tty,cu}.*``
get and update port in app.js file

## Stuff That Helped
* [OSC](https://github.com/colinbdclark/osc.js/)
* [Muse-js](https://github.com/urish/muse-js)
* [Muse Documentation](http://developer.choosemuse.com/research-tools/available-data)
* [Serial Node](https://github.com/node-serialport/node-serialport)

## Important Stuff We Learned!

#### Hardware:
* OSC is awesome and provides a great way to send data especially on a local network.
* EEG data is almost completely unreliable and not normalized 🙃    but you can sometimes make it have the illusion of normalization.

#### Software:
* Arduino:
    * Do not rely on ``loop`` to handle timings of the LED
    * Use incoming serial to control internal state-machine
    * That being said you can control the ``frames`` of the arduino with the incoming serial by executing logic only when messages coe in. Then the Node server controls the framerate --see the code. 
    * So your ``loop`` is built around ``Serial.available()``. This makes interruption of functions possible.
    * Nuke delays and deconstruct control loops. If LEDs in a function are build without ``delay`` you can interrupt them way easier. Making the app more responsive.
    
* Web:
     * Adding WEBGL to P5 is very easy 🤓 and usually won't break a 2D interface.
     * OBJ files in P5 are fun but sometimes they are small and need scaling and other times large and take forever to load. Taking time to setup or optimize the files is important.