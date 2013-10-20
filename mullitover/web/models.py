import datetime
from django.db import models

class Status(models.Model):
    userid = models.CharField(max_length=64)
    text = models.TextField()
    createtime = models.DateTimeField(auto_now_add=True)

def unix_time(dt):
    epoch = datetime.datetime.utcfromtimestamp(0)
    delta = dt - epoch
    return delta.total_seconds()

def unix_time_millis(dt):
    return unix_time(dt) * 1000

def status_to_dict(status):
    d = {
        'id': status.pk,
        'userid': status.userid,
        'text': status.text,
        'createtime': status.createtime.isoformat(),
        'expire': (status.createtime + datetime.timedelta(days=1)).isoformat()
        }
    return d
