var express = require('express');
var app = express();
var session = require('express-session');


var profileController = require('./routes/profileController');

app.use(session({
  'secret': 'vjhadbka'
}));

app.use(function(req,res,next){
    res.locals.mySession = req.session;
    next();
}); //to make the session available to all the ejs files

var router = require('./routes/connectionController.js');//requring it to handle routing

app.set('view engine','ejs');//used for using ejs
app.use('/assets',express.static('assets'));//used for including static item such as stylesheets and images

app.use('/profile',profileController);
app.use('/',router);

app.listen(8080);
console.log('listening on port 8080');
