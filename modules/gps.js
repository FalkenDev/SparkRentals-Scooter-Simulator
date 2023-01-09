/**
 * A Module for simulating gps position
 * This module has support for simulating movement accross a GPX route
 */


const maxLat = parseFloat(process.env.SIMULATION_MAX_LAT);
const minLat = parseFloat(process.env.SIMULATION_MIN_LAT);

const maxLon = parseFloat(process.env.SIMULATION_MAX_LON);
const minLon = parseFloat(process.env.SIMULATION_MIN_LON);

const routePadding = process.env.SIMULATION_ROUTE_PADDING;

/**
 * Takes lat and lon from source to destination, calculates distnace in km
 * @param mixed lat1
 * @param mixed lat2
 * @param mixed lon1
 * @param mixed lon2
 * 
 * @return number
 */
function distance(lat1, lat2, lon1, lon2) {
    // The math module contains a function
    // named toRadians which converts from
    // degrees to radians.
    lon1 =  lon1 * Math.PI / 180;
    lon2 = lon2 * Math.PI / 180;
    lat1 = lat1 * Math.PI / 180;
    lat2 = lat2 * Math.PI / 180;

    // Haversine formula
    let dlon = lon2 - lon1;
    let dlat = lat2 - lat1;
    let a = Math.pow(Math.sin(dlat / 2), 2)
    + Math.cos(lat1) * Math.cos(lat2)
    * Math.pow(Math.sin(dlon / 2),2);

    let c = 2 * Math.asin(Math.sqrt(a));

    // Radius of earth in kilometers. Use 3956
    // for miles
    let r = 6371;

    // calculate the result
    return(c * r);
}

/**
 * Returns random coordinate in boundary defined above.
 * @return coordinate
 */
function getRandomCoordnates() {
    const latSpan = maxLat - minLat;
    const lonSpan = maxLon - minLon;
    return {
        latitude: minLat + latSpan * Math.random(),
        longitude: minLon + lonSpan * Math.random()
    };
}

function padRoute(nodes, steps) {
    const paddedNodes = [];
    for (let i = 0; i < nodes.length - 1; i++) {
        const stepSizeLatitude = (nodes[i + 1][1] - nodes[i][1]) / steps;
        const stepSizeLongitude = (nodes[i + 1][0] - nodes[i][0]) / steps;
        for (let j = 0; j < steps; j++) {
            const lat = parseFloat((nodes[i][1] + (stepSizeLatitude * j)).toFixed(6));
            const lon = parseFloat((nodes[i][0] + (stepSizeLongitude * j)).toFixed(6));
            paddedNodes.push({latitude: lat, longitude: lon})
        }
    }
    const org = [];
    for (let j = 0; j < nodes.length; j++) {
        const lat = nodes[j][1];
        const lon = nodes[j][0];
        org.push({latitude: lat, longitude: lon})
    }
    return paddedNodes;
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
    this.loadRoute = async () => {
        const destination = getRandomCoordnates();
        this.route = new RouteHandler();
        await this.route.generateRoute(this.coordinates, destination);
    };
    this.update = (deltaTime) => {
        if (this.route && this.route.route) {
            const result = this.route.move();
            if (result.finished) {
                // do something?
                this.speed = 0;
                this.route = null;
                return;
            }
            this.coordinates = result.coordinates;
            const deltaTimeHour = deltaTime / 1000.0 / 60.0 / 60.0; 
            this.speed = result.distanceTraveledKilometers / deltaTimeHour;
        }
    }
    this.stopRoute = () => {
        this.route = null;
        this.speed = 0;
    }
}

/**
 * RouteHandler, handles loading and moving on a route.
 * @return RouteHandler
 */
function RouteHandler () {
    this.route = null;
    this.traveledKilometers = 0;
    this.generateRoute = async (start, destination) => {
        const apiKey = process.env.GEOAPIFY_KEY;
        const response = await fetch(`https://api.geoapify.com/v1/routing?waypoints=${start.latitude},${start.longitude}|${destination.latitude},${destination.longitude}&mode=walk&apiKey=${apiKey}`);
        const result = await response.json();
        let nodes = result.features[0].geometry.coordinates[0];
        this.route = padRoute(nodes, routePadding);
        this.currentIndex = 0;
    }
    this.move = () => {
        const start = this.route[this.currentIndex];
        // if something happened, abort
        if (!start) {
            console.log("Unexpected stop", start)
            return {
                finished: true
            };
        }
        let end = null;
        // Failsafe if trying to move past final destination
        if (this.currentIndex < this.route.length - 1) {
            end = this.route[this.currentIndex + 1];
            this.traveledKilometers += distance(start.latitude, end.latitude, start.longitude, end.longitude);
            this.currentIndex++;
        } else {
            end = start;
        }
        return {
            finished: this.currentIndex >= this.route.length,
            stepsLeft: this.route.length - this.currentIndex,
            distanceTraveledKilometers: distance(start.latitude, end.latitude, start.longitude, end.longitude),
            coordinates: this.route[this.currentIndex]
        };
    };
}

module.exports = {
    GPSComponent: GPSComponent
}
