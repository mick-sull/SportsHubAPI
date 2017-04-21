var express = require("express");
var mysql   = require("mysql");
var bodyParser  = require("body-parser");
var md5 = require('MD5');
var rest = require("./REST.js");
var app  = express();


function REST(){
    var self = this;
    self.connectMysql();
};
/*REST.prototype.connectMysql = function() {
    var self = this;
    var pool      =    mysql.createPool({
        connectionLimit : 100,
        host     : 'localhost',
        user     : 'root',
        password : '',
        database : 'sportshub',
        debug    :  false
    });
    pool.getConnection(function(err,connection){
        if(err) {
          self.stop(err);
        } else {
          self.configureExpress(connection);
        }
    });
}*/

/*var db_config = {
    connectionLimit : 100,
    connectTimeout  : 60 * 60 * 1000,
    aquireTimeout   : 60 * 60 * 1000,
    timeout         : 60 * 60 * 1000,
    host     : 'sportshub.cq2vzkcscpvk.eu-west-1.rds.amazonaws.com',
    user     : 'SportsHubAdmin',
    password : 'mickey123',
    database : 'SportsHub',
    debug    :  false
};*/

var db_config = {
/* connectionLimit : 100,
 host     : 'localhost',
 user     : 'root',
 password : '',
 database : 'sportshub',
 debug    :  false*/
    connectionLimit : 100,
    host     : 'sportshub.cq2vzkcscpvk.eu-west-1.rds.amazonaws.com',
    user     : 'SportsHubAdmin',
    password : 'mickey123',
    database : 'sportshub',
    debug    :  false

};


var connection = mysql.createPool(db_config);
REST.prototype.connectMysql = function() {
    var self = this;

    connection.getConnection(function(err,connection){
        if(err) {
            self.stop(err);
            connection = reconnect(connection);
        } else {
            self.configureExpress(connection);
        }
    });
}





/*REST.prototype.connectMysql = function() {
    var self = this;
    var pool      =    mysql.createPool({
        connectionLimit : 100,
        host     : 'sportshub.cq2vzkcscpvk.eu-west-1.rds.amazonaws.com',
        user     : 'SportsHubAdmin',
        password : 'm123',
        database : 'SportsHub',
        debug    :  false
    });
    pool.getConnection(function(err,connection){
        if(err) {
          self.stop(err);
        } else {
          self.configureExpress(connection);
        }
    });
}*/

function reconnect(connection){
    console.log("\n New connection tentative...");

    //- Create a new one
    connection = mysql_npm.createPool(db_config);

    //- Try to reconnect
    connection.getConnection(function(err){
        if(err) {
            //- Try to connect every 2 seconds.
            setTimeout(reconnect(connection), 2000);
        }else {
            console.log("\n\t *** New connection established with the database. ***")
            return connection;
        }
    });
}


//-
//- Error listener
//-
connection.on('error', function(err) {

    //-
    //- The server close the connection.
    //-
    if(err.code === "PROTOCOL_CONNECTION_LOST"){
        console.log("/!\\ Cannot establish a connection with the database. /!\\ ("+err.code+")");
        return reconnect(connection);
    }

    else if(err.code === "PROTOCOL_ENQUEUE_AFTER_QUIT"){
        console.log("/!\\ Cannot establish a connection with the database. /!\\ ("+err.code+")");
        return reconnect(connection);
    }

    else if(err.code === "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR"){
        console.log("/!\\ Cannot establish a connection with the database. /!\\ ("+err.code+")");
        return reconnect(connection);
    }

    else if(err.code === "PROTOCOL_ENQUEUE_HANDSHAKE_TWICE"){
        console.log("/!\\ Cannot establish a connection with the database. /!\\ ("+err.code+")");
    }

    else{
        console.log("/!\\ Cannot establish a connection with the database. /!\\ ("+err.code+")");
        return reconnect(connection);
    }

});





REST.prototype.configureExpress = function(connection) {
      var self = this;
      app.use(bodyParser.urlencoded({ extended: true }));
      app.use(bodyParser.json());
      var router = express.Router();
      app.use('/api', router);
      var rest_router = new rest(router,connection,md5);
      self.startServer();
}

REST.prototype.startServer = function() {
      app.listen(3000,function(){
          console.log("All right ! I am alive at Port 3000.");
      });
}

REST.prototype.stop = function(err) {
    console.log("ISSUE WITH MYSQL n" + err);
    process.exit(1);
}


new REST();