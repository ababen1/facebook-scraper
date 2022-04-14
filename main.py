import pywhatkit
import datetime
import sys
hours = datetime.datetime.now().hour
minutes = datetime.datetime.now().minute + 1
with open('message.txt') as f:
    message = f.readlines()
pywhatkit.sendwhatmsg_to_group("HOYGYfwPu15H9ElvMqXUSJ", message, hours, minutes)
