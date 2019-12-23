var user  = require("../models/user.js");

var mongoose = require("mongoose");

mongoose.connect('mongodb://localhost/nbad',{useNewUrlParser: true});

var db = mongoose.connection;
var usersDB = {};

db.on('error',console.error.bind(console,'connection error'))

db.once('open',function(){

  var Schema = mongoose.Schema;

  var userSchema = new Schema({

      userID: String,
      firstName:String,
      lastName: String,
      email: String,
      userName: String,
      password:String,
      salt:String
  })

  userModel = mongoose.model('user',userSchema);

  usersDB.getAllUsers = function(){

    return userModel.find().exec();

  };

  usersDB.getUser = function(userID){

    return userModel.findOne({userID: userID}).exec();

  };

  usersDB.getPassword = function(userName){

    return userModel.findOne({userName: userName}).exec();

  };

  usersDB.addUser = function(newUser){

    return userModel.create(newUser);
  }

});

 module.exports= usersDB;
