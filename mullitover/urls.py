from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', view='web.views.home', name='home'),
    url(r'^stream/$', view='web.views.stream', name='stream'),
    url(r'^status/(?P<idfr>\d*)$', view='web.views.status', name='status'),
    url(r'^statuses/$', view='web.views.statuses', name='statuses'),
    url(r'^fbauth/$', view='web.views.post_fbauth', name='post_fbauth'),
    url(r'^admin/', include(admin.site.urls)),
)
