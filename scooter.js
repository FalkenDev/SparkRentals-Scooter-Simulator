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
const { ObjectID } = require("mongodb");
const db = require("./modules/sparkdb");
const { GPSComponent } = require("./modules/gps");

const updateFrequencyMilliseconds = 1000;

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
    const scooter = {
        _id: new ObjectID(),
        status: "Available",
        battery: 100,
        owner: "Karlskrona",
        currentTrip: null,
        log: [],
        speed: gps.speed,
        coordinates: gps.coordinates
    };
    const result = db.pushScooter(scooter);
    if (!result) {
        console.log("Error pushing scooter to database...");
        process.exit(1);
    }
    return scooter;
}

/**
 * @param ObjectID id
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
            status: this.status,
            battery: this.battery,
            ownerID: this.ownerID,
            currentTrip: this.currentTrip,
            log: this.log,
            speed: this.gpsComponent.speed,
            coordinates: this.gpsComponent.coordinates
        };
    };
    this.load = async (id) => {
        if (id) {
            const result = await LoadScooter(id);
            this.set(result);
        } else {
            const result = await NewScooter();
            this.set(result);
        }
        console.log("Starting scooter:", this._id);
        if (!this._id) {
            console.log("Something bad happened, error with id");
            process.exit(1);
        }
        console.log("Scooter is running");
        console.log("Connected to database:", db.getMongoURI());
        console.log("Update frequency is", updateFrequencyMilliseconds, "ms");
    }
    this.update = async () => {
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
                console.log("Remote shutdown..")
                process.exit(0);
            }
        }
        db.updateScooterStates(this.coordinates, this.gpsComponent.speed, this.battery);
        setTimeout(this.update, updateFrequencyMilliseconds)
    };
}

async function main() {
    const scooter = new Scooter();
    await scooter.load();
    scooter.update();
}

if (require.main === module) {
    db.setMongoURI(process.env.DBURI);
    main();
}

module.exports = {
    Scooter: Scooter
}
