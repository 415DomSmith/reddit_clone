var db = require("../models");

var routeHelpers = {
  ensureLoggedIn: function(req, res, next) {
    if (req.session.id !== null && req.session.id !== undefined) {
      return next();
    }
    else {
     res.redirect('/login');
    }
  },

//TODO - Figure out how to set up ensureCorrectUser (for posts and comments)
  ensureCorrectUser: function(req, res, next) {
    db.Post.findById(req.params.id, function(err,posts){
      if (post.ownerId !== req.session.id) {
        res.redirect('/posts');
      }
      else {
       return next();
      }
    });
  },

  preventLoginSignup: function(req, res, next) {
    if (req.session.id !== null && req.session.id !== undefined) {
      res.redirect('/posts');
    }
    else {
     return next();
    }
  }
};
module.exports = routeHelpers;