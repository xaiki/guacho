/**
 * Example node.js application to show how jquery.ui autocomplete
 * can use data from a node.js socket connection
 *
 * @author: Dominic Böttger
 * @date: 2011/09/04
 */

var sys = require('sys'),
     fs = require('fs');

var express = require('express'),
    sys = require('sys'),
    app = module.exports = express.createServer(),
    models = require('./model'),
    Calle = models.Calle;

var app = module.exports = express.createServer();
var everyone = require("now").initialize(app);

//Configuration
app.configure(function(){
	var public_path = __dirname + '/public';
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(require('stylus')
		.middleware({
			src: public_path,
			force: true,
		}));
	app.use(app.router);
	app.use(express.static(public_path));
});

app.configure('development', function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
	app.use(express.errorHandler());
});

// base url and template
app.get('/', function(req, res){
	res.render('index', {
	    title: 'Home'
	});
});


function simple_escape( str ) {
    return (str+'').replace(/([\\"'\(\)])/g, "\\$1").replace(/\0/g, "\\0");
}


function simple_subst (s) {
    var replace_reg = {
	'ing.'  : 'ingeniero',
	'dr.'   : 'doctor',
	'cnel'  : 'coronel',
	'gral.' : 'general',
    };
    var r;

    for (r in replace_reg) {
	s = s.replace(r, replace_reg[r]);
    }

    return s;
}

// now js search function
everyone.now.search = function(text, count, callback) {
	// create regex for "contains" and ignore case
	var c     = text.term.split(/( [0-9]+)$/)[0];
	var aregx = c.split(' ').map (function (e) {
		return new RegExp(simple_escape(e), 'i');
	});
	// execute the search
	Calle.find({name:{$all:aregx}}, function(err, docs) {
		var names = [];
		for(var nam in docs) {
			var s  = docs[nam];
			// push the firstname to the array
			var l = [s.type, s.name, s.num].join(' ');
			names.push({label:l, value:s.name, obj:s});
		}
		// send back via callback function
		callback(null, names);
	});
};

// function to create our test content...
app.get('/create', function(req, res){
    var calle, t, n, r;

    var fc = fs.readFileSync('callejero.json', 'utf8');
    var schema = JSON.parse(fc);

    schema.forEach(function (s) {
	t = 'calle';
	n = s[1].toLowerCase();

	r = / av\.$/;
	if (n.match(r)) {
//	    n = n.replace(r, '');
	    t = 'avenida';
	}
	n = simple_subst(n);
	calle = new Calle({id:s[0], name:n, type:t, num:s[3]});
	console.log('parsed: ' + calle + '\n');
	calle.save();
    });

    res.redirect('/');
});

app.listen(3000);
console.log("Autocomplete server listening on port %d in %s mode", app.address().port, app.settings.env);
