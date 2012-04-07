function simple_escape( str ) {
    return (str+'').replace(/([\\"'\(\)])/g, "\\$1").replace(/\0/g, "\\0");
}

function get_num_name (str) {
	return str.split(/ {1}([0-9]+)$/);
}

function get_num ( str ) {
	return get_num_name (str)[1] || '';
}

function get_name ( str ) {
	return get_num_name (str)[0] || '';
}

function validate_num (n, a) {
	var i;
	if (!n) return true;
	if (!a) return false;

	for (i = 0; i < a.length; i += 1) {
		if (n >= a[i][0] && n <= a[i][1]) {
			return true;
		}
	}

	return false;
}

function validate (e) {
	var k = {id :$( '#' + e + '-id' ).prop('value'),
		 num:$( '#' + e + '-num').prop('value')};

	console.log(e, k);
	if (! (k.id && k.num) ) {
		return false
	}
	return true;
}

function xa_autoc(e) {
	var es = '#' + e;
	var t = '';
	var num;
	var a = $(es + '-input').autocomplete({
		source: function(request, response){
			$(es + '-input').autocomplete( "option", "delay", 300 );
			$(es + '-input').animate({ backgroundColor: "white" }, 500);
			if (request.term == e) return;

			now.search(request, 10,
				   function(err, results) {
					   response(results);
					   if (results.length == 0) {
						   num = undefined;
						   $( es + "-id" ).val( );
						   $( es + "-num").val( );
					   } else if (results.length == 1) {
						   num = results[0].obj.num;
						   $( es + "-id" ).val(results[0].obj.id);
					   }
				   });
		},
		focus: function( event, ui ) {
			var input = document.getElementById(e + '-input');
			var n = get_num(input.value);
			t = get_name(input.value);

			$( es + "-id" ).val( ui.item.obj.id );
			$( es + "-num").val( n );

			input.focus();
			input.value = ui.item.value + ' ' + n;

			if (ui.item.value.search(t) == 0) {
				input.setSelectionRange(t.length, ui.item.value.length + 1);
			}
			return false;
		},
		change: function( event, ui ) {
			$(es + '-input').autocomplete( "option", "delay", 0 );
			console.log('change');
			var i = $( es + "-input" );
			var v = i.prop("value");
			var k = {num:get_num(v),
				 id:$( es + "-id" ).prop("value")};

			if (v.match(/^ *$/)) {
				i.val(e);
				i.animate({ backgroundColor: 'white' });
				return false;
			}

			$( es + "-num").val(k.num);
			if (! validate (e)) {
				i.animate({ backgroundColor: 'red' });
				return false;
			}

			if (! validate_num (k.num, num)) {
				i.animate({ backgroundColor: 'orange' });
				return false;
			}

			i.animate({ backgroundColor: 'green' });
			$.getJSON(request_pos_url(k), function (o) {
				plotP(o, e);
			});
		},
		select: function( event, ui ) {
			return false;
		},
/*		search: function( event, ui ) {
			console.log(event);
			return true;
		},*/
		minLength: 3,
		delay: 0,
		autoFocus: false,
	});
	a.data( "autocomplete" )._renderItem = function( ul, item ) {
		t = $( es + "-input" ).prop("value");
		var text = "<a>" + item.obj.name + "<br>" +
			item.obj.type + " " + item.obj.num + "</a>"
		var r = new RegExp(simple_escape(t), 'i');

		text = text.replace(r, '<span id="selection">' + t + '</span>');

		return $( "<li></li>" )
			.data( "item.autocomplete", item )
			.append(text)
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
