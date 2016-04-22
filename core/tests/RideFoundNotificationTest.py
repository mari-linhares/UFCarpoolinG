import unittest, sys

sys.path.append('../../')
sys.path.append('../')

from core.src.RideFoundNotification import RideFoundNotification
from core.src.User import User
from core.src.Ride import Ride

import datetime

class RideFoundNotificationTest(unittest.TestCase):

    def setUp(self):
        self.user1 = User('User1', 'user1@gmail.com', '(83)91234-56789', '114110478', '123456789')
        self.ride1 = Ride(self.user1, 3, [])

    def test_basic(self):
        notification = RideFoundNotification(self.ride1)
        self.assertEqual(notification.getRide(), self.ride1)
        self.assertEqual(notification.getMessage(), 'Uma carona na data %s surgiu.' % datetime.datetime.now().strftime('%d-%m-%Y'))

if __name__ == '__main__':
    unittest.main()
