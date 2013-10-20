(function() {
    var _sync = Backbone.sync;
    Backbone.sync = function(method, model, options){
        options.beforeSend = function(xhr){
            var token = $('meta[name="csrf-token"]').attr('content');
            xhr.setRequestHeader('X-CSRFToken', token);
        };
        return _sync(method, model, options);
    };
})();

Status = Backbone.Model.extend({
    urlRoot: '/status/',
    defaults: {
        text: '',
        userid: '',
    },
});

Statuses = Backbone.Collection.extend({
    model: Status,
    url: '/statuses/',
});
