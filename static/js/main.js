Post = Backbone.Model.extend({
    urlRoot: '/status/',
    defaults: {
        text: '',
        userid: 0,
    },
});
