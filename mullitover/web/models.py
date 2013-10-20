from django.db import models

class Status(models.Model):
    userid = models.CharField(max_length=64)
    text = models.TextField()
    createtime = models.DateTimeField(auto_now_add=True)
