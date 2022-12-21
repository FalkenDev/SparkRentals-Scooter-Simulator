/**
 * A node application to start a X amount of scooters.
 * Used to simulate a system of X scooters.
 * scooter.js will load .env file
 * This will later be removed, since docker will handle loading environment variables
 * Environment variables:
 * DBURI
 * NUMBER_OF_SCOOTERS
 */

const { Scooter } = require("./scooter");
const db = require("./modules/sparkdb");

const numberOfScooters = process.env.NUMBER_OF_SCOOTERS;
let scooters = [];

/**
  * Loads x number of scooters and returns them
  * @return list of scooter
  */
async function loadNewScooters() {
    const scooterArray = [];
    for (let i = 0; i < numberOfScooters; i++) {
        const scooter = new Scooter();
        await scooter.load(); // Load up new scooter, can pass id if custom generation is wanted
        scooterArray.push(scooter);
    }
    return scooterArray;
}

/**
  * Starts update function on scooter
  * @param mixed scooter
  * 
  * @return void
  */
async function startUpdate(scooter) {
    scooter.update();
}

/**
  * @param mixed scooterArray
  * 
  * @return [type]
  */
async function startUpdateScooters() {
    scooters.forEach(scooter => {
        startUpdate(scooter);
    });
}

/**
 * Prints useful information about the current state of the scooters
  * @param mixed scooters
  * @param bool repeat
  * 
  * @return [type]
  */
async function printScooters(repeat) {
    const totalScooters = scooters.length;
    const scootersStateCount = {};
    for (let i = 0; i < totalScooters; i++) {
        const scooter = scooters[i];
        // console.log(scooter);
        scootersStateCount[scooter.status] = scootersStateCount[scooter.status] ? scootersStateCount[scooter.status] + 1 : 1;
    }
    for (const state in scootersStateCount) {
        console.log(state, scootersStateCount[state]);
    }
    console.log("============================");
    if (repeat) {
        setTimeout(() => printScooters(repeat), 5000);
    }
}

/**
  * @return [type]
  */
async function dropCallback() {
    console.log("Loading up new scooters:", numberOfScooters);
    const existingScooters = await db.getAllScooters();
    const oldScooters = [];
    for (let i = 0; i < existingScooters.length; i++) {
        const scooter = new Scooter();
        await scooter.load(existingScooters[i]._id.toString());
        oldScooters.push(scooter);
    }
    scooters = await loadNewScooters();
    scooters = scooters.concat(oldScooters);
    console.log("Starting scooters")
    startUpdateScooters(scooters);
    printScooters(true);
    //TODO: Add watch on mongoDB database
    //IF NEW SCOOTER, ADD IT
    //IF SCOOTER IS REMOVED, REMOVES IT FROM ARRAY
}

async function main() {
    db.setMongoURI(process.env.DBURI);
    db.connect();
    // console.log("Dropping scooter collection...");
    // db.dropScooters(dropCallback);
    dropCallback();
}

if (require.main === module) {
    main();
}
