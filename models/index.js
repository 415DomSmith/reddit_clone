var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/redditClone_app');

mongoose.set('debug', true);

module.exports.User = require('./user');
module.exports.User = require('./comment');
module.exports.User = require('./post');