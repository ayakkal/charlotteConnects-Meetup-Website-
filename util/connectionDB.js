var connection  = require("../models/connection.js");
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/nbad',{useNewUrlParser: true})

var db = mongoose.connection;
var connectionDB={};

let connectionModel;

db.on('error',console.error.bind(console,'connection error'))

db.once('open', function() {

  var Schema = mongoose.Schema;

  var connectionsSchema  = new Schema({

    connectionID: String,
    userID: String,
    connectionTopic: String,
    connectionDetails: String,
    date: String,
    time: String,
    place: String,
    connectionCategory: String,
    imageUrl: String,

  });
  
  console.log('DB connected');

  connectionModel = mongoose.model('connection',connectionsSchema);
  let categories = ['SOCIAL','ADVENTURES'];

connectionDB.getconnections = function(){
  //used for handling all the connections together i.e. connections.ejs
  return connectionModel.find().exec();

};

connectionDB.getconnection = function(connectionID){
  //used for handling single connection i.e. connection.ejs
  return connectionModel.findOne({connectionID: connectionID}).exec();

}
connectionDB.getcategories = function(){
  return categories;
}

connectionDB.addConnection = function(newConnection){

  return connectionModel.create(newConnection);
}

connectionDB.deleteConnection = function(connectionId){

  return connectionModel.deleteOne({connectionID: connectionId});

}

connectionDB.updateConnection = function(connID,details,location,dte){

  let updatedConnection = {connectionDetails: details,place: location,date: dte}

  return connectionModel.updateOne({connectionID: connID},updatedConnection,{upsert: false, new: true,runValidators: true})  
}

});
 
module.exports= {
  connectionDB,
  connectionModel
}
