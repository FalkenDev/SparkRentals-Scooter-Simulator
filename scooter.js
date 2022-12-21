/**
 * A node application to start a single scooter brain.
 * Supposed to be used inside of an electric scooter.
 * For simulation purposes you can run them on a pc.
 * 
 * Environment variables:
 * DBURI
 * 
 * Status values:
 * Available
 * In use
 * Maintenance
 * Off
 * Unavailable
 * Charging
 * Needs charging
 */

require("dotenv").config();
const { ObjectId } = require("mongodb");
const db = require("./modules/sparkdb");
const { GPSComponent } = require("./modules/gps");

const updateFrequencyMilliseconds = process.env.UPDATE_FREQUENCY_MILLISECONDS;
const batteryDepletionRate = process.env.BATTERY_DEPLETION_RATE;
const lowBatteryWarning = 10;

const namingPrefix = "Spark-Rentals#";

/**
 * Loads scooter from database using id
 * Returns a db representation of a scooter or null
 * Will force an exit if not found
  * @param string id
  * 
  * @return db-scooter | null | exit(1)
  */
async function LoadScooter(id) {
    const scooter = await db.findScooter(id);
    if (!scooter) {
        console.log("No scooter found, exiting..");
        process.exit(1);
    }
    return scooter;
}

/**
  * @return db-scooter
  */
async function NewScooter(status, owner, coordinates, battery) {
    const gps = new GPSComponent();
    const id = new ObjectId();
    const scooter = {
        _id: id,
        status: status ? status : "Available",
        name: namingPrefix + id.toString().slice(id.toString().length - 4, id.toString().length),
        battery: battery ? battery : Math.max(20, Math.random() * 100),
        owner: owner ? owner : "Karlskrona",
        trip: null,
        log: [],
        speed: gps.speed,
        coordinates: coordinates ? coordinates : gps.coordinates
    };
    const result = await db.pushScooter(scooter);
    if (!result) {
        console.log("Error pushing scooter to database...");
        process.exit(1);
    }
    return scooter;
}

/**
 * Clears the last line in the console
 * @return void
 */
function clearLastLine() {
    process.stdout.moveCursor(0, -1);
    process.stdout.clearLine(1);
}

/**
 * Prepares for logging to console by clearing a few lines
 * @return void
 */
function prepareWindowForPrint() {
    for (let index = 0; index < 6; index++) {
        clearLastLine();
    }
}

function printScooter(scooter) {
    console.log("Connected to database:", db.getMongoURI());
    console.log("Update frequency:", updateFrequencyMilliseconds, "ms");
    console.log("status:", scooter.status);
    console.log("battery:", scooter.battery);
    console.log("coordinates:", "{ " + scooter.gpsComponent.coordinates.latitude + ", " + scooter.gpsComponent.coordinates.longitude + " }");
    console.log("speed:", scooter.gpsComponent.speed, "km/h")
} 

/**
 * A single scooter simulating a real electric scooter.
 * Pass null to _id for new scooter
 * 
 * functions:
 * load()
 * update()
 * set()
 * dbData()
 * 
 * @return void
 */
function Scooter(_id, status, owner, coordinates, battery) 
{
    this.status = "Off";
    this.owner = null;
    this.gpsComponent = null;
    this.trip = {};
    this.log = [];
    this._id = null;
    this.set = data => {
        this._id = data._id;
        this.name = data.name;
        this.status = data.status;
        this.owner = data.owner;
        this.battery = data.battery;
        this.gpsComponent = new GPSComponent(data.coordinates);
        this.trip = data.trip;
        this.log = data.log;
    };
    this.dbData = () => {
        return {
            _id: this._id,
            name: this.name,
            status: this.status,
            battery: this.battery,
            owner: this.owner,
            currentTrip: this.currentTrip,
            log: this.log,
            speed: this.gpsComponent.speed,
            coordinates: this.gpsComponent.coordinates
        };
    };
    this.load = async (id, print) => {
        if (id) {
            const result = await LoadScooter(id);
            this.set(result);
        } else {
            const result = await NewScooter(status, owner, coordinates, battery);
            this.set(result);
        }
        if (print) {
            console.log("Starting scooter:", this.name);
        }
        if (!this._id) {
            console.log("Something bad happened, error with id");
            process.exit(1);
        }
        // await this.gpsComponent.loadRoute();
        if (print) {
            console.log("Scooter is running");
            printScooter(this);
        }
    };
    this.update = async (print) => {
        const result = await LoadScooter(this._id);
        //If scooter is turned of it wont do anything
        if (this.status === "Off" && result.status === "Off") {
            setTimeout(() => this.update(print), updateFrequencyMilliseconds)
            return;
        }
        this.battery -= batteryDepletionRate * (this.gpsComponent.speed + 1);
        if (result.status !== this.status) {
            if (result.status === "In use") {
                // Start the new trip
                // Rest api have created initialized trip, sync state only
                console.log(`${this.name}: Starting trip`)
                this.gpsComponent.loadRoute();
                this.currentTrip = result.currentTrip;
                this.status = result.status;
            } else if (result.status === "Available" && this.status === "In use") {
                // Stop the current trip
                console.log(`${this.name}: Ending trip`)
                const newLogEntry = {
                    ...this.currentTrip,
                    endPosition: { ...this.gpsComponent.coordinates }
                };
                db.pushLog(this._id, newLogEntry);
                this.currentTrip = null;
            } else if (result.status === "Off") {
                console.log(`${this.name}: Remote shutdown..`);
            } else if (this.status === "Off" && result.status !== "Off") {
                // REMOVE ACTIVATIOM
                console.log(`${this.name}: Remote activation..`);
            }
            this.status = result.status;
        }
        if (this.battery < lowBatteryWarning) {
            this.status = "Unavailable";
            db.updateStatus(this._id, this.status);
        }
        this.gpsComponent.update(updateFrequencyMilliseconds);
        db.updateScooterStates(this._id, this.gpsComponent.coordinates, this.gpsComponent.speed, this.battery);
        if (print) {
            prepareWindowForPrint();
            printScooter(this);
        }
        setTimeout(() => this.update(print), updateFrequencyMilliseconds)
    };
}

async function main() {
    const scooter = new Scooter();
    await scooter.load(false, true);
    scooter.update(true);
}

if (require.main === module) {
    db.setMongoURI(process.env.DBURI);
    db.connect();
    main();
}

module.exports = {
    Scooter: Scooter
}
