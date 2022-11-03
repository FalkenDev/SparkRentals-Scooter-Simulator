""" Module for class Bike
"""

from datetime import datetime


STATUS_AVAILABLE = 1
STATUS_IN_USE = 2
STATUS_CHARGING = 3
STATUS_MAINTENANCE = 4
STATUS_DEACTIVATED = 5

class Bike:
    """Bike object
    """
    def __init__(self, bike_id, bike_owner) -> None:
        """_summary_
        """
        self._bike_id = bike_id
        self._bike_owner = bike_owner
        self._status = STATUS_AVAILABLE
        self._speed = 0
        self._user = ""
        self._session_start = 0
        self._session_time = 0

        self._position_long = "56.181810"
        self._position_lat = "15.592350"
        self._start_position_long = ""
        self._start_position_lat = ""

        self._battery = 100
        self._trip_user_id = ""

    def start_trip(self):
        """Starts a new trip
        """
        # Check status
        # Set new status if correct
        # Set start time
        # Reset current time
        if self._status == STATUS_AVAILABLE:
            self._session_start = datetime.now()
            self._session_time = 0
            self._start_position_lat = self._position_lat
            self._start_position_lat = self._position_long
            self._status = STATUS_IN_USE

    def end_trip(self):
        """Ends the current trip
        """
        # Log the trip to db
        # Change status
        # Reset trip

    def update(self, db_connection):
        """_summary_
        """
        # Use db connection to update with my variables
        # The data that is recieved will be used to update my status

    def get_bike_id(self):
        """Returns bike id
        """
        return self._bike_id

    def get_bike_owner(self):
        """Returns bike owner
        """
        return self._bike_owner

    def set_bike_owner(self, new_owner):
        """sets bike owner
        """
        self._bike_owner = new_owner

    def get_status(self):
        """_summary_
        """
        return self._status

    def as_dictionary(self):
        """_summary_
        """
        return {
            "owner": self._bike_owner,
            "position": { "longitude": self._position_long, "latitude": self._position_lat },
            "trip": {
                "start_position": {
                    "longitude": self._start_position_long,
                    "latitude": self._start_position_lat
                    },
                "session_start": self._session_start,
                "session_time": self._session_time
                },
            "battery": self._battery,
            "status": self._status
            }
