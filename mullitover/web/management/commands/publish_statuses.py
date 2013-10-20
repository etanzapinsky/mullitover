import datetime
import requests

from django.core.management.base import BaseCommand, CommandError

from web.models import Status
from web.models import FBAuth

class Command(BaseCommand):
    args = ''
    help = 'Checks if any posts are due to be posted and if so posts them'

    def handle(self, *args, **kwargs):
        should_post = datetime.datetime.now() - datetime.timedelta(days=1)
        for status in Status.objects.filter(createtime__lte=should_post):
            if not status.posted:
                payload = {
                    'access_token': FBAuth.objects.get(userid=status.userid).authtoken,
                    'method': 'post',
                    'message': status.text,
                    }
                req = requests.get('https://graph.facebook.com/me/feed',
                                   params=payload)
                if req.status_code == 200:
                    status.posted = True
                    status.save()
