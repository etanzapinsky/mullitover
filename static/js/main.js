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

StatusView = Backbone.View.extend({
    tagName: "div",
    className: "panel panel-default",
    events: {
        "click .save": null, // this.model.save(),
        "click .delete": null, //this.model.destroy(),
        "click .post": null, // function () {}, // placeholder
        "click .edit": null, // function () {this.template = _.template($('#editable-template').html())},
    },
    initialize: function() {
        this.template = _.template(regTemplate);
        this.listenTo(this.model, "change", this.render);
        this.render();
    },
    render: function() {
        this.$el.html(this.template(this.model.attributes));
        return this;
    }
});

$(document).ready(function() {
    $('#new-status').click(function() {
        alert("hi");
    });
});

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
            <span>8:00</span>
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
            <span>8:00</span>
            <button type="button" class="btn btn-primary post">Post</button>
          </div>
        </div>
      </div>
*/});
