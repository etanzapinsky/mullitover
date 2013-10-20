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
          <button type="button" class="btn btn-info history">Revision History</button>
          <div class="done">
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

var revTemplate = hereDoc(function() {/*!
      <div class="panel panel-default">
        <div class="panel-body">
          <div class="panel-content"><%= text %></div>
        </div>
        <div class="panel-heading panel-bottom">
          <div class="done">
            <button type="button" class="btn btn-success revert">Revert</button>
          </div>
          <p class="clear"></p>
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
        bundle: null,
    },
});

function addHours(date, hours) {
    return new Date((new Date).getTime() + (hours * 3600000));
}

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
            if (this.model.get('text') !== $('textarea', this.$el)[0].value) {
                this.model.set('text', $('textarea', this.$el)[0].value);
                this.model.set('userid', userID);
                this.model.save();
            }
            this.render();
        },
        "click .revert": function() {
            var parent = this.model.get('parent');
            parent.model.set('text', this.model.get('text'));
            parent.template = _.template(regTemplate);
            parent.model.save();
            parent.render();
        },
        "click .delete": function () {
            this.model.destroy();
            this.$el.remove();
        }, 
        "click .post": function () {
            // subtracting 8 hours to see if we are allowed to post
            var eightHourPrior = addHours(new Date(), -8)
            if (new Date(this.model.get('createtime')).getTime() > eightHourPrior.getTime()) {
                alert("You can't post just yet. You have to wait at least 8 hours since you first drafted the status.");
                return;
            }
            // closure crap to have access to "this" inside the FB response
            var f = function (that) {
                FB.api('/me/feed', 'post', {message: that.model.get('text')}, function(response) {
                    if (!response || response.error) {
                        console.log(response);
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
        "click .history": function() {
            function f(that) {
                var stats = new Statuses();
                statuses.fetch({
                    data: {bundle: that.model.get('bundle')},
                    success: function(collection, response, options) {
                        var revContainer = $('<div class="revision-history" />');
                        var connector = $('<span class="glyphicon glyphicon-chevron-down"></span>');
                        // 20 em is hack again
                        connector.css('margin-left', '20em');
                        that.$el.append(connector);
                        that.$el.append(revContainer);
                        for (var i = 0; i < collection.models.length; i++) {
                            var el = $('<div />');
                            revContainer.append(el);

                            if (i !== collection.models.length - 1) {
                                var connector = $('<span class="glyphicon glyphicon-chevron-down"></span>');
                                // 20 em is hack again
                                connector.css('margin-left', '20em');
                                revContainer.append(connector);
                            }

                            var m = collection.models[i];
                            m.set('parent', that);
                            var v = new StatusView({model: m, el: el});
                            v.template = _.template(revTemplate);
                            v.render();
                            $('.panel-bottom', v.$el).css('border-color', '#39b3d7');
                        }
                    },
                });
            };
            f(this);
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
        // subtracting 8 hours to see if we are allowed to post
        var eightHourPrior = addHours(new Date(), -8)
        if (new Date(this.model.get('createtime')).getTime() > eightHourPrior.getTime()) {
            $('.post', this.$el).attr('disabled', 'disabled');
        }
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
            $('.not-logged-in').show();
            $('.logged-in').hide();
            $('#statuses').empty();
        });
    });
});
