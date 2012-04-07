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

function get_from_ba_hack () {

}

$(function () {
    $( "#tags" ).autocomplete({
	source: get_from_ba_hack
	});
});

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

function panAB(a, b) {
	if (!a || !b) {
		debug ("error, no markers");
		return false;
	}

	var all = a.getPosition();
	var bll = b.getPosition();

	var b = new google.maps.LatLngBounds(all, bll);
	if (b.isEmpty()) {
		b = new google.maps.LatLngBounds(bll, all);
	}
	console.log(b, b.isEmpty(), all, bll);

	map.panToBounds(b);
}

function plotB(latlng) {
	console.log(latlng);
	marker = new google.maps.Marker({
		map:map,
		draggable:true,
		animation: google.maps.Animation.BOUNCE,
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
	var myOptions = {
		center: new google.maps.LatLng(myloc.y, myloc.x),
		zoom: 15,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById("map_canvas"),
				  myOptions);
	getLoc(map);
}

function displayError(positionError) {
    alert("error");
}

function getLoc(map) {
    var gl;
    var marker;

    try {
	if (typeof navigator.geolocation === 'undefined'){
	    gl = google.gears.factory.create('beta.geolocation');
	} else {
	    gl = navigator.geolocation;
	}
    } catch(e) {return debug ("e");}

    if (!gl) {
	return debug("Geolocation services are not supported by your web browser.");
    }
    gl.getCurrentPosition(function handle(position) {
	myloc = new Proj4js.Point(position.coords.longitude, position.coords.latitude);
	var latlng = new google.maps.LatLng (position.coords.latitude, position.coords.longitude);
	map.panTo(latlng);
	marker = new google.maps.Marker({
	    map:map,
	    draggable:true,
	    animation: google.maps.Animation.DROP,
	    position: latlng
	});

	//	    google.maps.event.addListener(marker, 'click', toggleBounce);
    });
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

function loc_to_latlng (loc) {
    var a = loc.split(',');
    return pt_to_latlng(new Proj4js.Point(a[0], a[1]));
}

function show_rec(dn) {
	var dest = routes[dn];

	var url = "http://recorridos.mapa.buenosaires.gob.ar/load_plan?trip_id=" + dest.id + "&callback=?";
	$.getJSON(url, trace_route);
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
    var p = document.getElementById("info");
    var buf = "";
    var lg = route.planning;
    lg.forEach(function(item) {
	var index = routes.length;
	routes.push(jQuery.parseJSON(item));
	var dest = D = routes[index];
	buf += '<button type="button" onclick="show_rec(' + index + ')">Show</button>';
	buf += dest.tiempo + '---' + dest.services + "<br>\n";
    });
    p.innerHTML = buf;
}

function parrallel (requests, format, alldone) {
	var done = requests.length;
	var res  = [];

	$(requests).each(function (i, e) {
		$.getJSON(format(e), function(o) {
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

function find() {
	// Assign handlers immediately after making the request,
	// and remember the jqxhr object for this request

	var done = 2;
	var res  = [];
	D = done;
	var from = {id :$( "#from-id" ).prop('value'),
		    num:$( "#from-num").prop('value')};
	var to   = {id :$( "#to-id"   ).prop('value'),
		    num:$( "#to-num"  ).prop('value')};

	panAB (markers.from, markers.to);

	console.log('DEBUG', from, to, '\n');

	if (! (from.id && from.num)) {
		info ("weird from");
		return;
	}
	if (! (to.id && to.num)) {
		info ("weird to");
		return;
	}

	parrallel([from, to], request_pos_url, find2);
}

function find2(a) {
	var from = a[0];
	var to   = a[1];

	$.getJSON('http://recorridos.mapa.buenosaires.gob.ar/recorridos_transporte?callback=?&origen=' + from.x + "%2C" + from.y + "&destino=" + to.x + "%2C" + to.y + "&origen_calles=3085&destino_calles=17132&origen_calle_altura=3599&destino_calle_altura=409&opciones_caminata=800&opciones_medios_colectivo=true&opciones_medios_tren=true&opciones_medios_subte=true", show_route);
}
