function hereDoc(f) {
  return f.toString().
      replace(/^[^\/]+\/\*!?/, '').
      replace(/\*\/[^\/]+$/, '');
}

var editableTemplate = hereDoc(function() {/*!
      <div class="panel panel-default">
        <div class="panel-body">
          <textarea class="panel-content"><%= text %></textarea>
        </div>
        <div class="panel-heading panel-bottom">
          <button type="button" class="btn btn-danger delete">Delete</button>
          <div class="done">
            <span class="timer"><%= expire %></span>
            <button type="button" class="btn btn-success save">Save</button>
          </div>
        </div>
      </div>
*/});

var regTemplate = hereDoc(function() {/*!
      <div class="panel panel-default">
        <div class="panel-body">
          <div class="panel-content"><%= text %></div>
        </div>
        <div class="panel-heading panel-bottom">
          <button type="button" class="btn btn-warning edit">Edit</button>
          <div class="done">
            <span class="timer"><%= expire %></span>
            <button type="button" class="btn btn-primary post">Post</button>
          </div>
        </div>
      </div>
*/});

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
        expire: null,
        posted: false,
    },
});

Statuses = Backbone.Collection.extend({
    model: Status,
    url: '/statuses/',
});

// newlines in html just get swallowed up, theoretically sanitize when going to html
// replacing \n with <br /> and in the opposite direction replace <br /> with \n.
StatusView = Backbone.View.extend({
    tagName: "div",
    className: "panel panel-default",
    events: {
        "click .save": function() {
            this.template = _.template(regTemplate);
            this.model.set('text', $('textarea', this.$el)[0].value);
            this.model.set('userid', userID);
            this.model.save();
            this.render();
        },
        "click .delete": function () {
            this.model.destroy();
            this.$el.remove();
        }, 
        "click .post": function () {
            // closure crap to have access to "this" inside the FB response
            var f = function (that) {
                FB.api('/me/feed', 'post', {message: that.model.get('text')}, function(response) {
                    if (!response || response.error) {
                        alert('Error occured');
                    } else {
                        that.model.set('posted', true);
                        that.model.save();
                        that.$el.remove();
                    }
                });
            };
            f(this);
        },
        "click .edit": function() {
            this.template = _.template(editableTemplate);
            this.render();
        },
    },
    initialize: function() {
        this.template = _.template(regTemplate);
        this.listenTo(this.model, "change", this.render);
        this.render();
    },
    render: function() {
        this.$el.html(this.template(this.model.attributes));
        // -9 is a massive hack, not in the mood to deal with timezones
        $('.timer').countdown({until: $.countdown.UTCDate(-9, new Date(this.model.get('expire'))), compact: true, format: 'HMS'});
        return this;
    }
});

$(document).ready(function() {
    $('#new-status').click(function() {
        var el = $('<div />');
        $('#statuses').prepend(el);
        var v = new StatusView({model: new Status(), el: el});
        v.template = _.template(editableTemplate);
        v.render();
    });

    $('#logout').click(function() {
        FB.logout(function(response) {
            // user is now logged out
            window.location.pathname = '/';
        });
    });
});

var userID;
var statuses = new Statuses();
var channelPath = '//' + window.location.host + '/static/channel.html';
window.fbAsyncInit = function() {
    FB.init({
        appId      : '452485954871398', // App ID
        channelUrl : channelPath, // Channel File
        status     : true, // check login status
        cookie     : true, // enable cookies to allow the server to access the session
        xfbml      : true  // parse XFBML
    });

    // Here we subscribe to the auth.authResponseChange JavaScript event. This event is fired
    // for any authentication related change, such as login, logout or session refresh. This means that
    // whenever someone who was previously logged out tries to log in again, the correct case below 
    // will be handled. 
    FB.Event.subscribe('auth.authResponseChange', function(response) {
        // Here we specify what we do with the response anytime this event occurs. 
        if (response.status === 'connected') {
            // The response object is returned with a status field that lets the app know the current
            // login status of the person. In this case, we're handling the situation where they 
            // have logged in to the app.
            userID = response.authResponse.userID;
            console.log(userID);

            statuses.fetch({
                data: {userid: userID},
                success: function(collection, response, options) {
                    for (var i = 0; i < collection.models.length; i++) {
                        var el = $('<div/>');
                        $('#statuses').append(el);
                        var v = new StatusView({model: collection.models[i], el: el});
                    }
                },
            });

        } else if (response.status === 'not_authorized') {
            // In this case, the person is logged into Facebook, but not into the app, so we call
            // FB.login() to prompt them to do so. 
            // In real-life usage, you wouldn't want to immediately prompt someone to login 
            // like this, for two reasons:
            // (1) JavaScript created popup windows are blocked by most browsers unless they 
            // result from direct interaction from people using the app (such as a mouse click)
            // (2) it is a bad experience to be continually prompted to login upon page load.
            window.location.pathname = '/';
        } else {
            // In this case, the person is not logged into Facebook, so we call the login() 
            // function to prompt them to do so. Note that at this stage there is no indication
            // of whether they are logged into the app. If they aren't then they'll see the Login
            // dialog right after they log in to Facebook. 
            // The same caveats as above apply to the FB.login() call here.
            window.location.pathname = '/';
        }
    });


};
// Load the SDK asynchronously
(function(d){
    var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement('script'); js.id = id; js.async = true;
    js.src = "//connect.facebook.net/en_US/all.js";
    ref.parentNode.insertBefore(js, ref);
}(document));

