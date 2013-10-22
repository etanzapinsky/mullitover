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
        # two hits to the DB in some cases, but I'm lazy now
        status = Status.objects.create(userid=form.cleaned_data['userid'],
                                       text=form.cleaned_data['text'])
        status.bundle = status.pk
        status.createtime = status.initialcreate
        status.save()
        return HttpResponse(json.dumps(status_to_dict(status)))
    return HttpResponse(json.dumps(False))

def put_status(request, idfr):
    # data = json.loads(request.body)
    # be careful of keyerrors
    form = StatusForm(json.loads(request.body))
    if form.is_valid():
        # can be sure of at least one bundle
        bundles = Status.objects.filter(bundle=form.cleaned_data['bundle'])
        bundle_leader = bundles[0]
        status = Status.objects.create(userid=form.cleaned_data['userid'],
                                       text=form.cleaned_data['text'],
                                       posted=form.cleaned_data['posted'],
                                       bundle=form.cleaned_data['bundle'],
                                       createtime=bundle_leader.createtime)
        bundles.update(posted=form.cleaned_data['posted'])
        status.save()
        return HttpResponse(json.dumps(status_to_dict(status)))
    return HttpResponse(json.dumps(False))

def delete_status(request, idfr):
    try:
        status = Status.objects.get(pk=idfr)
        Status.objects.filter(bundle=status.bundle).delete();
        return HttpResponse(json.dumps(True))
    except ObjectDoesNotExist:
        return None
    
@require_http_methods(['GET'])
def statuses(request):
    uid = request.GET.get('userid')
    bundle = request.GET.get('bundle')
    
    if uid is not None:
        statuses = Status.objects.filter(userid=uid, posted=False).order_by('-initialcreate')
        bundles_seen = set()
        status_list = list()
        for s in statuses:
            if s.bundle not in bundles_seen:
                status_list.append(status_to_dict(s))
                bundles_seen.add(s.bundle)
        return HttpResponse(json.dumps(status_list))
    elif bundle is not None:
        if bundle == '':
            return HttpResponse(json.dumps([]))
        statuses = Status.objects.filter(bundle=bundle, posted=False).order_by('-initialcreate')
        status_list = [status_to_dict(s) for s in statuses]
        return HttpResponse(json.dumps(status_list[1:]))

    return None

@require_http_methods(['POST'])
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
        return HttpResponse(json.dumps(True))
    return HttpResponse(json.dumps(False))
