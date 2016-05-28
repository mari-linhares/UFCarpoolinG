from core.notifications import Notification

class RideFound(Notification):

    def __init__(self, ride):
        Notification.__init__(self)

        self._ride = ride

    def get_type(self):
        return 'RIDE_FOUND'

    def get_data(self):
        return {
            'ride': self._ride.get_view()
        }