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
const scooter = require("./scooter");

const numberOfScooters = process.env.NUMBER_OF_SCOOTERS;

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
async function startUpdateScooters(scooterArray) {
    scooterArray.forEach(scooter => {
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
async function printScooters(scooters, repeat) {
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
    console.log("============================")
    if (repeat) {
        setTimeout(() => printScooters(scooters, repeat), 5000);
    }
}

async function main() {
    db.setMongoURI(process.env.DBURI);
    db.connect();
    console.log("Loading up scooters", numberOfScooters);
    const scooters = await loadNewScooters();
    console.log("Starting scooters")
    startUpdateScooters(scooters);
    printScooters(scooters, true);
    //TODO: Add watch on mongoDB database
    //IF NEW SCOOTER, ADD IT
    //IF SCOOTER IS REMOVED, REMOVES IT FROM ARRAY
}

if (require.main === module) {
    main();
}
