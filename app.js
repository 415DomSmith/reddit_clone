var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    db = require("./models"),
    methodOverride = require("method-override"),
    session = require("cookie-session"),
    morgan = require("morgan"),
    loginMiddleware = require("./middleware/loginHelper");
    routeMiddleware = require("./middleware/routeHelper");

app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(morgan('tiny'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
  maxAge: 3600000, //hour long session cookie
  secret: 'deathbysnoochy', 
  name: "Reddit clone" 
}));

app.use(loginMiddleware);

//ROUTES

//POSTS ROUTES & LOGIN

//root
app.get('/', function (req, res){
	res.redirect ('/posts/index');
});

app.get('/signup', /*routeMiddleware.preventLoginSignup,*/ function (req, res){
	res.render('users/signup');
});

app.post('/signup', function (req, res){
	var newUser = req.body.user;
	db.User.create(newUser, function (err, user){
		is (user) {
			req.login(user);
			res.redirect('/posts');
		} else {
			console.log(err);
			res.render('users/signup');
		}
	});
});

app.get('/login', /*routeMiddleware.preventLoginSignup,*/ function (req, res){
	res.render('users/login');
});

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

//index
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
app.post('', function (req, res){
	db.Book.create(, function(err,book){
		if(err){
			res.render('');
		} else {
			res.redirect('');
		}
	})
});

//show
app.get('', function (req, res){
	db.Book.findById(, function (err, book){
		if(err){
			res.render('');
		} else {
			res.render('',);
		}
	})
});

//edit
app.get('', function (req, res){
	db.Book.findById(, function (err, book){
		if(err){
			res.render('');
		} else {
			res.render('', );
		}
	})
});

//update

app.put('', function (req, res){
	db.Book.findByIdAndUpdate(req.params.id, req.body.player, function (err, book){
		if(err){
			res.render('errors/404');
		} else {
			res.redirect('');
		}
	})
});

//destroy

app.delete('', function (req, res){
	db.Book.findByIdAndRemove(req.params.id, req.body.book, function (err, book){ 
		if(err){
			res.render('');
		} else {
			res.redirect('')
		}
	})
});

//catch all
app.get('*', function (req, res){
	res.render("");
});

//server start
app.listen(3000, function (){
	console.log("Server is serving on port: 3000");
});