var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/nbad',{useNewUrlParser: true});

var db = mongoose.connection;

var userProfilesDB = {};

db.on('error',console.error.bind(console,'connection error'))

db.once('open',function(){

    var Schema = mongoose.Schema;

    var userProfileSchema = new Schema({

      userID: String,
      userConnections: [{
          connectionID: String,
          rsvp: String
      }]
  });

    userProfileModel = mongoose.model('userProfile',userProfileSchema);

    userProfilesDB.getUserProfile = function(userID){

        return userProfileModel.findOne({userID: userID}).exec();
    }

    userProfilesDB.addRSVP = function(connectionID,userID,rsvp){

       return userProfileModel.findOne({userID: userID}).then(function(userProfile){

            let userConns = userProfile.userConnections;

            userConns.push({connectionID: connectionID,rsvp:rsvp});

            userProfile.userConnections = userConns;

           return userProfile.save();

        });

    }

    userProfilesDB.updateRSVP = function(connectionID,userID,rsvp){
        return userProfileModel.findOne({userID: userID}).then(function(connections){

                let userConns = connections.userConnections;
                userConns.forEach(userConn => {
                    if(userConn.connectionID === connectionID){
                        userConn.rsvp = rsvp;
                    }
                });
                connections.userConnections = userConns;
                return connections.save();

         });

    }

    userProfilesDB.removeConnection = function(connectionID,userID){
            
        return userProfileModel.findOne({userID: userID}).then(function(connections){

            let userConns = connections.userConnections;
            let removeIndex;

            let userConnectionIds = userConns.map( userConn => {return userConn.connectionID});

            userConnectionIds.forEach(userConnId => {
                if(userConnId === connectionID){
                    removeIndex = userConnectionIds.indexOf(userConnId);  
                
                }
            });

            userConns.splice(removeIndex,1);

            connections.userConnections = userConns;
            return connections.save();

            

        });    
    }

    userProfilesDB.addUserProfile = function(newUserProfile){

        return userProfileModel.create(newUserProfile);
      }


});

module.exports = userProfilesDB;