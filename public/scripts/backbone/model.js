var AutocompleterAppModel = Backbone.Model.extend({});
var AutocompleterAppView = Backbone.View.extend({
	render: function() {
		xa_autoc("from");
		xa_autoc("to");
	},
	initialize: function() {
		this.render();
	}
});
