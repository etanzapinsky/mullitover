import json
from datetime import datetime

from django.template import Context, loader
from django.http import HttpResponse
from django.views.decorators.http import require_http_methods
from django.core.context_processors import csrf
from django.core.exceptions import ObjectDoesNotExist

from web.models import Status
from web.models import FBAuth
from web.models import status_to_dict
from web.forms import StatusForm
from web.forms import FBAuthForm
from web.models import auth_to_dict

def home(request):
    """ Simple Hello World View """
    c = Context()
    c.update(csrf(request))
    t = loader.get_template('index.djhtml')
    return HttpResponse(t.render(c))

def stream(request):
    c = Context()
    c.update(csrf(request))
    t = loader.get_template('stream.djhtml')
    return HttpResponse(t.render(c))

@require_http_methods(['GET', 'POST', 'PUT', 'DELETE'])
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
    try:
        status = Status.objects.get(pk=idfr)
        return HttpResponse(json.dumps(status_to_dict(status)))
    except ObjectDoesNotExist:
        return None

def post_status(request):
    form = StatusForm(json.loads(request.body))
    print form.is_valid()
    if form.is_valid():
        status = Status.objects.create(userid=form.cleaned_data['userid'],
                                       text=form.cleaned_data['text'])
        return HttpResponse(json.dumps(status_to_dict(status)))
    return HttpResponse(json.dumps(False))

def put_status(request, idfr):
    try:
        status = Status.objects.get(pk=idfr)
        form = StatusForm(json.loads(request.body))
        if form.is_valid():
            status.userid = form.cleaned_data['userid']
            status.text = form.cleaned_data['text']
            status.posted = form.cleaned_data['posted']
            status.save()
            return HttpResponse(json.dumps(status_to_dict(status)))
        return None
    except ObjectDoesNotExist:
        return None

def delete_status(request, idfr):
    try:
        status = Status.objects.get(pk=idfr)
        status.delete()
        return HttpResponse(json.dumps(True))
    except ObjectDoesNotExist:
        return None
    
@require_http_methods(['GET'])
def statuses(request):
    uid = request.GET.get('userid')
    if uid is not None:
        statuses = Status.objects.filter(userid=uid, posted=False).order_by('-createtime')
        status_list = [status_to_dict(s) for s in statuses]
        return HttpResponse(json.dumps(status_list))
    return None

@require_http_methods(['POST', 'DELETE'])
def fbauth(request, idfr):
    if request.method == 'POST':
        return post_fbauth(request)
    elif request.method == 'DELETE':
        return delete_fbauth(request, idfr)
    return None

def post_fbauth(request):
    d = {'userid': request.POST.get('userid'),
         'authtoken': request.POST.get('authtoken'),
         'expiry': int(request.POST.get('expiry'))}
    form = FBAuthForm(d)
    print form.is_valid()
    if form.is_valid():
        auth, created = FBAuth.objects.get_or_create(userid=form.cleaned_data['userid'])
        auth.expiry = form.cleaned_data['expiry']
        auth.authtoken = form.cleaned_data['authtoken']
        auth.save()
        return HttpResponse(json.dumps(auth_to_dict(auth)))
    return HttpResponse(json.dumps(False))

def delete_fbauth(request, idfr):
    pass
