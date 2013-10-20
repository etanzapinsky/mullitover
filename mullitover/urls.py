from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', view='web.views.home', name='home'),
    url(r'^stream/$', view='web.views.stream', name='stream'),
    url(r'^status/(?P<idfr>\d*)$', view='web.views.status', name='status'),
    url(r'^admin/', include(admin.site.urls)),
)
