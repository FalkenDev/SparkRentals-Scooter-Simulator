const axios = require("axios");
const db = require("./modules/sparkdb");
require("dotenv").config();

const api = process.env.API_URL;
const adminLoginEndpoint = "/auth/login/server/admin";
const rentEndpoint = "/scooters/rent";
const stopEndpoint = "/scooters/stop";
const apiKey = process.env.REACT_APP_REST_API_KEY;
const rentWatchPollRate = 5000;
const minBalance = 50;
let token = null;

const admin = {
    email: process.env.SIMULATION_EMAIL,
    password: process.env.SIMULATION_PASSWORD
};

async function adminLogin(email, password) {
    const response = await axios.post(`${api}${adminLoginEndpoint}`, {
        email: email,
        password: password,
        api_key: apiKey
    });
    return response.data.data.token;
}

async function rentScooter(scooter_id, user_id, token) {
    const response = await axios.post(`${api}${rentEndpoint}`, {
        scooter_id: scooter_id,
        user_id: user_id,
        api_key: apiKey
    }, {
        headers: {
            "content-type": "application/json",
            "x-access-token": token
        }
    });
    return response;
}

async function stopTrip(scooter_id, user_id, token) {
    const response = await axios.post(`${api}${stopEndpoint}`, {
        scooter_id: scooter_id,
        user_id: user_id,
        api_key: apiKey
    }, {
        headers: {
            "content-type": "application/json",
            "x-access-token": token
        }
    });
    return response;
}

async function rentWatch() {
    const scooters = await db.getScootersInUse(process.env.SIMULATION_CITY);
    console.log("scooters in use:", scooters.length);
    scooters.forEach(scooter => {
        //Stop the trip if speed is 0 or if battery is entering the danger zone
        if (scooter.trip && scooter.trip.userId && (scooter.speed === 0 || scooter.battery <= 10)) {
            // Scooter has reached destination probably
            console.log("Stopping trip for scooter:", scooter.name);
            stopTrip(scooter._id.toString(), scooter.trip.userId, token);
        }
    });
    if (scooters.length > 0) {
        setTimeout(rentWatch, rentWatchPollRate);
    } else {
        console.log("Simulation complete, shutting down");
        process.exit(0);
    }
}

/** Function for stopping all scooters
  * @return void
  */
async function stopAllTrips() {
    const scooters = await db.getScootersInUse(process.env.SIMULATION_CITY);
    console.log("scooters in use:", scooters.length);
    scooters.forEach(async scooter => {
        if (scooter.trip && scooter.trip.userId) {
            console.log("Stopping trip for scooter:", scooter.name);
            stopTrip(scooter._id.toString(), scooter.trip.userId, token);
        }
    });
}

function exitHandler(options, exitCode) {
    if (options.cleanup) {
        console.log('clean');
    }
    if (exitCode || exitCode === 0) {
        console.log(exitCode);
    }
    if (options.exit) {
        process.exit();
    }
}

async function main() {
    process.stdin.resume();//so the program will not close instantly


    //do something when app is closing
    process.on('exit', exitHandler.bind(null,{cleanup:true}));

    //catches ctrl+c event
    process.on('SIGINT', exitHandler.bind(null, {exit:true}));

    // catches "kill pid" (for example: nodemon restart)
    process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
    process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));

    //catches uncaught exceptions
    db.setMongoURI(process.env.DBURI);
    db.connect();
    const users = await db.getAllUsers();
    const scooters = await db.getAllScooters();
    console.log("Logging in as admin...");
    token = await adminLogin(admin.email, admin.password);
    console.log("Login successful");
    // Rent as many scooters as possible
    for (let i = 0; i < users.length && i < scooters.length; i++) {
        const user = users[i];
        const scooter = scooters[i];
        if (scooter.status === "Available" && user.balance > minBalance && scooter.owner === process.env.SIMULATION_CITY) {
            console.log(process.env.SIMULATION_CITY);
            const response = await rentScooter(scooter._id.toString(), user._id.toString(), token);
        }
    }
    setTimeout(rentWatch, rentWatchPollRate)
}

main();
