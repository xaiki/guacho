var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/guacho');
Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;

// Calle schema
var Calle = new Schema({
    id:   {type: Number, required: true, min: 0, default:0},
    type: {type: String, required: true, lowercase: true, default:'calle', match:/(calle|avenida|boulevard)/},
    name: {type: String, required: true, lowercase: true},
    num:  {type: Array,  default:[]},
});
mongoose.model('Calle', Calle);
var Calle = exports.Calle = mongoose.model('Calle');
