var AutocompleterAppModel = Backbone.Model.extend({});
var AutocompleterAppView = Backbone.View.extend({
	render: function() {
		console.log('render');

		function xa_autoc(e) {
			$('#' + e + '-input').autocomplete({
				source: function(request, response){
					now.search(request, 10,
						   function(err, results) {
							   console.log(response);
							   response(results);
						   });
				},
				focus: function( event, ui ) {
					console.log('s: ' + e + '--' + ui.item.obj.id);
					$( "#" + e + "-id" ).val( ui.item.obj.id );
					$( "#" + e + "-num").val( ui.item.num );
				},
				minLength: 1
			}).data( "autocomplete" )._renderItem =
				function( ul, item ) {
					var s = '', e = '';
					if (item.ok) {
						s = '<b>'; e = '</b>';
					}
					return $( "<li></li>" )
						.data( "item.autocomplete", item )
						.append("<a>" + s + item.obj.name + e + "<br>" +
							 item.obj.type + " " + item.obj.num + "</a>")
						.appendTo( ul );
			};
		}
		xa_autoc("from");
		xa_autoc("to");
	},
	initialize: function() {
		this.render();
	}
});
