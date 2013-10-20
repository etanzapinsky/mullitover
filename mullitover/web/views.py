import json

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

def status(request, idfr):
    if request.method == 'GET':
        return get_status(request, idfr)
    elif request.method == 'POST':
        return post_status(request)
    elif request.method == 'PUT':
        return put_status(request, idfr)
    elif request.method == 'DELETE':
        return delete_status(request, idfr)
    return None


def get_status(request, idfr):
    return HttpResponse(json.dumps({"id": idfr}))

def post_status(request):
    return None

def put_status(request, idfr):
    return None

def delete_status(request, idfr):
    return None
