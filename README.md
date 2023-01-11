# Scooter Simulator for SparkRentals Project
## Content
- [About](#about)
- [Download](#download)
- [Download and Usage](#download-and-usage)
- [License and Tools](#license-and-tools)
## About
This project is created by 4 students who attend Blekinge Institute of Technology in web programming. We were given the task of creating a system for a scooter company where we would, among other things, create a mobile-adapted web app for the customer, administrative web interface, a simulation program for the electric scooters, an intelligence program in the bicycle and a Rest API that distributes and retrieves information from the entire system and stores the information on a database.

The entire project is available at: https://github.com/FalkenDev/V-Team-SparkRentals
### Background
The scooter program will be the very brain of every scooter that is driven. The program will simulate several scooters with speed, gps, sessions, battery, owner, etc. When starting up the scooter, the bike will communicate with the MongoDB database to either register a new scooter or activate an existing scooter. In order for the scooter to "know" who it is, a small configuration file will be saved per scooter. If there is nothing like that saved, it is a new scooter and it will then be registered. At certain time intervals, the scooter will update the data that the scooter itself has control over. Eg position, speed and battery. At another determined interval, the scooter will retrieve information from the database to update its own status. This is so that the scooter will know if it has been rented, shut down by admin etc.

## Download and Usage
To run this program you have to use either node or docker.
The node version:
    node scooter_hive.js: This will start a hive of scooters. Spawning new ones if defined and also starting all existing scooters on your database. It will run scooters in all cities but only spawn random ones i a city of your choosing. Defined by env variables.
    node user_simulation.js: This will start a rent simulation. It fetches all fake users from your database(defined by an autoGen property on the account). It will then attempt to rent as many scooters as possible(Some users wont rent because of lacking money or if a scooter is unavailable). The user simulation only works on one city at a time, this is defined by environment variables.

The docker version:
    jolpango/scooter-simulation:latest: The same as scooter_hive but in docker.
    jolpango/user-simulation:latest: The same as user_simulation but in docker.

Required environment variables:

    #--------------------- General -----------------------
    DBURI=YOUR_MONGO_CONNECTION_STRING
    GEOAPIFY_KEY=YOUR_GEOAPIFY_KEY
    API_URL=URL_YO_YOUR_API
    REACT_APP_REST_API_KEY=YOUR_API_KEY

    #--------------------- Simulation config -----------------------

    #SCOOTER_CONFIG
    NUMBER_OF_SCOOTERS=NUMBER_OF_SCOOTERS_TO_GENERATE
    UPDATE_FREQUENCY_MILLISECONDS=1000
    BATTERY_DEPLETION_RATE=0.005
    SIMULATION_CITY=YOUR_CITY

    #KARLSKRONA DROPZONE EXAMPLE
    SIMULATION_MAX_LAT="56.166217"
    SIMULATION_MIN_LAT="56.158594"
    SIMULATION_MAX_LON="15.593868"
    SIMULATION_MIN_LON="15.583096"

    # The higher the number, the slower the scooters move. 10 is recommended
    SIMULATION_ROUTE_PADDING=10

    SIMULATION_EMAIL=ADMIN_EMAIL
    SIMULATION_PASSWORD=ADMIN_PASSWORD

## License and Tools
![NPM](https://img.shields.io/badge/NPM-%23000000.svg?style=for-the-badge&logo=npm&logoColor=white) ![ESLint](https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white) ![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white) ![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)

[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/FalkenDev/SparkRentals-Scooter-Simulator/badges/quality-score.png?b=dev)](https://scrutinizer-ci.com/g/FalkenDev/SparkRentals-Scooter-Simulator/?branch=dev) [![Build Status](https://scrutinizer-ci.com/g/FalkenDev/SparkRentals-Scooter-Simulator/badges/build.png?b=dev)](https://scrutinizer-ci.com/g/FalkenDev/SparkRentals-Scooter-Simulator/build-status/dev)
