# Scooter Simulator for SparkRentals Project
## !OPS!
***Unfortunately, the program is not ready and will not be ready for launch until December 13.***
## Content
- [About](#about)
- [Download](#download)
- [Usage](#usage)
- [Version](#version)
- [Contact](#contact)
## About
### Background
The scooter program will be the very brain of every scooter that is driven. The program will simulate several scooters with speed, gps, sessions, battery, owner, etc. When starting up the scooter, the bike will communicate with the MongoDB database to either register a new scooter or activate an existing scooter. In order for the scooter to "know" who it is, a small configuration file will be saved per scooter. If there is nothing like that saved, it is a new scooter and it will then be registered. At certain time intervals, the scooter will update the data that the scooter itself has control over. Eg position, speed and battery. At another determined interval, the scooter will retrieve information from the database to update its own status. This is so that the scooter will know if it has been rented, shut down by admin etc.

## Download
## Usage
To run this program you have to use either node or docker.
The node version:
    node scooter_hive.js: This will start a hive of scooters. Spawning new ones if defined and also starting all existing scooters on your database. It will run scooters in all cities but only spawn random ones i a city of your choosing. Defined by env variables.
    node user_simulation.js: This will start a rent simulation. It fetches all fake users from your database(defined by an autoGen property on the account). It will then attempt to rent as many scooters as possible(Some users wont rent because of lacking money or if a scooter is unavailable). The user simulation only works on one city at a time, this is defined by environment variables.

The docker version:
    jolpango/scooter-simulation:latest: The same as scooter_hive but in docker.
    jolpango/user-simulation:latest: The same as user_simulation but in docker.

Required environment variables:
    #DB CONFIG
    DBURI=YOUR_MONGO_CONNECTION_STRING
    GEOAPIFY_KEY=YOUR_GEOAPIFY_KEY

    #SCOOTER_CONFIG
    NUMBER_OF_SCOOTERS=NUMBER_OF_SCOOTERS_TO_GENERATE
    UPDATE_FREQUENCY_MILLISECONDS=1000
    BATTERY_DEPLETION_RATE=0.005
    SIMULATION_CITY=YOUR_CITY

    #--------------------- "DROP ZONE" of scooters -----------------------
    #KARLSKRONA
    SIMULATION_MAX_LAT="56.166217"
    SIMULATION_MIN_LAT="56.158594"
    SIMULATION_MAX_LON="15.593868"
    SIMULATION_MIN_LON="15.583096"

    # The higher the number, the slower the scooters move. 10 is recommended
    SIMULATION_ROUTE_PADDING=10

    #SIMULATION
    SIMULATION_EMAIL=ADMIN_EMAIL
    SIMULATION_PASSWORD=ADMIN_PASSWORD

    #-------------- REST API URLS ------------------------------
    # API_URL=http://sparkrentals.software:8393/v1
    # API_URL=http://localhost:8393/v1
    # API_URL=http://api-server:8393/v1

    # Uses same key as from the admin dashboard
    # REACT_APP_REST_API_KEY="681e9db4d1f9890557d025dcdf99c0a6"

## Version
## Contact
Have any questions?


Reach me at:


<falkendev@gmail.com>


<https://www.twitch.tv/falkendev>
## License and Tools