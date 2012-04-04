var AutocompleterAppModel = Backbone.Model.extend({});
var AutocompleterAppView = Backbone.View.extend({
	  render: function() {
		  console.log('render');

		  $("#search-input").autocomplete({
	          source: function(request, response){
	        	  now.search(request, 10, function(err, results) {
			      console.log(response);
	        		  response(results);
	        	  });
	          },
	          minLength: 1
	      });
	  },
	  initialize: function() {
		  this.render();
	  }
});
