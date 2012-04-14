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

	console.log('validate_num', n, a);
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

	console.log('validate', e, k);
	if (! (k.id && k.num) ) {
		return false
	}
	return true;
}

function get_style (e, p) {
	return document.defaultView.getComputedStyle(document.getElementById(e), null).getPropertyValue(p);
}

function xa_autoc(e) {
	var es = '#' + e;
	var t = '';
	var num;
	var input = $(es + '-input');
	input.autocomplete({
		source: function(request, response){
			$(es + '-input').autocomplete( "option", "delay", 300 );
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
			console.log('focus');
			var input = document.getElementById(e + '-input');
			var n = get_num(input.value);
			t = get_name(input.value);

			$( es + "-id" ).val( ui.item.obj.id );
			$( es + "-num").val( n );
			num = ui.item.obj.num;

			input.focus();
			input.value = ui.item.value + ' ' + n;

			return false;
		},
		change: function( event, ui ) {
			$(es + '-input').autocomplete( "option", "delay", 0 );

			if ($(es + '-input').prop("auto-loc") == true) {
				i.addClass('green');
				$.getJSON(request_pos_url(k), function (o) {
					plotP(o, e);
				});

			}

			console.log('change');
			var i = $( es + "-input" );
			var v = i.prop("value");
			var k = {num:get_num(v),
				 id:$( es + "-id" ).prop("value")};


			if (v.match(/^ *$/)) {
				i.val(e);
				i.addClass('sel-ok', 1000);
				return false;
			}

			$( es + "-num").val(k.num);
			if (! validate (e)) {
				i.addClass('sel-nok', 1000);
				return false;
			}

			if (! validate_num (k.num, num)) {
				i.addClass('sel-warn', 1000);
				return false;
			}

			i.addClass('sel-ok', 1000);
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

	input.data( "autocomplete" )._renderItem = function( ul, item ) {
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
}
