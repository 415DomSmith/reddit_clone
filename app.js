var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    db = require("./models"),
    methodOverride = require("method-override"),
    session = require("cookie-session"),
    morgan = require("morgan"),
		loginMiddleware = require("./middleware/loginHelper"),
		routeMiddleware = require("./middleware/routeHelper");

app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(morgan('tiny'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(loginMiddleware);

// console.log(db);

// app.use(session({
//   maxAge: 3600000, //hour long session cookie
//   secret: 'deathbysnoochy', 
//   name: "Reddit clone" 
// }));



//ROUTES

//posts routes & login stuff

//root

app.get('/', function (req, res){
	res.redirect('/posts');
});

//signup page

app.get('/signup', /*routeMiddleware.preventLoginSignup,*/ function (req, res){
	res.render('users/signup');
});

//create new user

// app.post('/signup', function (req, res){
// 	var newUser = req.body.user;
// 	db.User.create(newUser, function (err, user){
// 		if (user) {
// 			req.login(user);
// 			res.redirect('/posts');
// 		} else {
// 			console.log(err);
// 			res.render('users/signup');
// 		}
// 	});
// });

//login page

// app.get('/login', /*routeMiddleware.preventLoginSignup,*/ function (req, res){
// 	res.render('users/login');
// });

//user login

// app.post('/login', function (req, res){
// 	db.User.authenticate(req.body.user, function (err, user){
// 		if(!err && user !== null){
// 			req.login(user);
// 			res.redirect('/posts');
// 		} else {
// 			res.render('users/login');
// 		}
// 	});
// });

//posts index and landing page

app.get('/posts', /*routeMiddleware.ensureLoggedIn,*/ function (req, res){
	db.Post.find({}, function (err, post){
		if(err){
			res.render('errors/404')
		} else {
			res.render('posts/index', {post : post});
		}
	});
});

//new 

app.get('/posts/new', function (req, res){
	res.render('posts/new');
});


//create

app.post('/posts', /*routeMiddleware.ensureLoggedIn,*/ function (req, res){
	db.Post.create(req.body.post, function (err, post){
		if(err){
			res.render('errors/404');
		} else {
			res.redirect('/posts');
		}
	})
});

// var post = new db.Post(req.body.post);
	// post.user = req.session.id;
	// post.save(function (err, post) {
	// 	res.redirect('/posts')
	// });

// SHOW = post show is also comments index page (child of user, parent of comments, Many of Many?)

app.get('/posts/:id/comments', /*routeMiddleware.ensureLoggedIn,*/ function (req, res){
	db.Post.findById(req.params.id).populate('comments').exec(function (err, post){
		// console.log(post);
		res.render('comments/index', {post : post})
	})
});

//edit

app.get('/posts/:id/edit', /*routeMiddleware.ensureLoggedIn, routeMiddleware.ensureCorrectUser,*/ function (req,res){
  db.Post.findById(req.params.id, function (err, post){
    if(err){
      res.render("errors/404")
    } else {
    	console.log(post);
      res.render('posts/edit', {post : post});
    }
  });
});

//update

app.put('/posts/:id', /*routeMiddleware.ensureLoggedIn,*/ function (req,res){
  db.Post.findByIdAndUpdate(req.params.id, req.body.post, function (err, post){
    if(err){
      res.render("errors/404")
    } else {
      res.redirect("/posts");
    }
  });
});

//destroy

app.delete('/posts/:id', /*routeMiddleware.ensureLoggedIn,*/ function (req,res){
  db.Post.findByIdAndRemove(req.params.id, function (err, post){
    if(err){
      res.render("errors/404")
    } else {
      res.redirect("/posts");
    }
  });
});


//comments routes


//comments index is same as posts show

//comments new

app.get('/posts/:post_id/comments/new', function (req, res){
	db.Post.findById(req.params.post_id, function (err, post){
		res.render('comments/new', {post : post});
	});
});

//comment create

app.post('/posts/:post_id/comments', function (req, res){
	db.Comment.create(req.body.comment, function (err, comment){
		if(err){
			console.log(err);
			res.render('comments/new');
		} else {
			db.Post.findById(req.params.post_id, function (err, post){
				post.comments.push(comment);
				comment.post = post._id;
				comment.save();
				post.save();
				res.redirect('/posts/' + req.params.post_id + '/comments');
			});
		}
	});
});


//comments show

// app.get('/posts/:post_id/comments/:id', function (req, res) {
// 	db.Comment.findById(req.params.id, function (err, comment) {
// 		res.render('comments/show', {comment : comment})
// 	});
// });

app.get('/posts/:post_id/comments/:id', function (req, res){
	db.Comment.findById(req.params.id).populate('post').exec(function (err, comment){
		res.render('comments/show', {comment : comment})
	});
});


//comments edit -- something isn't working with my edit or update... getting post not defined.

app.get('/posts/:post_id/comments/:id/edit', function (req, res){
	db.Comment.findById(req.params.id).populate('post').exec(function (err, comment){
		res.render('comments/edit', {comment : comment});
	});
});

//comments update -- something isn't working with my edit or update... getting post not defined.

app.put('/posts/:post_id/comments/:id', function (req, res){
	db.Comment.findByIdAndUpdate(req.params.id, req.body.comment, 
	function (err, comment){
		if (err){
			res.render('comments/edit');
		} else {
			res.redirect('/posts/' + req.params.post_id + '/comments');
		}
	});
});

//comments destroy

app.delete('/posts/:post_id/comments/:id', function (req, res){
	db.Comment.findByIdAndRemove(req.params.id, function (err, comment){
		if(err){
			console.log(err);
			res.render('errors/404')
		} else {
			res.redirect('/posts/' + req.params.post_id + '/comments');
		}
	});
});

// //user logout
// app.get('/logout', function (req, res){
//   req.logout();
//   res.redirect('/');
// })

//catch all
app.get('*', function (req, res){
	res.render("errors/404");
});

//server start
app.listen(3000, function (){
	console.log("Server is serving on port: 3000");
});