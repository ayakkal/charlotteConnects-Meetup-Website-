var express = require('express');
var router = express.Router();
var passwordHash = require('password-hash');

var connectionDBExports = require('../util/connectionDB.js');
var usersDB = require('../util/userDB.js');
var userProfile = require('../models/userProfile.js');
var UserConnection = require('../models/userConnection.js');
var userProfilesDB = require('../util/userConnectionDB.js');

var connectionDB = connectionDBExports.connectionDB;

var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var userConnList = [];
var userProfileConnectionIds = [];


router.use('/savedconnections',urlencodedParser,function(req,res,next){//middleware function to be executed every time savedconnecions is called.
  let userProm;

  if(Object.keys(usersDB)!=0 & Object.keys(userProfilesDB)!=0 & Object.keys(connectionDB)!=0 ){ 
    if(req.session.theUser){
        userProm = usersDB.getUser(req.session.theUser.userID); 
        userProm.then(function(user){
          

          req.session.theUser = user;

          userProfilesDB.getUserProfile(user.userID).then(function(userProfile){//geting the userprofile based on userID
           
          if(userProfile.userConnections){  
            
            userProfileConnectionIds = userProfile.userConnections.map( userConn => {return userConn.connectionID}); //seperating connectionIDs into a differernt array

              Promise.all(userProfileConnectionIds.map(userProfileConnIDs => { return connectionDB.getconnection(userProfileConnIDs)})).then(function(connections){//resloving all the promises.
                userConnList = [];

                  for(var i=0; i< connections.length;i++){

                    userConnList.push(new UserConnection(connections[i],userProfile.userConnections[i].rsvp));//pushing the exisitng connections for the user into an array 

                  }
                  userConnList = userConnList.filter(userConn => { return userConn.connection != null});                
                  next();

            });

          }

          });

        });

    } else{
      res.render('login',{errrs: []});
    }
  }     

});




router.all('/savedconnections',urlencodedParser,function(req,res,next){// called for every post and get request

        reqBody = req.body;
        reqQuery = req.query;
        let connectionIDsList = userConnList.map( userConn => {return userConn.connection.connectionID});
        let actions = ['save','updateProfile','delete','signout'];
        if(reqQuery && 'action' in reqQuery && actions.includes(reqQuery['action'])){

            if(reqQuery.action == 'signout'){
              req.session.destroy();
              res.redirect('/');
            }else {

                if(reqBody && 'viewConnections' in reqBody && reqBody['viewConnections']){
                     let viewConnections = reqBody.viewConnections.split(',');
                     let validateConnID = viewConnections.every (connectionID => {
                       return String(connectionID).match('^cc[0-9]{4}')//matches the connection ID format
                     });

                     if('connectionID' in reqQuery && viewConnections.includes(reqQuery['connectionID']) && validateConnID){

                          let rsvpList = ['Yes','No','Maybe'];
                          let updatedUserConnections;
                          let userConnectionObject =  new userProfile(req.session.theUser.userID,userConnList);
                          if(reqQuery.action === 'save'){
                              if('rsvp' in reqQuery && rsvpList.includes(reqQuery['rsvp']) ){

                                  let connectionExists = false;
                                  userConnList.forEach(userConn => {
                                    if(userConn.connection.connectionID === reqQuery.connectionID){
                                      connectionExists = true;
                                    }
                                  });
                                  if(connectionExists){
                                    userProfilesDB.updateRSVP(reqQuery.connectionID,req.session.theUser.userID,reqQuery.rsvp).then(function(userProfile){});                                    
                                  }else{
                                    userProfilesDB.addRSVP(reqQuery.connectionID,req.session.theUser.userID,reqQuery.rsvp).then(function(userProfile){});                                    
                                  }
                              }
                              return res.redirect('/profile/savedconnections');
                          }
                          else if (reqQuery.action === 'updateProfile'){
                                    if(connectionIDsList.includes(reqQuery.connectionID)){//checking connection and updating the render accordingly
                                      connectionDB.getconnection(reqQuery.connectionID).then(function(connection){
                                        usersDB.getUser(connection.userID).then(function(hostUser){
                                          console.log(connection);
                                          res.render('connection',{connection:connection,user: hostUser})
                                          });
                                        });
                                    }else{
                                      res.redirect('/profile/savedconnections');
                                    }

                          }
                          else if (reqQuery.action === 'delete') {//deleting the connection based on connectionID
                                    if(connectionIDsList.includes(reqQuery.connectionID)){
                                      userProfilesDB.removeConnection(reqQuery.connectionID,req.session.theUser.userID).then(function(userPorfile){});
                                      res.redirect('/profile/savedconnections');
                                    }
                          }
                      }
                     else {
                      res.redirect('/profile/savedconnections');
                      }

                   }
                 }
        }else{
          res.render('savedconnections', {userConnList:userConnList, user: req.session.theUser });
        }

    
    });



    module.exports = router;
