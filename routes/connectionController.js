 var express = require('express');
 var router = express.Router();
 var crypto = require('crypto');
 const { body,validationResult } = require('express-validator');
 const { sanitizeBody } = require('express-validator');
 var moment = require('moment');
 var user = require('../models/user.js');
 var userProfilesDB = require('../util/userConnectionDB.js');

 var bodyParser = require("body-parser");
 var urlencodedParser = bodyParser.urlencoded({ extended: false });

 var connections=[];
 var singleConnection = [];

 var connectionDBExports = require('../util/connectionDB.js');
 var connection  = require('../models/connection.js');//requiring connections.js and connectionDb.js for handling data in object format
 var usersDB = require('../util/userDB.js');
  
 var categories;

 var connectionDB = connectionDBExports.connectionDB; 


 router.use('/connections',function(req,res,next){
  
  if(Object.keys(connectionDB)!= 0){
    categories = connectionDB.getcategories();
    try{
      connectionDB.getconnections().then(function(connectionList){
        connections = connectionList;
        next();
      });

    }  
    catch(e){

    }
  }


 });

  router.get('/connections',function(req,res,next){

      var query = req.query; 

      if(Object.keys(query).length != 0){//This part of code handles regular expression checking and making sure that the query id is present in the set of values present with us.
        if('connectionID' in query && regEx(query.connectionID) && connections.some(connection => connection.connectionID === query.connectionID)){
          if(Object.keys(connectionDB)!=0){  
            if(Object.keys(usersDB)!=0){
              connectionDB.getconnection(query.connectionID).then(function(connection){
                  usersDB.getUser(connection.userID).then(function(hostUser){
                  res.render('connection',{connection:connection,user: hostUser})
                  });
                });
              }else{
                res.redirect('/connections'); 
              }        
          }else{
            res.redirect('/connections');
          } 
               
        }else{
          res.render('connections',{connections: connections, categories: categories})
        }
      }else{
        res.render('connections',{connections: connections, categories: categories})
      }
    
  });

  router.post('/newconnection',urlencodedParser,[
        sanitizeBody(['name','details','where','date']).trim(),
       body(['name','details','where','date']).not().isEmpty().withMessage("Fields shouldnt be empty"),
       body('date').custom(date =>{
         if(moment(date,'YYYY-MM-DD').isValid()){
           return true;
         }else{
           return Promise.reject('Invalid Date')
         }
         
       }),

  
  ],function(req,res){//directing to connections when using post method
      
      const errors = validationResult(req);
      if(!errors.isEmpty()){

        console.log(errors.errors)

        return res.render('newconnection',{errrs: errors.errors})

      }

      let  reqbody = req.body;
      let time = "12:00 - 14:00";//hardcoded time
      let imageUrl = '/assets/images/tacos.jpeg';//hardcoded image url
      let newConnectionID = "cc"+Math.floor(Math.random() * (9999-1300) + 1300);//generating random connection id "ex: cc1234"

      let newConnection = connection(newConnectionID,req.session.theUser.userID,reqbody.name,reqbody.details,reqbody.date,time,reqbody.where,reqbody.category,imageUrl)

      connectionDB.addConnection(newConnection).then(function(connection){

        return res.redirect('/connections');


      })  

  });


router.get('/newconnection',function(req,res){
  if(req.session.theUser){
    res.render('newconnection',{errrs:[]});
  }else{
    res.redirect('/profile/savedconnections');
  }
});

router.get('/contact',function(req,res){
  res.render('contact');
});

router.get('/about',function(req,res){
  res.render('about');
});

router.get('/login',function(req,res){
  res.render('login',{errrs: []});
});

router.post('/login',urlencodedParser,[

  sanitizeBody(['username','password']).trim().escape(),

  body('username').custom(username =>{
    
    return usersDB.getPassword(username).then(function(user){
        if(!user){
          return Promise.reject("Enter a valid username");
        }
      
    });

  }),body('password').custom((password, {req}) =>{

    return usersDB.getPassword(req.body.username).then(function(user){
      if(user){
        if(!(user.password === (sha512(password,user.salt).passwordHash))){//validating the password based on salt

          return Promise.reject("Enter a valid password");
      
        }
    }
    }) 
  }),
]

,function(req,res){

    reqBody = req.body;
    reqQuery = req.query;

    const errors = validationResult(req);
    if(!errors.isEmpty()){

      console.log(errors.errors)

      return res.render('login',{errrs: errors.errors})

    }
    if(reqQuery && 'action' in reqQuery){
        if(reqQuery.action === 'signIn' && 'username' in reqBody && 'password' in reqBody){//checking for signIn , username and password parameters.

          return usersDB.getPassword(reqBody.username).then(function(user){

                console.log(user)

                req.session.theUser = user;

                res.redirect('/profile/savedconnections'); 
          });
        }else{

          res.redirect('/login');
        }
    }else{
      res.redirect('/login');
    } 
});

router.get('/signUp',function(req,res){
  res.render('signUp',{errrs: []});
});

router.post('/signUp',urlencodedParser,[

  sanitizeBody(['userName','password','firstName','lastName','email','confirmPassword']).trim().escape(),
  body(['userName','password','firstName','lastName','email','confirmPassword']).not().isEmpty().withMessage("Fields should not be empty"),
  body('email').isEmail().withMessage("Email should be entered in correct format"),
  body('userName').custom(userName =>{
    
    return usersDB.getPassword(userName).then(function(user){
        console.log(user);
        if(user){
          return Promise.reject("Username already taken. Try Another!");
        }
      return true;
    });

  }),body('password').custom((password, {req}) =>{
      console.log(req.body.confirmPassword);

    if(!(password === req.body.confirmPassword)){//checking that both the passwords match.
          return Promise.reject("Password didn't match. Enter the correct password");
    }
    return true;      
       
  }),
]

,function(req,res){

    reqBody = req.body;
    const errors = validationResult(req);
    if(!errors.isEmpty()){

      console.log(errors.errors)

      return res.render('signUp',{errrs: errors.errors})

    }
    var salt = genRandomString(16);//genereting a random salt string
    var password = sha512(reqBody.password,salt);//generating hashed password
    var hashedPassword = password.passwordHash;
    var userName = reqBody.userName;
    var firstName = reqBody.firstName;
    var lastName = reqBody.lastName;
    var email = reqBody.email;
    var userID = "us"+Math.floor(Math.random() * (99-10) + 10);//genrating random userID

    let newUserProfile = {"userID": userID,"userConnections": []};

    let newUser = new user(userID,firstName,lastName,email,userName,hashedPassword,salt);
    console.log(newUser);

    return usersDB.addUser(newUser).then(function(user){//adding the newUser in the users db and userprofiles db

     return userProfilesDB.addUserProfile(newUserProfile).then(function(userProfile){

        req.session.theUser = user;
        console.log(userProfile);

        return res.redirect('/profile/savedconnections');

      })
    })

});

router.post('/connection',function(req,res){
  reqQuery = req.query;

  if(reqQuery && 'action' in reqQuery){

      if(reqQuery.action === 'delete'){

        return connectionDB.deleteConnection(reqQuery.connectionID).then(function(err){//deleting connection

            return usersDB.getAllUsers().then(function(users){
            let userIds = [];
            usersIds = users.map(user => {return user.userID});
            for(let i = 0;i < userIds.length;i++){
              userProfilesDB.removeConnection(reqQuery.connectionID,userIds[i]).then(function(userProfile){
            });
            }

            return res.redirect('/connections');

          })

        })

      }else{

          res.render("editConnection",{connectionID: reqQuery.connectionID,errrs:[]});//rendering to editConnection for editing the connection
      }

  }



})

router.post('/editConnection',urlencodedParser,[//request from editConnection (POST)
  sanitizeBody(['details','where','date']).trim(),//sanitizing the input
 body(['details','where','date']).not().isEmpty().withMessage("Fields shouldnt be empty"),//checking empty fields in the body
 body('date').custom(date =>{
   if(moment(date,'YYYY-MM-DD').isValid()){//date format validation
     return true;
   }else{
     return Promise.reject('Invalid Date')
   }
   
 }),


],function(req,res){//directing to connections when using post method

let reqbody = req.body;


const errors = validationResult(req);
if(!errors.isEmpty()){

  console.log(errors.errors)

  return res.render('editConnection',{connectionID:reqQuery.connectionID,errrs: errors.errors})//rendering the errors

}

console.log(reqbody);

connectionDB.updateConnection(reqbody.connectionID,reqbody.details,reqbody.where,reqbody.date).exec().then(function(connection){//for updating the connections



  res.redirect('/connections?connectionID='+reqbody.connectionID);


})  

});


router.get('/', function(req,res){
 res.render('index');
});



router.get('/*',function(req, res){
	res.render('404');
});

// This function will check if the query connectionID has the correct format.
function regEx(connectionID){
  var regexp = /^cc[0-9]{4}/;
  return regexp.test(connectionID);
};

var genRandomString = function(length){
  return crypto.randomBytes(Math.ceil(length/2))
          .toString('hex') // convert to hexadecimal format
          .slice(0,length);   // return required number of characters
};

var sha512 = function(password, salt){
  var hash = crypto.createHmac('sha512', salt); // Hashing algorithm sha512 
  hash.update(password);
  var value = hash.digest('hex');
  return {
      salt:salt,
      passwordHash:value
  };
};



module.exports = router;
