from django.template import Context, loader
from datetime import datetime
from django.http import HttpResponse

def home(request):
    """ Simple Hello World View """
    t = loader.get_template('index.djhtml')
    return HttpResponse(t.render(Context()))


def stream(request):
    t = loader.get_template('stream.djhtml')
    return HttpResponse(t.render(Context()))

def status(request):
    return None
