import express from 'express'
import BodyParser from 'body-parser'
import http from 'http'
import _ from 'underscore'

import noble from 'noble'

import hid from 'node-hid'

var devices = hid.devices()

console.log(devices)
console.log(devices[0].path)
var device = new hid.HID(devices[0].path)

console.log(device)

console.log(device.getDeviceInfo())


noble.state = 'poweredOn'
var serviceUUIDs = []
noble.startScanning(serviceUUIDs, false, (err) => {
    console.log(serviceUUIDs);
});

noble.on('discover', (peripheral) => {
    console.log(peripheral)
});

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
server.listen(3000, function () {
	console.log('app is listening on port 3000')
})

export default app
