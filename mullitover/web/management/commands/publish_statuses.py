from django.core.management.base import BaseCommand, CommandError

from web.models import Status

class Command(BaseCommand):
    args = ''
    help = 'Checks if any posts are due to be posted and if so posts them'

    def handle(self, *args, **kwargs):
        pass
