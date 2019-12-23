var ArrayList = require('arraylist');
var UserConnection = require('./userConnection.js');
var connection =  require('./connection.js');


class UserProfile{

     constructor(userID,userConnections){
       this._userConnections = userConnections;
       this._userID = userID;
     }

     get userConnections(){
       return this._userConnections;
     }
     set userConnections(userConnections){
       this._userConnections = userConnections;
     }

     get userID(){
       return this._userID;
     }
     set userID(userID){
       this._userID = userID;
     }

     addConnection(connection,rsvp){
        var connExist = false;
        this._userConnections.forEach (userConn => {
          if(userConn._connection.connectionID === connection.connectionID){
            userConn._rsvp = rsvp;
            connExist = true;
          }
        });
        if(!connExist){
           let newConnection = new UserConnection(connection,rsvp);
           this._userConnections.push(newConnection);
        }
        return this._userConnections;
      };

      removeConnection(connection){
        let removeIndex;
          this._userConnections.forEach (userConn => {
            if(userConn._connection.connectionID === connection.connectionID){
                removeIndex = this._userConnections.indexOf(userConn);
            }
          }); // userConnections.map((userConn) => {return userConn.connetion.connectionID}.indexOf(userConn.connectionID))
          this._userConnections.splice(removeIndex,1);
          return this._userConnections;
      };

      updateConnection(userConnection){
          this._userConnections.forEach (userConn => {
              if(userConn.connection.connectionID === userConnection.connection.connectionID){
                userConn._rsvp = userConnection.rsvp;
              }
        });
        return this._userconnections;
      }

      getUserConnections(){
          let connectionsList = new ArrayList;
          this._userConnections.forEach (userConn => {
              connectionsList.add(userConn);
          });
          return connectionsList;
      }

      emptyProfile(){

        this._userConnections = null;
        this._userID = null;

      }

}
module.exports = UserProfile;
