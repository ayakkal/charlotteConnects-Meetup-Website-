var connection = function(connectionId,userID,topic,details,date,time,place,category,url){
  //javascript object model
  var connectionmodel = {
      connectionID:connectionId,
      userID:userID,
      connectionTopic:topic,
      connectionDetails:details,
      date:date,
      time:time,
      place:place,
      connectionCategory:category,
      imageUrl:url
  };
  return connectionmodel;
}

module.exports = connection;
