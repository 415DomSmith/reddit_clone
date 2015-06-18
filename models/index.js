var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/redditClone_app');

mongoose.set('debug', true);

// module.exports.User = require('./user');
module.exports.Comment = require('./comment');
module.exports.Post = require('./post');

// console.log(require('./comment'));

// console.log(require('./post'));