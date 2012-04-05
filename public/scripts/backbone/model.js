function validate_num (n, a) {
	var i;
	if (!n) return true;

	for (i = 0; i < a.length; i += 1) {
		if (n >= a[i][0] && n <= a[i][1]) {
			return true;
		}
	}

	return false;
}

function xa_autoc(e) {
	var a = $('#' + e + '-input').autocomplete({
		source: function(request, response){
			now.search(request, 10,
				   function(err, results) {
					   response(results);
				   });
		},
		focus: function( event, ui ) {
			return false;
		},
		change: function( event, ui ) {
			var n = $( "#" + e + "-input" ).prop("value").split(/([0-9]+)$/)[1] + '';
			$( "#" + e + "-num").val( n );
		},
		select: function( event, ui ) {
			var n = $( "#" + e + "-input" ).prop("value").split(/([0-9]+)$/)[1] + '';
			var k = {id: ui.item.obj.id, num: n};
			ui.item.value += ' ' + n;
			$( "#" + e + "-id" ).val( ui.item.obj.id );
			$( "#" + e + "-num").val( n );
			$( "#" + e + "-input" ).val( ui.item.value);

			if (! validate_num (n, ui.item.obj.num)) {
				console.log('invalid num', n, ui.item.obj.num);
				return true;
			}
			$.getJSON(request_pos_url(k), function (o) {
				plotP(o, e);
			});
		},
/*		search: function( event, ui ) {
			console.log(event);
			return true;
		},*/
		minLength: 1,
		autoFocus: true,
	});
	a.data( "autocomplete" )._renderItem = function( ul, item ) {
		var s = '', e = '';
		/*		if (item.ok) {
				s = '<b>'; e = '</b>';
				} */
		return $( "<li></li>" )
			.data( "item.autocomplete", item )
			.append("<a>" + s + item.obj.name + e + "<br>" +
				item.obj.type + " " + item.obj.num + "</a>")
			.appendTo( ul );
	};
	console.log(a, a.data("autocomplete"));
}

var AutocompleterAppModel = Backbone.Model.extend({});
var AutocompleterAppView = Backbone.View.extend({
	render: function() {
		console.log('render');

		xa_autoc("from");
		xa_autoc("to");
	},
	initialize: function() {
		this.render();
	}
});
