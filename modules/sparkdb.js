/**
 * Module for connecting to spark database, a mongo database
 * 
 */

const { MongoClient, ObjectId } = require("mongodb");

let mongoURI = "mongodb://localhost:27017"; // Default setting
const databaseName = "spark-rentals";
const collectionName = "scooters";

/**
 * Sets the connection string for the database connection
 * returns true if success and false if fail
 * @param string connectionString
 * 
 * @return bool
 */
function setMongoURI (connectionString) {
    try {
        mongoURI = connectionString;
    } catch (e) {
        console.log(e);
        return false;
    }
    return true;
}

/**
 * Returns the current connection string
 * @return string
 */
function getMongoURI () {
    return mongoURI;
}

/**
 * Attempts to find scooter based on id string.
 * Returns null if not found
 * @param string id
 * 
 * @return null | scooter object
 */
async function findScooter(id) {
    const client = new MongoClient(mongoURI);
    let scooter = null;
    try {
        const database = client.db(databaseName);
        const collection = database.collection(collectionName);
        scooter = await collection.findOne({
            "_id": new ObjectId(id)
        });
    } catch (e) {
        console.log(e);
    } finally {
        await client.close();
    }
    return scooter;
}

/**
 * Attempts to add a scooter to the database. You can include _id, if not it will create one for you
 * Returns true or false if success or fail
 * @param mixed scooter
 * 
 * @return bool | scooter
 */
async function pushScooter(scooter) {
    const client = new MongoClient(mongoURI);
    try {
        const database = client.db(databaseName);
        const collection = database.collection(collectionName);
        scooter = await collection.insertOne(scooter); // Will add _id to it if not exists
    } catch (e) {
        console.log(e);
    } finally {
        await client.close();
    }
    return scooter;
}

/**
  * @param ObjectID scooterID
  * @param TripObject logEntry
  * 
  * @return bool
  */
async function pushLog(scooterID, logEntry) {
    const client = new MongoClient(mongoURI);
    try {
        const database = client.db(databaseName);
        const collection = database.collection(collectionName);
        const result = await collection.updateOne({ _id: scooterID }, {
            $push: { log: logEntry }
        });
        if (result.matchedCount !== 1) {
            throw "Error updating scooter in database.";
        }
        return true;
    } catch (e) {
        console.log(e);
        return false;
    } finally {
        await client.close();
    }
}

/**
  * @param mixed coordinates
  * @param number speed
  * @param number battery
  * 
  * @return bool
  */
async function updateScooterStates(scooterID, coordinates, speed, battery) {
    const client = new MongoClient(mongoURI);
    try {
        const database = client.db(databaseName);
        const collection = database.collection(collectionName);
        const result = await collection.updateOne({ _id: scooterID }, {
            $set: {
                coordinates: coordinates,
                speed: speed,
                battery: battery
            }
        });
        if (result.matchedCount !== 1) {
            throw "Error updating scooter in database.";
        }
        return true;
    } catch (e) {
        console.log(e);
        return false;
    } finally {
        await client.close();
    }
}

/**
  * @param mixed coordinates
  * @param number speed
  * @param number battery
  * 
  * @return bool
  */
async function updateStatus(scooterID, status) {
    const client = new MongoClient(mongoURI);
    try {
        const database = client.db(databaseName);
        const collection = database.collection(collectionName);
        const result = await collection.updateOne({ _id: scooterID }, {
            $set: {
                status: status
            }
        });
        if (result.matchedCount !== 1) {
            throw "Error updating scooter in database.";
        }
        return true;
    } catch (e) {
        console.log(e);
        return false;
    } finally {
        await client.close();
    }
}

module.exports = {
    setMongoURI: setMongoURI,
    getMongoURI: getMongoURI,
    findScooter: findScooter,
    pushScooter: pushScooter,
    pushLog: pushLog,
    updateScooterStates: updateScooterStates,
    updateStatus: updateStatus
}
