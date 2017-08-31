# Running the client
docker run -ti --rm --net host --privileged -p 8100:8100 -p 35729:35729 -v /dev/bus/usb:/dev/bus/usb -v ~/.gradle:/root/.gradle -v ~/Projects/blueCar/client/blueCar:/Sources:rw marcoturi/ionic ionic serve


## Initial setup
In the event of an error similar to "ionic serve requests an ionic directory" you will first need to create an ionic project

### Creating Ionic Project
docker run -ti --rm --net host --privileged -p 8100:8100 -p 35729:35729 -v /dev/bus/usb:/dev/bus/usb -v ~/.gradle:/root/.gradle -v ~/Projects/blueCar/client/blueCar:/Sources:rw marcoturi/ionic ionic start PROJECTNAME

## Generating additional pages etc
docker run -ti --rm --net host --privileged -p 8100:8100 -p 35729:35729 -v /dev/bus/usb:/dev/bus/usb -v ~/.gradle:/root/.gradle -v ~/Projects/blueCar/client/blueCar:/Sources:rw marcoturi/ionic ionic generate TYPE NAME
https://ionicframework.com/docs/cli/generate/

## Installing additional modules/plugins
docker run -ti --rm --net host --privileged -p 8100:8100 -p 35729:35729 -v /dev/bus/usb:/dev/bus/usb -v ~/.gradle:/root/.gradle -v ~/Projects/blueCar/client/blueCar:/Sources:rw marcoturi/ionic IONIC COMMAND
