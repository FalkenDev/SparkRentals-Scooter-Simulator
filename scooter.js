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

const updateFrequencyMilliseconds = 1000;
const batteryDepletionRate = .05;
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
async function NewScooter() {
    const gps = new GPSComponent();
    const id = new ObjectId();
    const scooter = {
        _id: id,
        status: "Available",
        name: namingPrefix + id.toString().slice(id.toString().length - 4, id.toString().length),
        battery: Math.max(20, Math.random() * 100),
        owner: "Karlskrona",
        currentTrip: null,
        log: [],
        speed: gps.speed,
        coordinates: gps.coordinates
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
 * 
 * functions:
 * load()
 * update()
 * set()
 * dbData()
 * 
 * @return void
 */
function Scooter() 
{
    this.status = "Off";
    this.ownerID = null;
    this.gpsComponent = null;
    this.currentTrip = {};
    this.log = [];
    this._id = null;
    this.set = data => {
        this._id = data._id;
        this.name = data.name;
        this.status = data.status;
        this.ownerID = data.ownerID;
        this.battery = data.battery;
        this.gpsComponent = new GPSComponent(data.coordinates);
        this.currentTrip = data.currentTrip;
        this.log = data.log;
    };
    this.dbData = () => {
        return {
            _id: this._id,
            name: this.name,
            status: this.status,
            battery: this.battery,
            ownerID: this.ownerID,
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
            const result = await NewScooter();
            this.set(result);
        }
        if (print) {
            console.log("Starting scooter:", this.name);
        }
        if (!this._id) {
            console.log("Something bad happened, error with id");
            process.exit(1);
        }
        await this.gpsComponent.loadRoute();
        if (print) {
            console.log("Scooter is running");
            printScooter(this);
        }
    };
    this.update = async (print) => {
        this.battery -= batteryDepletionRate;
        const result = await LoadScooter(this._id);
        if (result.status !== this.status) {
            if (result.status === "In use") {
                // Start the new trip
                // Rest api have created initialized trip, sync state only
                console.log("New trip started");
                this.currentTrip = result.currentTrip;
                this.status = result.status;
            } else if (result.status === "Available" && this.status === "In use") {
                // Stop the current trip
                console.log("Current trip has ended")
                const newLogEntry = {
                    ...this.currentTrip,
                    endPosition: { ...this.gpsComponent.coordinates }
                };
                db.pushLog(this._id, newLogEntry);
                this.currentTrip = null;
                this.status = result.status;
            } else if (result.status === "Off") {
                // Log?
                // Remote shutdown, causes early return
                this.status === result.status;
                console.log("Remote shutdown..");
                return 0;
            }
        }
        if (this.battery < lowBatteryWarning) {
            this.status = "Low battery";
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
    await scooter.load(true);
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
