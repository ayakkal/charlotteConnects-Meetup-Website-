
class UserConnection{

        constructor(connection,rsvp){
          this._connection = connection;
          this._rsvp = rsvp;
        }

      get connection(){
        return this._connection;
      }
      set connection(connection){
        this._connection = connection;
      }


      get rsvp(){
        return this._rsvp;
      }
      set rsvp(rsvp){
        this._rsvp = rsvp;
      }

}

module.exports = UserConnection;
