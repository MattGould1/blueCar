import express from 'express'
import BodyParser from 'body-parser'
import http from 'http'
import _ from 'underscore'

var dualShock = require('dualshock-controller');

//pass options to init the controller.
var controller = dualShock(
    {
        //you can use a ds4 by uncommenting this line.
        //config: "dualshock4-generic-driver",
        //if the above configuration doesn't work for you,
        //try uncommenting the following line instead.
        //config: "dualshock4-alternate-driver"
        //if using ds4 comment this line.
        config: "dualShock3",
        //smooths the output from the acelerometers (moving averages) defaults to true
        accelerometerSmoothing: true,
        //smooths the output from the analog sticks (moving averages) defaults to false
        analogStickSmoothing: false
    });

//make sure you add an error event handler
controller.on('error', err => console.log(err));

//DualShock 4 control rumble and light settings for the controller
controller.setExtras({
  rumbleLeft:  0,   // 0-255 (Rumble left intensity)
  rumbleRight: 0,   // 0-255 (Rumble right intensity)
  red:         0,   // 0-255 (Red intensity)
  green:       75,  // 0-255 (Blue intensity)
  blue:        225, // 0-255 (Green intensity)
  flashOn:     40,  // 0-255 (Flash on time)
  flashOff:    10   // 0-255 (Flash off time)
});

//DualShock 3 control rumble and light settings for the controller
controller.setExtras({
  rumbleLeft:  0,   // 0-1 (Rumble left on/off)
  rumbleRight: 0,   // 0-255 (Rumble right intensity)
  led: 2 // 2 | 4 | 8 | 16 (Leds 1-4 on/off, bitmasked)
});

//add event handlers:
controller.on('left:move', data => console.log('left Moved: ' + data.x + ' | ' + data.y));

controller.on('right:move', data => console.log('right Moved: ' + data.x + ' | ' + data.y));

controller.on('connected', () => console.log('connected'));

controller.on('square:press', ()=> console.log('square press'));

controller.on('square:release', () => console.log('square release'));

//sixasis motion events:
//the object returned from each of the movement events is as follows:
//{
//    direction : values can be: 1 for right, forward and up. 2 for left, backwards and down.
//    value : values will be from 0 to 120 for directions right, forward and up and from 0 to -120 for left, backwards and down.
//}

//DualShock 4 TouchPad
//finger 1 is x1 finger 2 is x2
controller.on('touchpad:x1:active', () => console.log('touchpad one finger active'));

controller.on('touchpad:x2:active', () => console.log('touchpad two fingers active'));

controller.on('touchpad:x2:inactive', () => console.log('touchpad back to single finger'));

controller.on('touchpad:x1', data => console.log('touchpad x1:', data.x, data.y));

controller.on('touchpad:x2', data => console.log('touchpad x2:', data.x, data.y));


//right-left movement
controller.on('rightLeft:motion', data => console.log(data));

//forward-back movement
controller.on('forwardBackward:motion', data => console.log(data));

//up-down movement
controller.on('upDown:motion', data => console.log(data));

//controller status
//as of version 0.6.2 you can get the battery %, if the controller is connected and if the controller is charging
controller.on('battery:change', data => console.log(data));

controller.on('connection:change', data => console.log(data));

controller.on('charging:change', data => console.log(data));
/*
    Our restful routes will be housed here
*/
// import index from './routes/index'


/*
    RPIO is how we communicate with the PI and manipulate the raspberry pi pins
*/
import rpio from 'rpio'


/*
    in this simple example, we need to use 4 of the available raspberry pi pins,
    this maps functionality from pins to code and can easily be extended if other pins are required
*/
const pins = {
	'drive': {
		'forward': 40,
		'backward': 38,
		'left': 15,
		'right': 13
	}
}

/*
    After we map the pins above, we need to tell the PI about it, we do so by opening the pins and setting the value to LOW
*/
// steer left/right
rpio.open(7, rpio.OUTPUT, rpio.HIGH)
rpio.open(11, rpio.OUTPUT, rpio.HIGH)

// input pins
rpio.open(13, rpio.OUTPUT, rpio.LOW)
rpio.open(15, rpio.OUTPUT, rpio.LOW)

// move forward/backward
rpio.open(37, rpio.OUTPUT, rpio.HIGH)
rpio.open(35, rpio.OUTPUT, rpio.HIGH)

// input pins
rpio.open(38, rpio.OUTPUT, rpio.LOW)
rpio.open(40, rpio.OUTPUT, rpio.LOW)


/*
    SocketIO gives us an easy way to communicate via sockets, the big advantage here is that
    1) sockets allow real time communication
    2) sockets allow the server to push information to the client without any request
*/
import socketio from 'socket.io'

/*
    Start creating our web server and defining options
*/
const app = express()

/*
    BodyParser, as the name suggests, parses the body of an incoming request and gives us an easy way of retrieiving the information
*/
app.use(BodyParser.json())

/*
    Essentially we're building an API, with sockets, we need to allow outside requests for phones etc
*/
app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  next()
})

app.use('/public', express.static(__dirname + '/public'))

/*
    Create our webserver
*/
var server = http.createServer(app)

/*
    Create our sockets
*/
var sio = socketio(server)

/*
    Whenever a client connects, anything inside 'connection' will be run, in our case
    1) the drive socket becomes available
    2) an interval is set and the server emits a string to the client
*/
sio.on('connection', function (socket) {
	/*
        the drive socket allows the client to control the raspberry pi pins
	*/
	socket.on('drive', function (data) {
		if (!process.env.production) {
			console.log(data)
        }
        /*
            We aren't using pulse width modulation yet, just set the pin to full on, or full off
        */
		const speed = (data['speed']) ? rpio.HIGH : rpio.LOW
		const pin = pins.drive[data['direction']]

		console.log(pin);
		console.log(speed);

		rpio.write(pin, speed)
	})

    /*
        Just randomness, make sure the client is connected
    */
	setInterval(function () {
		socket.emit('helloworld', 'hello world')
	}, 2000)
})

/*
    finally start listening for outside requests
*/
// server.listen(3000, function () {
// 	console.log('app is listening on port 3000')
// })

export default app
