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

async function main() {
    db.setMongoURI(process.env.DBURI);
    db.connect();
    console.log("Loading up scooters", numberOfScooters);
    const scooters = await loadNewScooters();
    console.log("Starting scooters")
    startUpdateScooters(scooters);
    //TODO: Add watch on mongoDB database
    //IF NEW SCOOTER, ADD IT
    //IF SCOOTER IS REMOVED, REMOVES IT FROM ARRAY
}

if (require.main === module) {
    main();
}
