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
