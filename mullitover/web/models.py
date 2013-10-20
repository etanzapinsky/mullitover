import datetime
from django.db import models

class Status(models.Model):
    userid = models.CharField(max_length=64)
    text = models.TextField()
    createtime = models.DateTimeField(auto_now_add=True)
    posted = models.BooleanField(default=False)

def status_to_dict(status):
    d = {
        'id': status.pk,
        'userid': status.userid,
        'text': status.text,
        'createtime': status.createtime.isoformat(),
        'expire': (status.createtime + datetime.timedelta(days=1)).isoformat()
        }
    return d

class FBAuth(models.Model):
    userid = models.CharField(max_length=64)
    authtoken = models.CharField(max_length=255)
    expiry = models.IntegerField(default=0)

def auth_to_dict(auth):
    d = {
        'userid': auth.userid,
        'authtoken': auth.authtoken,
        'expiry': auth.expiry,
        }
    return d
