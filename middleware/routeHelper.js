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

  ensureCorrectUserPost: function(req, res, next) {
    db.Post.findById(req.params.id, function (err, post){
      console.log(post);
      if (post.user != req.session.id) {
        res.redirect("/posts")
      }
      else {
       return next();
      }
    });
  },

  ensureCorrectUserComment: function(req, res, next) {
    db.Comment.findById(req.params.id, function (err, data){
      console.log(data);
      if (data.user != req.session.id) {
        db.Comment.findById(req.params.id, function (err, comment) {
          console.log(comment);
          res.redirect("/posts/" + comment.post + "/comments")
        })
      } else {
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