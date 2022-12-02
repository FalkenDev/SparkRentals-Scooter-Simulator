/**
 * A Module for simulating gps position
 * This module has support for simulating movement accross a GPX route
 */

const maxLat = 56.166217;
const minLat = 56.158594;
const minLon = 15.583096;
const maxLon = 15.593868;

function getRandomCoordnates() {
    const latSpan = maxLat - minLat;
    const lonSpan = maxLon - minLon;
    return {
        latitude: minLat + latSpan * Math.random(),
        longitude: minLon + lonSpan * Math.random()
    };
}


/**
 * A Component that pretends to be a gps unit
 * @param coordinates
 * 
 * @return null
 */
function GPSComponent (coordinates) {
    this.speed = 0;
    if (coordinates) {
        this.coordinates = coordinates;
    } else {
        // Load "default"
        this.coordinates = getRandomCoordnates();
    }
    this.loadRoute = () => {

    };
}

function RouteHandler () {
    this.route = null;
    this.loadRoute = () => {

    };
    this.generateRoute = () => {
        
    }
}

module.exports = {
    GPSComponent: GPSComponent
}
