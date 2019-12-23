

class User{

    constructor(userID,firstName,lastName,email,userName,password,salt){
          this.userID = userID;
          this.firstName = firstName;
          this.lastName = lastName;
          this.email = email;
          this.userName = userName;
          this.password = password;
          this.salt = salt;
    } 
}
module.exports = User;
