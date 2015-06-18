var mongoose = require('mongoose');

var commentSchema = new mongoose.Schema({
	commentBody: String,
	post: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Post'
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}
});
	
var Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;

// console.log(Comment);