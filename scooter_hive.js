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
        const scooter = new Scooter(removeScooter);
        await scooter.load(); // Load up new scooter, can pass id if custom generation is wanted
        scooterArray.push(scooter);
    }
    return scooterArray;
}


/**
  * @param mixed scooterArray
  * 
  * @return [type]
  */
async function startUpdateScooters() {
    scooters.forEach(scooter => {
        scooter.update();
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
 * @param string id
 * 
 * @return void
 */
function removeScooter(id) {
    let index = -1;
    for (let i = 0; i < scooters.length; i++) {
        if (id === scooters[i]._id.toString()) {
            index = i;
            break;
        }
    }
    if (index !== -1) {
        console.log(`${scooters[index].name}: removed from database`);
        scooters.splice(index, 1);
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
        const scooter = new Scooter(removeScooter);
        await scooter.load(existingScooters[i]._id.toString());
        oldScooters.push(scooter);
    }
    scooters = await loadNewScooters();
    scooters = scooters.concat(oldScooters);
    console.log("Starting scooters")
    startUpdateScooters();
    printScooters(true);
}

async function main() {
    db.setMongoURI(process.env.DBURI);
    db.connect();
    dropCallback();
}

if (require.main === module) {
    main();
}
