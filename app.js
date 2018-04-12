var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var MySQLStore = require('express-mysql-session')(session);

var bodyParser = require('body-parser');
var bkfd2Password = require("pbkdf2-password");
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var hasher = bkfd2Password();
var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(cookieParser());



//==================== Session ====================
app.use(session({
  secret: '1234DSFs@adf1234!@#$asd',
  resave: false,
  saveUninitialized: true,
  store: new FileStore()
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/countSession', function(req, res){

  if(req.session.count) {
    req.session.count++;
  } else {
    req.session.count = 1;
  }
  res.send('count : '+req.session.count);
});

//==================== Session ====================

//------------------------ register ------------------

var users = [
  {
    username:'egoing',
   password:'mTi+/qIi9s5ZFRPDxJLY8yAhlLnWTgYZNXfXlQ32e1u/hZePhlq41NkRfffEV+T92TGTlfxEitFZ98QhzofzFHLneWMWiEekxHD1qMrTH1CWY01NbngaAfgfveJPRivhLxLD1iJajwGmYAXhr69VrN2CWkVD+aS1wKbZd94bcaE=',
   salt:'O0iC9xqMBUVl3BdO50+JWkpvVcA5g2VNaYTR5Hc45g+/iXy4PzcCI7GJN5h5r3aLxIhgMN8HSh0DhyqwAp8lLw==',
   displayName:'Egoing'
  }
];

app.get('/welcome', function(req, res){
  if(req.session.displayName) {
    res.send(`
      <h1>Hello, ${req.session.displayName}</h1>
      <a href="/auth/logout">logout</a>
    `);
  } else {
    res.send(`
      <h1>Welcome</h1>
      <a href="/">Home</a>
    `);
  }
});

app.post('/auth/register', function(req, res){
  hasher({password:req.body.password}, function(err, pass, salt, hash){
    var user = {
      username:req.body.username,
      password:hash,
      salt:salt,
      displayName:req.body.displayName
    };
    users.push(user);
    req.session.displayName = req.body.displayName;
    req.session.save(function(){
      res.redirect('/welcome');
    });
  });
});

app.get('/auth/register', function(req, res){
  var output = `
  <h1>Resister</h1>
  <form action="/auth/register" method="post">
    <p>
      <input type="text" name="username" placeholder="username">
    </p>
    <p>
      <input type="password" name="password" placeholder="password">
    </p>
    <p>
      <input type="text" name="displayName" placeholder="displayName">
    </p>
    <p>
      <input type="submit">
    </p>
    <p>
      <a href="/">Home</a>
    </p>
  </form>
  `;
  res.send(output);
});


//------------------------ register ------------------



// ===================== Login ====================



app.get('/auth/logout', function(req, res){
  delete req.session.displayName;
  res.redirect('/');
});


// app.post('/auth/login', function(req, res){
//   var uname = req.body.username;
//   var pwd = req.body.password;
//
//   for (var i = 0; i < users.length; i++) {
//     var user = users[i];
//     if(uname === user.username) {
//      return hasher({password:pwd, salt:user.salt}, function(err, pass, salt, hash){
//        if(hash === user.password){
//          req.session.displayName = user.displayName;
//          req.session.save(function(){
//            res.redirect('/welcome');
//          })
//        } else {
//          res.send('Who are you? <a href="/auth/login">login</a>');
//        }
//       });
//     }
//   }
//   res.send('Who are you? <a href="/auth/login">login</a>');
// });
passport.use(new LocalStrategy(
  function(username, password, done) {
      var uname = username;
      var pwd = password;
      for (var i = 0; i < users.length; i++) {
        var user = users[i];
        if(uname === user.username) {
         return hasher({password:pwd, salt:user.salt}, function(err, pass, salt, hash){
           if(hash === user.password){
             done(null, user);
             // req.session.displayName = user.displayName;
             // req.session.save(function(){
             //   res.redirect('/welcome');
             // })
           } else {
             done(null, false)
             // res.send('Who are you? <a href="/auth/login">login</a>');
           }
          });
        }
      }
      done(null, false);
  }
));

app.post(
  '/auth/login',
  passport.authenticate(
    'local',
    {
      successRedirect: '/welcome',
      failureRedirect: '/auth/login',
      failureFlash: false
    }
  )
);


app.get('/auth/login', function(req, res){
  var output = `
  <h1>Login</h1>
  <form action="/auth/login" method="post">
    <p>
      <input type="text" name="username" placeholder="username">
    </p>
    <p>
      <input type="password" name="password" placeholder="password">
    </p>
    <p>
      <input type="submit">
    </p>
    <p>
      <a href="/">Home</a>
    </p>
  </form>
  `;
  res.send(output);
});
// ===================== Login ====================










//-----------Cookie Ex2-----------
var products = {
  1:{title:'The history of web 1'},
  2:{title:'The next web'},
  3:{title:'The dev web'}
};

app.get('/products', function(req, res){
  var output = '<h1>Products</h1>';
  for(var name in products) {

    output += `
      <li>
         <a href="/cart/${name}">${products[name].title}</a>
      </li>`
  }
  res.send(`<ul>${output}</ul><a href="/cart">Cart</a>
  <a href="/">Home<a>`);
});


app.get('/cart', function(req, res){
  var cart = req.cookies.cart;
  if(!cart) {
    res.rend('Empty!');
  } else {
    var output = '';
    for(var id in cart){
      output += `<li>${products[id].title} (${cart[id]})</li>`;
    }
  }
  res.send(`
    <h1>Cart</h1>
    <ul>${output}</ul>
    <a href="/products">Products List</a>
  `);
});



app.get('/cart/:id', function(req, res){
  var id = req.params.id;
  if(req.cookies.cart){
    var cart = req.cookies.cart;
  }else{
    var cart = {};
  }

  if(!cart[id]){
    cart[id] = 0;
  }
  cart[id] = parseInt(cart[id]) + 1;
  res.cookie('cart', cart);

  var output = cart;

  res.send(output);
});
//-----------Cookie Ex2-----------

//========================Cookie Ex1========================

app.get('/count', function(req, res){

  if(req.cookies.count){
    var count = parseInt(req.cookies.count);
  }else{
    var count = 0;
  }
  count = count +1;
  res.cookie('count', count);
  var output = `
  <h1>Cookie Ex</h1>
  <a>count : </a>${count}<br>
  <a href="/">Home</a><br>
  `

  res.send(output);
});

//========================Cookie Ex1========================

app.get('/', function(req, res){
  var output = `
  <h1>HomePage</h1>
  <a href="/topic/0">Route</a><br>
  <a href="/count">Cookie Exam</a><br>
  <a href="/products">Cookie Exam2</a><br>
  <a href="/auth/login">Login</a><br>
  <a href="/auth/register">Register</a><br>
  `
    res.send(output);
});
//
// app.get('/topic', function(req, res){
//
//   var topics = [
//     'Javascript is....',
//     'Nodejs is...',
//     'Express is...'
//   ];
//   var output = `
//   <a href="/topic?id=0">JavaScript</a><br>
//   <a href="/topic?id=1">Nodejs</a><br>
//   <a href="/topic?id=2">Express</a><br><br>
//   ${topics[req.query.id]}
//   `
//   res.send(output);
// });

app.get('/topic/:id', function(req, res){
  var topics = [
    'Javascript is....',
    'Nodejs is...',
    'Express is...!'
  ];
  var output = `
  <a href="/topic/0">JavaScript</a><br>
  <a href="/topic/1">Nodejs</a><br>
  <a href="/topic/2">Express</a><br><br>
  ${topics[req.params.id]}<br>
  <a href="/">Home</a><br>
  `
  res.send(output);
})
app.get('/topic/:id/:mode', function(req, res){
  res.send(req.params.id+','+req.params.mode)
})

app.get('/dynamic', function(req, res){
  var lis = '';
  for(var i=0; i<5; i++){
    lis = lis + '<li>coding</li>';
  }
  var time = Date();
  var output = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <title></title>
    </head>
    <body>
        Hello, Dynamic!
        <ul>
          ${lis}
        </ul>
        ${time}
    </body>
  </html>`;
  res.send(output);
});
app.get('/route', function(req, res){
    res.send('Hello Router, <img src="/route.png">')
})
app.get('/login', function(req, res){
    res.send('<h1>Login please</h1>');
});
app.listen(3000, function(){
    console.log('Conneted 3000 port!');
});
