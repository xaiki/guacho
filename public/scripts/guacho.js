/**
 * based on code from Dominic Böttger
 * This file is part of guacho
 *
 *  This program is free software: you can redistribute it and/or
 *  modify it under the terms of the GNU Affero General Public License
 *  as published by the Free Software Foundation, either version 3 of
 *  the License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 *  Affero General Public License for more details.

 *  You should have received a copy of the GNU Affero General Public
 *  License along with this program.  If not, see
 *  <http://www.gnu.org/licenses/agpl-3.0.html>.
 *
 * @author: Niv Sardi
 * @date: 2012/04/04
 */

Proj4js.defs["SR-ORG:7124"] = "+proj=tmerc +lat_0=-34.6297166 +lon_0=-58.4627 +k=0.9999980000000001 +x_0=100055 +y_0=100040 +ellps=intl +units=m +no_defs";
Proj4js.reportError = function(msg) {alert(msg);};

var map;
var gl = null;
var markers = {};
var myloc = new Proj4js.Point (-58.3803787, -34.6136284);
var toloc = new Proj4js.Point (-58.4627,-34.6297166);
var dbgs = [];
var sourceprj = new Proj4js.Proj('WGS84')
var destprj   = new Proj4js.Proj('SR-ORG:7124')
//var hax_proxy = 'core.evilgiggle.com:8124/';
//var hax_proxy = 'localhost:8124/';
var hax_proxy = '';
var routes = [];
var D;

function debug(msg) {
    var p = document.getElementById("debug");
    dbgs.push(msg);
    p.innerHTML = dbgs.join("<br>\n");
}

function info(msg) {
    var p = document.getElementById("debug");
    p.innerHTML = msg + "<br>\n";
}

function plot(map, a) {
    var latlng = new google.maps.LatLng(a.y, a.x);
    marker = new google.maps.Marker({
	map:map,
	draggable:true,
	animation: google.maps.Animation.DROP,
	position: latlng
    });
    return marker
}

function pan_to_bounds(a) {
	console.log (a);
	if (!a) {
		debug ("error, no markers");
		return false;
	}

	var b = new google.maps.LatLngBounds();

	for (var i = 0, l = a.length; i < l; i++) {
		b.extend (a[i].getPosition());
	}

	map.fitBounds(b);
}

function plotB(latlng) {
	console.log(latlng);
	marker = new google.maps.Marker({
		map:map,
		draggable:true,
		animation: google.maps.Animation.DROP,
		position: latlng
	});
	return marker
}

function plotA(a) {
	a.forEach(function (i) {
		plotB (pt_to_latlng(i));
	});
}

function plotP(e, name) {
	var v = pt_to_latlng(e);
	console.log(markers);
	if (markers[name]) {
		markers[name].setPosition(v);
	} else {
		markers[name] = plotB (v);
	}

	map.panTo(v);
}

function initialize() {
/*
	$('input.loc').wrap('<span class="deleteicon" />').after($('<span/>').click(function() {
		alert('click');
	}));
*/
	var myOptions = {
		center: new google.maps.LatLng(myloc.y, myloc.x),
		zoom: 15,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById("map_canvas"),
				  myOptions);
}

function displayError(positionError) {
    alert("error");
}

function loc_button_clicked(o) {
	o.dir = o.getAttribute('value');
	console.log('clicked');
	if ($('#' + o.dir + '-input').prop('auto-loc') != true) {
		return loc_button_on(o)
	}
	return loc_button_off(o);
}

function loc_button_off(o) {
	$('#' + o.dir + '-input').val(o.dir);
	$('#' + o.dir + '-input').prop('auto-loc', false);
	o.classList.remove('on');
	if (o.marker) {
		o.marker.setMap(null);
	}

	$('#' + o.dir + '-input').removeClass('sel-warn');
	$('#' + o.dir + '-input').removeClass('sel-nok');
	$('#' + o.dir + '-input').removeClass('sel-ok');
}

function loc_button_on(o) {
	console.log(o);
	var other = (o.dir == 'from')?'to':'from';
	console.log($('#' + o.dir + '-input').prop('auto-loc'));
	if ($('#' + other + '-input').prop('auto-loc')) {
		loc_button_clicked(document.getElementById('my-loc-' + other));
	}
	$('#' + o.dir + '-input').val(o.dir + ' Current Location');
	$('#' + o.dir + '-input').prop('auto-loc', true);
	o.oldHTML = o.innerHTML;
	o.innerHTML += '<span class="loc-button-spinner" />';
	o.classList.add('loading');
	getLoc(o, function (o, loc) {
		o.classList.remove('loading');
		o.classList.add('on');
		console.log(loc);
		o.innerHTML = o.oldHTML;
		o.setAttribute('status', 'on');
		$('#' + o.dir + '-input').removeClass('sel-warn');
		$('#' + o.dir + '-input').removeClass('sel-nok');
		$('#' + o.dir + '-input').addClass('sel-ok');
	}, function (o, err) {
		console.log(err);
		o.classList.remove('loading');
		o.innerHTML = o.oldHTML;
	});
}

function getLoc(arg, success, failure) {
	if (!gl) {
		try {
			if (typeof navigator.geolocation === 'undefined'){
				gl = google.gears.factory.create('beta.geolocation');
			} else {
				gl = navigator.geolocation;
			}
		} catch(e) {return false;}

		if (!gl) {
			alert("Geolocation services are not supported by your web browser.");
			return false;
		}
	}
	gl.getCurrentPosition(function handle(position) {
		success(arg, position);
		myloc = new Proj4js.Point(position.coords.longitude, position.coords.latitude);
		var latlng = new google.maps.LatLng (position.coords.latitude, position.coords.longitude);
		map.panTo(latlng);
		if (! markers[arg.dir]) {
			markers[arg.dir] = new google.maps.Marker({
				map:map,
				draggable:true,
				animation: google.maps.Animation.DROP,
				position: latlng
			});
		} else {
			var marker = markers[arg.dir];
			marker.setMap(map);
			marker.setPosition(latlng);
			marker.setAnimation(google.maps.Animation.DROP);
		}
		console.log(latlng);
	}, function error(err) {
		failure(arg, err);
	}
	);
	return gl;
}

function longlat_to_loc (P) {
    Pt  = new Proj4js.Point(P.x, P.y);
    Proj4js.transform(sourceprj, destprj,  Pt);
    return Pt;
}

function pt_to_latlng (Pt) {
	var rPt = new Proj4js.Point(Pt.x, Pt.y);
	Proj4js.transform(destprj, sourceprj, rPt);
	var r = new google.maps.LatLng (rPt.y, rPt.x);
	return r;
}

function latlng_to_pt (a) {
	var rPt = new Proj4js.Point(a.lng(), a.lat());
	Proj4js.transform(sourceprj, destprj, rPt);
	return rPt;
}


function loc_to_latlng (loc) {
    var a = loc.split(',');
    return pt_to_latlng(new Proj4js.Point(a[0], a[1]));
}

function show_rec(dn) {
	var dest = routes[dn];

	var url = "http://recorridos.mapa.buenosaires.gob.ar/load_plan?trip_id=" + dest.id + "&callback=?";
	$.getJSON(url, trace_route);
	$('#route-bar-' + dn).toggleClass("ui-bar-e", 0);
	$('#route-bar-' + dn).toggleClass("ui-bar-b", 1000);
	$('html, body').animate({scrollTop: '1000px'}, 1000);
}

function trace_route(route) {
	D = route;
	var gml;
	for (p in route.plan) {
		gml = route.plan[p].gml;
		var dom = new DOMParser().parseFromString(gml,
							  "text/xml");
		if (! dom.getElementsByTagName ("coordinates" ).lenght) {
			console.log (gml,' no coord');
		}

		var coord = dom.getElementsByTagName ("coordinates" )[0].textContent;
		var type = dom.getElementsByTagName ("type" )[0].textContent;
		var a = coord.split(' ');

		if (a.length < 2) {
			console.log ('not long enough');
		} else {
			var la = []
			while (b = a.pop()) {
				la.push(loc_to_latlng(b));
			}
			var color = "#FF0000";
			if (type == 'subway') {
				color = "#00FF00";
			} else if (type == 'walk') {
				color = "#0000FF";
			} else if (route.plan[p].type == 'Street') {
				color = "#00FFFF";
			} else if (route.plan[p].type == 'Bus') {
				color = "#FF00FF";
			}
			var path = new google.maps.Polyline ({
				path: la,
				strokeColor: color,
				strokeWeight: 2
			});
			path.setMap(map);
		}
		console.log (p, '--', type ,' --> ',coord);
	}
}

function trace_routeix(route) {
    D = route;
    var gml;
    for (p in route.plan) {
	gml = route.plan[p].gml;

	var doc = (new DOMParser()).parseFromString(gml, 'text/xml');
	var xml = $('[nodeName=gml:feature]', doc);
	var type = xml.find( "[nodeName=gml:type]" );

	debug (p+ '--' + type + ' --> ' + xml);
    }
}

function show_route(route) {
	var p = document.getElementById("route");
	var buf;
	var lg = route.planning;
	routes = []

	console.log ('show_route');
	var l = ['a', 'b', 'c'];

	buf = '<div class="ui-grid-b">';
	lg.forEach(function(item, i) {
		routes.push(jQuery.parseJSON(item));
		var dest = routes[i];
		buf += '<div class="ui-block-'+l[i%l.length]+'">';
		buf += '<div id="route-bar-'+i+'" class="ui-bar ui-bar-e" style="height=70px" onclick="show_rec(' + i + ')">';
		buf += dest.tiempo + ' minutos,<br>servicios: ' + dest.services;
		buf += '</div>';
		buf += '</div>';
	});
	buf += '</div>';
	p.innerHTML = buf;

	$('#route_collapsible a:first').click();
	$('#para_collapsible a:first').click();
}

function json_call(f, e, cb) {
	return $.getJSON(f(e), cb);
}

function parrallel (requests, action, alldone) {
	var done = requests.length;
	var res  = [];

	$(requests).each(function (i, e) {
		action(e, function(o) {
			res[i] = o;
			console.log (done, i, o, res[i]);
			done -= 1;
			if (done == 0) alldone(res);
		});
	});
}

function request_pos_url (e) {
	return "http://ws.usig.buenosaires.gob.ar/geocoder/2.2/geocoding/?callback=?&cod_calle=" + e.id + "&altura=" + e.num;
}

function curry (fn) {
	var slice = Array.prototype.slice,
        args = slice.apply(arguments, [1]);
	return function () {
		return fn.apply(null, args.concat(slice.apply(arguments)));
	};
}

function find() {
	var a = ['from', 'to'];
	var reqs = [];
	for (var i = 0; i < a.length; i++) {
		var e = a[i];
		if ($('#' + e + '-input').prop('auto-loc')) {
			$[e] = latlng_to_pt(markers[e].getPosition());
			break;
		}

		v = {id :$("#" + e + "-id").prop('value'),
		     num:$("#" + e + "-num").prop('value'),
		    dir:a[i]};
		if (! (v.id && v.num)) {
			console.log('not enough data on' + e);
			return false
		}
		reqs.push(v);
	}
	console.log('reqs', reqs)
	pan_to_bounds ([markers.from, markers.to]);
	parrallel(reqs, curry(json_call, request_pos_url),
		  curry(store_and_find, reqs));
}


function store_and_find(a, r) {

	if (a.length != r.length) console.log(this, "error size mismatch");
	$(a).each(function(i, e) {
		$[e.dir] = r[i];
	});

	console.log($.from.x, $.from.y, $.to.x, $.to.y);
	$.getJSON('http://recorridos.mapa.buenosaires.gob.ar/recorridos_transporte?callback=?&origen=' + $.from.x + "%2C" + $.from.y + "&destino=" + $.to.x + "%2C" + $.to.y + "&origen_calles=3085&destino_calles=17132&origen_calle_altura=3599&destino_calle_altura=409&opciones_caminata=800&opciones_medios_colectivo=true&opciones_medios_tren=true&opciones_medios_subte=true", show_route);
}
