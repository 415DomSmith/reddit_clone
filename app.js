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

app.use(session({
  maxAge: 3600000, //hour long session cookie
  secret: 'deathbysnoosnoo', 
  name: "Reddit Clone" 
}));



//ROUTES

//posts routes & login stuff

//root -- redirects to post index

app.get('/', function (req, res){
	res.redirect('/posts');
});

//signup page

app.get('/signup', routeMiddleware.preventLoginSignup, function (req, res){
	res.render('users/signup');
});

//create new user

app.post('/signup', function (req, res){
	var newUser = req.body.user;
	db.User.create(newUser, function (err, user){
		if (user) {
			req.login(user);
			res.redirect('/posts'); 
		} else {
			console.log(err);
			res.render('users/signup');
		}
	});
});

//TODO -- make user index route to show all users


//TODO -- make user show page to show an individual user


//TODO -- make 'your account' page to show users profile based on session id

//login page

app.get('/login', routeMiddleware.preventLoginSignup, function (req, res){
	res.render('users/login');
});

//user login

app.post('/login', function (req, res){
	db.User.authenticate(req.body.user, function (err, user){
		if(!err && user !== null){
			req.login(user);
			res.redirect('/posts');
		} else {
			res.render('users/login');
		}
	});
});

//posts index and landing page

app.get('/posts', function (req, res){
	db.Post.find({}, function (err, post){
		//db.Post.find(({}).populate('comments').exec(function (err, post){
		if(err){
			res.render('errors/404')
		} else {
			res.render('posts/index', {post : post});
		}
	});
});

//new 

app.get('/posts/new', routeMiddleware.ensureLoggedIn, function (req, res){
	res.render('posts/new');
});


//create 

app.post('/posts', routeMiddleware.ensureLoggedIn, function (req, res){
	db.Post.create(req.body.post, function(err, post) { //creates a post from post object taken from form submit
    post.user = req.session.id; //assigns the users id (from session) to the post, giving ownership of that post to the logged in user.
    post.save(); //updates post db
    db.User.findById(req.session.id, function(err, user) { //finds the user in the DB by the session id (same as user id)
      user.posts.push(post); //adds the new post to the users posts array
      user.save(); //updates user db
      res.redirect("/posts");    
    })

  });
});

// SHOW = post show is also comments index page (child of user, parent of comments, Many of Many?)

app.get('/posts/:id/comments', function (req, res){
	db.Post.findById(req.params.id).populate('comments').populate('user').exec(function (err, post){ //populates the post object with comments associated with that post
		console.log(post);
		res.render('comments/index', {post : post})
	})
});

//edit

app.get('/posts/:id/edit', routeMiddleware.ensureLoggedIn, routeMiddleware.ensureCorrectUserPost, function (req,res){
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

app.put('/posts/:id', routeMiddleware.ensureLoggedIn, routeMiddleware.ensureCorrectUserPost, function (req,res){
  db.Post.findByIdAndUpdate(req.params.id, req.body.post, function (err, post){
    if(err){
      res.render("errors/404")
    } else {
      res.redirect("/posts");
    }
  });
});

//destroy

app.delete('/posts/:id', routeMiddleware.ensureLoggedIn, routeMiddleware.ensureCorrectUserPost, function (req,res){
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

app.get('/posts/:post_id/comments/new', routeMiddleware.ensureLoggedIn, function (req, res){
	db.Post.findById(req.params.post_id, function (err, post){
		res.render('comments/new', {post : post});
	});
});

//comment create


app.post("/posts/:post_id/comments", function(req, res) {
  db.Comment.create(req.body.comment, function(err, comment) { //creates a comment based on the form body submit, comment data is second param and is used below
    if (err){
    	console.log(err);
			res.render('comments/new');
    } else {
    	db.Post.findById(req.params.post_id, function (err, post) { //finds in the db the post based on the id passed in the url
      post.comments.push(comment); //pushes the comment data to the found post's comments array
      comment.post = post._id; //sets the post to the id in the url/req.params
      comment.user = req.session.id; //sets the user id of the comment to the session id, giving ownership of that comment to the logged in user
      post.save(); //updates post collection in db
      comment.save(); //updates comment collection in db
      
      	db.User.findById(req.session.id, function (err, user) { //finds the user in the user collection based on his session Id (same as user ID)
        user.comments.push(comment) //add the comment to the users comments array
        user.save(); //updates user collection in db
        res.redirect("/posts/" + req.params.post_id + "/comments")
 
   			})
    	})
    }	
  });
});



//comments show  --- not making a comments show EJS... 

// app.get('/posts/:post_id/comments/:id', function (req, res){
// 	db.Comment.findById(req.params.id).populate('post').exec(function (err, comment){
// 		res.render('comments/show', {comment : comment})
// 	});
// });


//comments edit 

app.get('/posts/:post_id/comments/:id/edit', routeMiddleware.ensureLoggedIn, routeMiddleware.ensureCorrectUserComment, function (req, res){
	db.Comment.findById(req.params.id).populate('post').exec(function (err, comment){
		res.render('comments/edit', {comment : comment});
	});
});

//comments update 

app.put('/posts/:post_id/comments/:id', routeMiddleware.ensureLoggedIn, routeMiddleware.ensureCorrectUserComment, function (req, res){
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

app.delete('/posts/:post_id/comments/:id', routeMiddleware.ensureLoggedIn, routeMiddleware.ensureCorrectUserComment, function (req, res){
	db.Comment.findByIdAndRemove(req.params.id, function (err, comment){
		if(err){
			console.log(err);
			res.render('errors/404')
		} else {
			res.redirect('/posts/' + req.params.post_id + '/comments');
		}
	});
});

//user logout

app.get('/logout', function (req, res){
  req.logout();
  res.redirect('/loggedOut');
});

app.get('/loggedOut', function (req, res){
	res.render('users/logout')
}); //renders a page to let the user know they logged out.

//catch all
app.get('*', function (req, res){
	res.render("errors/404");
});

//server start
app.listen(3000, function (){
	console.log("Server is serving on port: 3000");
});