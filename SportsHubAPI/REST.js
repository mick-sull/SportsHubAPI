var mysql = require("mysql");
var notification = require("./node_notification.js");

function REST_ROUTER(router, connection, md5) {
    var self = this;
    self.handleRoutes(router, connection, md5);
}
//console.log(JSON.stringify(rows, null, 2)); display json to console

REST_ROUTER.prototype.handleRoutes = function (router, connection, md5) {
    router.get("/", function (req, res) {

    });

    const util = require('util');

    /*    router.post("/sport",function(req,res){


     SELECT b.user_id, a.userFullName, a.userProfileUrl, a.attendances, a.failed_attendances FROM user a, event_attendee b WHERE b.event_id = 28 AND b.user_id = a.user_id AND b.approved = 1

     });*/
    router.get("/sport", function (req, res) {
        var query = "SELECT * FROM ??";
        var table = ["sport"];
        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                res.json({"Error": true, "Message": "Error executing MySQL query"});
            } else {
                res.json({"Error": false, "Message": "Success", "Sport": rows});
            }
        });
    });

    router.get("/users", function (req, res) {
        var query = "SELECT * FROM ??";
        var table = ["user"];
        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                res.json({"Error": true, "Message": "Error executing MySQL query"});
            } else {
                res.json({"Error": false, "Message": "Success", "User": rows});
            }
        });
    });


    router.post("/users/new", function (req, res) {
        var query = "INSERT INTO ??(??,??,??,??) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE user_id= user_id;";
        var table = ["user", "user_id", "userFullName", "userProfileUrl", "userToken", req.body.user_id, req.body.userFullName, req.body.userProfileUrl, req.body.userToken];
        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                res.json({"Error": true, "Message": "Error executing MySQL query"});
                //result = "Error : Fail";
                console.log("Error : Fail: " + err);
                //res.send()
            } else {
                res.json({"Error": false, "Message": "User Added !"});
                //result = "Success : Sport Added";
                console.log("Success : User Added");
            }
        });
    });


    router.get("/user/:user_id", function (req, res) {//get a single user
        var query = "SELECT * FROM ?? WHERE ?? =?";
        var table = ["view_user", "user_id", req.query.user_id];
        query = mysql.format(query, table);
        var eventsRow = [];
        var locationRow = [];
        connection.query(query, function (err, rows) {
            if (err) {
                res.json({"Error": true, "Message": "Error executing MySQL query"});
                //result = "Error : Fail";
                console.log("Error : Fail: " + err);
                //res.send()
            } else {
                //res.json({"Error" : false, "Message" : "User Added !"});
                //result = "Success : Sport Added";
                //res.json({"Error" : false, "Message" : "User attended no events", "Event" : eventsRow, "User" : rows, "Location" : locationRow});//some of these will be null
                res.json({
                    "Error": false,
                    "Message": "Success",
                    "Event": eventsRow,
                    "User": rows,
                    "Location": locationRow
                });
            }
        });
    });

    router.post("/user/updateToken", function (req, res) {
        var query = "UPDATE user SET userToken= ? WHERE user_id = ?";
        var table = [req.body.userToken, req.body.user_id];
        query = mysql.format(query, table);
        console.log("updateToken : token: " + req.body.userToken + " user_id: " + req.body.user_id);
        connection.query(query, function (err, rows) {
            if (err) {
                res.json({"Error": true, "Message": "Error executing MySQL query"});
                //result = "Error : Fail";
                console.log("Error : Fail: " + err);
                //res.send()
            } else {
                //res.json({"Error" : false, "Message" : "User Added !"});
                //result = "Success : Sport Added";
                //res.json({"Error" : false, "Message" : "User attended no events", "Event" : eventsRow, "User" : rows, "Location" : locationRow});//some of these will be null
                res.json({
                    "Error": false,
                    "Message": "Token Updated..", /*"Event" : eventsRow, "User" : rowsN, "Location" : locationRow*/
                });
            }
        });
    });


    router.get("/user/details/:user_id", function (req, res) {
        console.log("1..........USER PROFILE DETAILS");
        var query = "SELECT * FROM ?? WHERE ?? =?";
        var table = ["view_user", "user_id", req.query.user_id];
        query = mysql.format(query, table);
        var userRow;
        var eventsRow;
        var locationRow;
        connection.query(query, function (err, rows) {//getting an error here
            if (err) {
                console.log(err);
                res.json({"Error": true, "Message": "Error executing MySQL query"});
            } else {
                //res.json({"Error" : false, "Message" : "Success", "Event" : rows});
                userRow = rows;
                console.log("USER:" + userRow);
                var query = "SELECT a.appearance, b.* FROM event_attendee a, event b WHERE a.user_id = ? and b.event_id = a.event_id ORDER by b.event_date DESC, b.event_time DESC";
                var table = [req.query.user_id];
                query = mysql.format(query, table);
                connection.query(query, function (err, rows) {
                    if (err) {
                        res.json({"Error": true, "Message": "Error executing MySQL query"});
                        console.log(err);
                    } else {
                        eventsRow = rows;
                        if (eventsRow.length > 0) {//Check if there is at least one valid location_id
                            console.log("Code Still executing...");
                            var locationIDs = [];
                            //Loop through the events for all the location ids. No need for duplicate ids.
                            for (var i = 0; i < eventsRow.length; i++) {
                                var row = eventsRow[i].location_id;
                                console.log("Location ID: " + i + " " + eventsRow[i].location_id);
                                if (locationIDs.indexOf(eventsRow[i].location_id) > -1) {
                                    //Already in the array
                                    console.log("NOT Added to array");
                                }
                                else {
                                    locationIDs.push(eventsRow[i].location_id);
                                    console.log("Added to array");
                                }

                            }
                            var query = "SELECT * FROM location WHERE location_id IN (" + locationIDs.join() + ")";
                            var table = [];
                            query = mysql.format(query, table);
                            connection.query(query, function (err, rows) {
                                if (err) {
                                    res.json({"Error": true, "Message": "Error executing MySQL query"});
                                    console.log(err);
                                } else {
                                    locationRow = rows;
                                    res.json({
                                        "Error": false,
                                        "Message": "Success",
                                        "Event": eventsRow,
                                        "User": userRow,
                                        "Location": locationRow
                                    });

                                }
                            });
                        }
                        else {
                            locationRow = [];
                            console.log("2..........USER PROFILE DETAILS");
                            console.log(JSON.stringify(eventsRow, null, 2));
                            console.log(JSON.stringify(userRow, null, 2));
                            console.log(JSON.stringify(locationRow, null, 2));
                            res.json({
                                "Error": false,
                                "Message": "User attended no events",
                                "Event": eventsRow,
                                "User": userRow,
                                "Location": locationRow
                            });

                        }
                    }
                });


            }
        });
    });

    router.get("/event/getOrganizedEvents", function (req, res) {
        var eventsRow;
        var query = "SELECT * FROM event WHERE creator_user_id = ?";
        var table = [req.query.user_id];
        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                res.json({"Error": true, "Message": "Error executing MySQL query"});
                console.log(err);
            } else {
                eventsRow = rows;
                if (eventsRow.length > 0) {//Check if there is at least one valid location_id
                    console.log("Code Still executing...");
                    var locationIDs = [];
                    //Loop through the events for all the location ids. No need for duplicate ids.
                    for (var i = 0; i < eventsRow.length; i++) {
                        var row = eventsRow[i].location_id;
                        if (locationIDs.indexOf(eventsRow[i].location_id) > -1) {
                            //Already in the array
                            console.log("NOT Added to array");
                        }
                        else {
                            locationIDs.push(eventsRow[i].location_id);
                            console.log("Added to array");
                        }
                    }
                    var query = "SELECT * FROM location WHERE location_id IN (" + locationIDs.join() + ")";
                    var table = [];
                    query = mysql.format(query, table);
                    connection.query(query, function (err, rows) {
                        if (err) {
                            res.json({"Error": true, "Message": "Error executing MySQL query"});
                            console.log(err);
                        } else {
                            console.log("1/event/getOrganizedEvents");
                            console.log(JSON.stringify(eventsRow, null, 2));
                            locationRow = rows;
                            res.json({
                                "Error": false,
                                "Message": "Success",
                                "Event": eventsRow,
                                "Location": locationRow
                            });
                        }
                    });
                }
                else
                    {   console.log("2 /event/getOrganizedEvents");
                        console.log(JSON.stringify(eventsRow, null, 2));
                        locationRow = [];
                        res.json({
                            "Error": false,
                            "Message": "User attended no events",
                            "Event": eventsRow,
                            "Location": locationRow
                        });

                    }
                }
        });
    });



    router.get("/user/friends/:user_id", function (req, res) {

        //SELECT a.status, b.* FROM relationship a, user b WHERE (a.user_id = "rssrroIVfAW9v3ND4irDq7kCNKO2" and b.user_id = a.user_two_id) or (a.user_two_id = "rssrroIVfAW9v3ND4irDq7kCNKO2" and b.user_id = a.user_id)
        var query = "SELECT a.status, a.action_user_id, b.* FROM relationship a, user b WHERE (a.user_id = ? and b.user_id = a.user_two_id) or (a.user_two_id = ? and b.user_id = a.user_id) ORDER BY a.status ASC";
        //var query = "SELECT * FROM ?? WHERE ?? = ? or ?? = ?";
        //var table = ["relationship", "user_id", "user_id","user_id", req.query.user_id, req.query.user_id];
        //var table = [req.params.user_id, req.params.user_id];
        var table = [req.query.user_id, req.query.user_id];
        console.log("Getting Friends List...");
        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                res.json({"Error": true, "Message": "Error executing MySQL query1"});
                console.log(err);
            } else {
                res.json({"Error": false, "Message": "Success", "User": rows});
            }
        });
        //connection.close();
    });

    router.get("/user/individual/", function (req, res) {

        //SELECT a.status, b.* FROM relationship a, user b WHERE (a.user_id = "rssrroIVfAW9v3ND4irDq7kCNKO2" and b.user_id = a.user_two_id) or (a.user_two_id = "rssrroIVfAW9v3ND4irDq7kCNKO2" and b.user_id = a.user_id)
        var query = "SELECT a.status, a.action_user_id, b.* FROM relationship a, user b WHERE (a.user_id = ? and b.user_id = a.user_two_id) or (a.user_two_id = ? and b.user_id = a.user_id) ORDER BY a.status ASC";
        //var query = "SELECT * FROM ?? WHERE ?? = ? or ?? = ?";
        //var table = ["relationship", "user_id", "user_id","user_id", req.query.user_id, req.query.user_id];
        //var table = [req.params.user_id, req.params.user_id];
        var table = [req.query.user_id, req.query.user_id];
        console.log("Getting Friends List...");
        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                res.json({"Error": true, "Message": "Error executing MySQL query1"});
                console.log(err);
            } else {
                res.json({"Error": false, "Message": "Success", "User": rows});

                for (var i = 0; i < rows.length; i++) {
                    var row = rows[i];
                    console.log(row.action_user_id);
                }

            }
        });
    });




    router.post("/user/friends/request", function (req, res) {
        var query = "INSERT INTO ??(??,??,??,??) VALUES (?,?,?,?);";
        var table = ["relationship", "user_id", "user_two_id", "status", "action_user_id", req.body.user_id, req.body.user_two_id, req.body.status, req.body.action_user_id];
        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                //res.json({"Error" : true, "Message" : "Error executing MySQL query"});
                //result = "Error : Fail";
                console.log("Error : Fail: " + err);

            } else {
                //res.json({"Error" : false, "Message" : "Friend request sent..."});
                //result = "Success : Sport Added";
                console.log("Success : Friendship Request.");
                sendFriendRequest(req, res, req.body.user_two_id, req.body.user_id);
            }
        });
    });


    router.get("/user/friends/friendshipStatus/:user_id", function (req, res) {
        var query = "SELECT user_id,user_two_id,status,action_user_id FROM relationship WHERE (user_id = ?) or (user_two_id = ?)";
        //var table = [req.params.user_id, req.params.user_id];
        var table = [req.query.user_id, req.query.user_id];
        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                res.json({"Error": true, "Message": "Error executing MySQL query"});
                //result = "Error : Fail";
                console.log("Error : Fail: " + err);

            } else {
                res.json({"Error": false, "Message": "Success", "Friendship": rows});
                //result = "Success : Sport Added";
                console.log("Success : Friendship Status.");
            }
        });
    });


    router.post("/user/friends/response", function (req, res) {
        //var query = "UPDATE relationship SET status=?, action_user_id=? WHERE user_id = ? AND user_two_id = ?";
        var query = "UPDATE relationship SET status=?, action_user_id=?WHERE (user_id = ? and user_two_id = ?) OR (user_id = ? and user_two_id =?)";
        //UPDATE relationship SET status = 2 WHERE (user_id = "6P46jL6ae9Ub1GHksOIXU4XsLTk1" and user_two_id = "fXToGmox25Y6JZwXTr1CPNdCoho1") OR (user_id = "fXToGmox25Y6JZwXTr1CPNdCoho1" and user_two_id ="6P46jL6ae9Ub1GHksOIXU4XsLTk1")
        var table = [req.body.status, req.body.action_user_id, req.body.user_id, req.body.user_two_id, req.body.user_two_id, req.body.user_id];
        query = mysql.format(query, table);
        console.log("Friendship created. Status: " + req.body.status);
        connection.query(query, function (err, rows) {
            if (err) {
                res.json({"Error": true, "Message": "Error executing MySQL query"});
                //result = "Error : Fail";
                console.log("Error : Fail: " + err);

            } else {
                res.json({"Error": false, "Message": "Now friends..."});
                //result = "Success : Sport Added";
                console.log("Success : Friendship created.");
            }
        });
    });


    router.get("/user/chat/:user_id", function (req, res) {
        var query = "SELECT chat_id FROM conversations WHERE chat_id LIKE " + connection.escape('%' + req.query.user_id + '%');
        query = mysql.format(query);
        connection.query(query, function (err, rows) {
            if (err) {
                res.json({"Error": true, "Message": "Error executing MySQL query"});
                console.log("Error : Fail: " + err);

            } else {versation
                res.json({"Error": false, "Message": "Success", "Conversations": rows});
                console.log("Error : Fail: " + err);
            }
        });
    });


    router.get("/sport/:sport_id", function (req, res) {
        var query = "SELECT * FROM ?? WHERE ??=?";
        var table = ["sport", "sport_id", req.params.sport_id];
        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                res.json({"Error": true, "Message": "Error executing MySQL query"});
            } else {
                res.json({"Error": false, "Message": "Success", "Sport": rows});
            }
        });
    });

    router.post("/sport/new", function (req, res) {
        //res.send('Got a PUT request at /user');
        var query = "INSERT INTO ??(??,??) VALUES (?,?)";
        //console.log("Sport Name = "+req.body.sport.Name+", User ID "+req.body.userID);
        console.log("Sport Name = " + req.body.sport_name);
        var keyName = req.body;
        console.log(keyName);
        var table = ["sport", "sport_name", "user_id", req.body.sport_name, req.body.user_id];
        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                res.json({"Error": true, "Message": "Error executing MySQL query"});
                //result = "Error : Fail";
                console.log("Error : Fail: " + err);
                //res.send()
            } else {
                res.json({"Error": false, "Message": "User Added !"});
                //result = "Success : Sport Added";
                console.log("Success : Sport Added");
            }
        });
    });

    router.get("/location", function (req, res) {
        var query = "SELECT * FROM ??";
        var table = ["location"];
        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                res.json({"Error": true, "Message": "Error executing MySQL query"});
            } else {
                res.json({"Error": false, "Message": "Success", "Location": rows});
            }
        });
    });


    router.post("/location/new", function (req, res) {
        //res.send('Got a PUT request at /user');
        var query = "INSERT INTO location(location_id, location_name, longitude, latitude, address1, address2, address3, user_id) VALUES (null,?,?,?,?,?,?,?)";
        //console.log("Sport Name = "+req.body.sport.Name+", User ID "+req.body.userID);
        console.log("Sport Name = " + req.body.sport_name);
        var keyName = req.body;
        console.log(keyName);
        var table = [req.body.location_name, req.body.longitude,req.body.latitude, req.body.address1,req.body.address2, req.body.address3, req.body.user_id];
        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                res.json({"Error": true, "Message": "Error executing MySQL query"});
                //result = "Error : Fail";
                console.log("Error : Fail: " + err);
                //res.send()
            } else {
                res.json({"Error": false, "Message": rows.insertId});
                //result = "Success : Sport Added";
                //console.log("Success : Sport Added");
                //rows.insertId
            }
        });
    });

    router.get("/location/id/", function (req, res) {
        console.log("/location/id/");
        var query = "SELECT * FROM location WHERE location_id = ?";
        console.log(req.query.location_id);
        var table = [req.query.location_id];
        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                res.json({"Error": true, "Message": "Error executing MySQL query"});
            } else {
                res.json({"Error": false, "Message": "Success", "Location": rows});
            }
        });
    });

    router.get("/event", function (req, res) {
        var query = "SELECT * FROM ??";
        var table = ["event"];
        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                res.json({"Error": true, "Message": "Error executing MySQL query"});
            } else {
                res.json({"Error": false, "Message": "Success", "Event": rows});
            }
        });
    });

    router.post("/event/new", function (req, res) {
        var query = "INSERT INTO ??(??, ??, ??, ??, ??, ??, ??, ??, ??, ??, ??, ?? ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        var keyName = req.body;
        console.log(keyName);
        var table = ["event", "event_name", "location_id", "creator_user_id", "event_date", "event_time", "sport_id", "no_space", "space_left", "duration", "gender", "cost", "public_game",
            req.body.event_name, req.body.location_id, req.body.creator_user_id, req.body.event_date, req.body.event_time, req.body.sport_id, req.body.no_space, req.body.space_left, req.body.duration, req.body.gender, req.body.cost, req.body.public_game];

        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                res.json({"Error": true, "Message": "Error executing MySQL query"});
                console.log("Error : Fail: " + err);
                //res.send()
            } else {
                res.json({"Error": false, "Message": "Event Added !"});
                //result = "Success : Sport Added";
                console.log("Success : Event Added");
                console.log(rows.insertId);
                sendEventRequest(req, res, req.body.creator_user_id, req.body.friends_invited, rows.insertId);
            }
        });
    });


    router.post("/event/update", function (req, res) {
        var query = "UPDATE event SET public_game = ? WHERE event_id = ?;";
        var keyName = req.body;
        console.log(keyName);
        var table = [req.body.public_game, reg.bod.event_id];

        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                res.json({"Error": true, "Message": "Error executing MySQL query"});
                console.log("Error : Fail: " + err);
                //res.send()
            } else {
                res.json({"Error": false, "Message": "Event updated.... !"});

            }
        });
    });

    router.post("/event/search", function (req, res) {
        /* SELECT * FROM SportsHub.event where location_id = 1 and event_date = '2017-01-19' and event_time between '12:00' and '19:00'and sport_id = 4;*/
        //var query = "SELECT * FROM ?? WHERE ?? = ? and ?? = ? and ?? between ? and ? and ?? = ?";
        var query = "SELECT * FROM ?? where location_id = ? and event_date = ? and event_time between ? and ? and sport_id = ?";
        var keyName = req.body;
        console.log(keyName);
        var table = ["event", req.body.location_id, req.body.search_date, req.body.time_min, req.body.time_max, req.body.sport_id];
        /*var table = ["event", "location_id","event_date","event_time", "sport_id",
         req.body.location_id, req.body.search_date, req.body.time_min, req.body.time_max, req.body.sport_id];*/

        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                res.json({"Error": true, "Message": "Error executing MySQL query"});
                console.log("Error : Fail: " + err);
                //res.send()
            } else {
                res.json({"Error": false, "Message": "Success", "Event": rows});
                //result = "Success : Sport Added"
                console.log("Success : Event Found" + rows);
            }
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                console.log(row.event);
            }
        });
    });


    router.get("/event/details/:event_id", function (req, res) {

        var query = "SELECT a.user_id, a.userFullName, a.userProfileUrl, a.attendances, a.failed_attendances FROM view_user a, event e where (e.event_id = ? and e.creator_user_id = a.user_id)";
        var table = [req.query.event_id];
        var organizer;
        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                console.log("Error : Fail: " + err);
            } else {
                organizer = rows;
                var eventQuery = "SELECT * FROM ?? WHERE ??=?";
                var eventTable = ["event", "event_id", req.query.event_id];
                //var eventTable = ["event","event_id",req.params.event_id];
                //var eventTable = ["event","event_id",28];
                const util = require('util')
                var eventRow;
                var errorFound = false;
                console.log("Event ID: " + req.query.event_id);
                eventQuery = mysql.format(eventQuery, eventTable);
                connection.query(eventQuery, function (err, rows) {
                    var eventRow;
                    var attendanceRow;
                    if (err) {
                        //res.json({"Error" : true, "Message" : "Error executing MySQL Event Query"});
                        errorFound = true;
                        console.log("Error executing MySQL Event Query");

                    } else {
                        //res.json({"Error" : false, "Message" : "Success", "Event" : rows});
                        eventRow = rows;
                        //var attQuery = "SELECT * FROM ?? WHERE ??=?";
                        //var attQuery = "SELECT b.user_id, a.userFullName, a.userProfileUrl, a.attendances, a.failed_attendances FROM view_user a, event_attendee b WHERE b.event_id = ? AND b.user_id = a.user_id AND b.approved IN (1,2)";
                        var attQuery = "SELECT b.user_id, a.userFullName, a.userProfileUrl, a.attendances, a.failed_attendances FROM view_user a, event_attendee b WHERE b.event_id = ? AND b.user_id = a.user_id AND b.approved IN (1,2)";
                        //+"UNION SELECT a.user_id, a.userFullName, a.userProfileUrl, a.attendances, a.failed_attendances FROM view_user a, event_attendee b, event e WHERE (e.event_id = ? and e.creator_user_id = a.user_id)";
                        var attTable = [req.query.event_id];
                        console.log("Event ID: " + req.query.event_id);
                        //var attTable = ["event_id",req.params.event_id];
                        var attRow;
                        eventQuery = mysql.format(attQuery, attTable);
                        connection.query(eventQuery, function (err, rows) {
                            if (err) {
                                //res.json({"Error" : true, "Message" : "Error executing MySQL Event Query"});
                                errorFound = true;
                                console.log("Error executing MySQL attendance Query");

                            } else {
                                //res.json({"Error" : false, "Message" : "Success", "Event" : rows});
                                attendanceRow = rows;
                                console.log(util.inspect(attendanceRow, false, null))
                                //res.json({"Error" : false, "Message" : "Success", "Event" : eventRow, "Attendee" : rows});
                                var locQuery = "SELECT * FROM ?? WHERE ??=?";
                                var locTable = ["location", "location_id", eventRow[0].location_id];
                                console.log(eventRow[0].location_id);
                                var locRow;
                                locQuery = mysql.format(locQuery, locTable);
                                connection.query(locQuery, function (err, rows) {
                                    if (err) {
                                        //res.json({"Error" : true, "Message" : "Error executing MySQL Event Query"});
                                        //errorFound = true;
                                        console.log(err);
                                        res.json({"Error": true, "Message": "Error executing MySQL query"});

                                    } else {
                                        //res.json({"Error" : false, "Message" : "Success", "Event" : rows});
                                        locRow = rows;
                                        //console.log("attendance");

                                        /*console.log(util.inspect(eventRow, false, null))
                                         console.log(util.inspect(attendanceRow, false, null))
                                         console.log(util.inspect(locRow, false, null))*/
                                        res.json({
                                            "Error": false,
                                            "Message": "Success",
                                            "Event": eventRow,
                                            "Organizer": organizer,
                                            "User": attendanceRow,
                                            "Location": locRow
                                        });
                                        for (var i = 0; i < locRow.length; i++) {
                                            var row = rows[i];
                                            //console.log(row);
                                        }
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });

    });

    //Remove a user from an event
    //Chnage this to update instead of deleting the record. Changed the approved to -1
    router.post("/event/removeAttendee", function (req, res) {
        var query = "DELETE	FROM event_attendee WHERE user_id = ? AND event_id	= ? ";
        var table = [req.body.user_id, req.body.event_id];
        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                res.json({"Error": true, "Message": "Error executing MySQL query"});
            } else {
                var query = "UPDATE event SET space_left= space_left +1 WHERE event_id = ?;";
                var table = [req.body.event_id];
                query = mysql.format(query, table);
                connection.query(query, function (err, rows) {
                    if (err) {
                        console.log(err);
                        res.json({"Error": true, "Message": "Error executing MySQL query"});
                    } else {
                        res.json({"Error": false, "Message": "Success Attendee Removed"});
                    }
                });
            }
        });
    });


    router.post("/event/addAttendee", function (req, res) {
        // var query = "INSERT	INTO event_attendee WHERE user_id = ? AND event_id	= ? ";
        var query = "INSERT INTO ??(??, ??, ??) VALUES (?, ?, 2);";
        var table = ["event_attendee", "user_id", "event_id", "approved", req.body.user_id, req.body.event_id];
        console.log("Event ID: " + req.body.event_id);
        console.log("user ID: " + req.body.user_id);
        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                console.log(err);
                res.json({"Error": true, "Message": "Error executing MySQL query"});
            } else {

                var query = "UPDATE event SET space_left= space_left -1 WHERE event_id = ?;";
                var table = [req.body.event_id];
                query = mysql.format(query, table);
                connection.query(query, function (err, rows) {
                    if (err) {
                        console.log(err);
                        res.json({"Error": true, "Message": "Error executing MySQL query"});
                    } else {
                        res.json({"Error": false, "Message": "Success Attendee Added"});
                    }
                });
            }
        });
    });



    /********************************************************
     GROUPS
     ********************************************************    */

    router.get("/group/groups/:user_id", function (req, res) {
    //router.post("/group/groups/", function (req, res) {
        //SELECT a.group_id, a.group_name FROM groups a, user_group b WHERE (b.user_id = "fXToGmox25Y6JZwXTr1CPNdCoho1" AND b.user_group_id = a.group_id)
        // var query = "INSERT	INTO event_attendee WHERE user_id = ? AND event_id	= ? ";
        //var query = "SELECT a.group_id, a.group_name FROM groups a, user_group b, user c WHERE b.user_id = ? AND c.user_id =?";
        var query = "SELECT a.group_id, a.group_name FROM groups a, user_group b WHERE (b.user_id = ? AND b.group_id  = a.group_id AND b.active = 0)";
        var table = [req.query.user_id, req.query.user_id];
        console.log("user ID: " + req.query.user_id);
        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                console.log(err);
                res.json({"Error": true, "Message": "Error executing MySQL query"});
            } else {
                console.log(JSON.stringify(rows, null, 2));
                res.json({
                    "Error": false,
                    "Message": "Success",
                    "Group": rows
                });
            }
        });
    });

    //SELECT u.*, r.status FROM user u, user_group g, relationship r WHERE( (r.user_id = "fXToGmox25Y6JZwXTr1CPNdCoho1" and u.user_id = r.user_two_id AND r.status = 2 AND r.user_two_id NOT IN (SELECT g.user_id FROM user_group) AND g.group_id = 24) or (r.user_two_id = "fXToGmox25Y6JZwXTr1CPNdCoho1" and u.user_id = r.user_id AND r.status = 2 AND r.user_id NOT IN (SELECT g.user_id FROM user_group)) AND g.group_id = 24)
    //var query = "SELECT a.group_name, b.user_id, c.userFullName, c.userProfileUrl FROM groups a, user_group b, user c  WHERE b.group_id = ? and b.user_id = c.user_id;";

    //router.post("/group/new", function (req, res) {
    router.get("/group/groups/new/:group_name", function (req, res) {
        console.log("/group/new/:group_name");
        var query = "INSERT INTO groups(group_id, group_name) VALUES (null,?)";
        var table = [req.query.group_name];
        var newGroupID = 0;
        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                res.json({"Error": true, "Message": "Error executing MySQL query"});
                console.log("Error : Fail: " + err);
                //res.send()
            } else {
                newGroupID = rows.insertId;

                var query = "INSERT INTO user_group(user_group_id, group_id, user_id) VALUES (null,?,?)";
                var table = [newGroupID, req.query.user_id];
                console.log("user ID: " + req.query.user_id);
                console.log("newGroupID: " + newGroupID);
                query = mysql.format(query, table);
                connection.query(query, function (err, rows) {
                    if (err) {
                        console.log(err);
                        //res.json({"Error": true, "Message": "Error executing MySQL query"});
                    } else {
                        console.log(JSON.stringify(rows, null, 2));

                        var query = "SELECT * FROM groups WHERE group_id =?";
                        var table = [newGroupID];
                        query = mysql.format(query, table);
                        connection.query(query, function (err, rows) {
                            if (err) {
                                console.log(err);
                                res.json({"Error": true, "Message": "Error executing MySQL query"});
                            } else {
                                console.log(JSON.stringify(rows, null, 2));
                                res.json({
                                    "Error": false,
                                    "Message": "Success",
                                    "Group": rows
                                });
                            }


                        });
                    }
                });
            }
        });
    });

    //Get users that the current user is friend with but isnt in the group.
    router.get("/group/invite/", function (req, res) {
        console.log("group invite called");
        var query = "SELECT DISTINCT  u.*, r.status FROM user u, user_group g, relationship r WHERE((r.user_id = ? and u.user_id = r.user_two_id AND r.status = 1 AND r.user_two_id NOT IN (SELECT g.user_id FROM user_group) AND g.group_id = ?)" +
            "or" +
            "(r.user_two_id = ? and u.user_id = r.user_id AND r.status = 1 AND r.user_id NOT IN (SELECT g.user_id FROM user_group)) AND g.group_id = ?)";


        var query = "SELECT DISTINCT u.*, r.status FROM user u, user_group g, relationship r WHERE ((r.user_id = ? and u.user_id = r.user_two_id AND r.status = 1 AND NOT EXISTS (SELECT user_id FROM user_group WHERE user_group.group_id = ? AND r.user_two_id = user_group.user_id AND user_group.active=0 AND r.user_two_id = user_group.user_id)) " +
            "or " +
            "(r.user_two_id = ? and u.user_id = r.user_id AND r.status = 1 AND NOT EXISTS (SELECT user_id FROM user_group WHERE user_group.group_id = ? AND user_group.active=0 AND r.user_id = user_group.user_id)))"
        var table = [req.query.user_id, req.query.group_id, req.query.user_id, req.query.group_id];
        console.log("user ID: " + req.query.user_id);
        console.log("group_id: " + req.query.group_id);
        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                console.log(err);
                res.json({"Error": true, "Message": "Error executing MySQL query"});
            } else {
                console.log(JSON.stringify(rows, null, 2));
                res.json({
                    "Error": false,
                    "Message": "Success",
                    "User": rows
                });
            }
        });
    });
    router.post("/group/acceptInvite/", function (req, res) {
        var query = "INSERT INTO user_group(user_group_id, group_id, user_id) VALUES (null,?,?)";
        var table = [req.query.group_id,req.query.user_id];
        var newGroupID = 0;
        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                res.json({"Error": true, "Message": "Error executing MySQL query"});
                console.log("Error : Fail: " + err);
                //res.send()
            } else {
                res.json({
                    "Error": false,
                    "Message": "Success added to the group",
                    "User": rows
                });
            }
        });
    });

    router.get("/group/getMemebers/", function (req, res) {
        console.log("getMemebers called");
        var query = "SELECT u.* FROM user_group ug, user u WHERE ug.group_id = ? AND u.user_id = ug.user_id AND ug.active = 0  AND u.user_id != ?";
        var table = [req.query.group_id, req.query.user_id];
        var newGroupID = 0;
        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                res.json({"Error": true, "Message": "Error executing MySQL query"});
                console.log("Error : Fail: " + err);
                //res.send()
            } else {
                console.log(JSON.stringify(rows, null, 2));
                res.json({
                    "Error": false,
                    "Message": "Success",
                    "User": rows
                });
            }
        });
    });

    router.post("/group/removeMembers/", function (req, res) {
        console.log("removeMemebers called");
        console.log("group_id = "+ req.body.group_id);
        console.log("group_data = "+ req.body.group_data);



        var query = "UPDATE user_group SET active= 1 WHERE user_id = ? AND group_id = "+ req.body.group_id;
        var queries = '';
        var error = false;
        var errorFound = '';

        req.body.group_data.forEach(function (item) {
            queries = mysql.format("UPDATE user_group SET active= 1 WHERE user_id = ? AND group_id = "+ req.body.group_id, item);
            console.log("queries group_data = "+ item);
            connection.query(queries, function (err, rows) {
                if (err) {
                    //res.json({"Error": true, "Message": "Error executing MySQL query"});
                    console.log("Error : Fail: " + err);
                    //res.send()
                    var error = true;
                    errorFound = err;
                } else {
                    //console.log(JSON.stringify(rows, null, 2));
                }
            });
        });

        if(error){
            res.json({"Error": true, "Message": "Error executing MySQL query"});
        }else {
            res.json({
                "Error": false,
                "Message": "Users removed...",
            });
        }

    });


    /********************************************************
     SUBSCRIPTIONS
     ********************************************************    */


    router.get("/subscriptions/getSubscription/", function (req, res) {
        console.log("getSubscription called");
        var query = "SELECT DISTINCT  sub.* FROM subscription sub WHERE sub.userID = ? and sub.active = 0;";
        //var query = "SELECT DISTINCT  sub.* FROM subscription sub WHERE sub.userID = fXToGmox25Y6JZwXTr1CPNdCoho1 AND sub.active = 0;";
        var table = [req.query.user_id];
       //var table = ["fXToGmox25Y6JZwXTr1CPNdCoho1"];
        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                res.json({"Error": true, "Message": "Error executing MySQL query"});
                console.log("Error : Fail: " + err);
                //res.send()
            } else {
                console.log(JSON.stringify(rows, null, 2));
                res.json({
                    "Error": false,
                    "Message": "Success",
                    "Subscription": rows
                });
            }
        });
    });

    //Update Subscriptions.
    //INSERT INTO subscription(subscriptionID, userID, sportID,active) VALUES (null,"fXToGmox25Y6JZwXTr1CPNdCoho1",4,0) ON DUPLICATE KEY UPDATE active= 0
    router.post("/subscriptions/updateSubscription/", function (req, res) {
        console.log("updateSubscription called");
        var query = "INSERT INTO subscription(subscriptionID, userID, sportID,active) VALUES (?,?,?,0) ON DUPLICATE KEY UPDATE active= 1;";
        var queries = '';
        var error = false;
        var errorFound = '';

        //console.log(JSON.stringify(req.body, null, 2));

        req.body.listOfSubs.forEach(function (item) {
            console.log(item.subscriptionID + " " + item.userID+ " " + item.sportID+ " " + item.active)
            var query = "INSERT INTO subscription(subscriptionID, userID, sportID,active) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE active= ?;";
            var table = [item.subscriptionID, item.userID, item.sportID, item.active, item.active];
            //var table = ["fXToGmox25Y6JZwXTr1CPNdCoho1"];
            query = mysql.format(query, table);
            connection.query(query, function (err, rows) {
                if (err) {
/*                    res.json({"Error": true, "Message": "Error executing MySQL query"});
                    console.log("Error : Fail: " + err);
                    res.send()*/
                    var error = true;
                    errorFound = err;
                } else {
/*                    console.log(JSON.stringify(rows, null, 2));
                    res.json({
                        "Error": false,
                        "Message": "Success",
                        "Subscription": rows
                    });*/
                }
            });
        });
        if(error){
            res.json({"Error": true, "Message": "Error executing MySQL query"});
        }else {
            res.json({
                "Error": false,
                "Message": "Subscriptions updated...",
            });
        }
    });



    router.post("/events/getLatest/byCreated/", function (req, res) {
        var subIDs = [];
        req.body.item.forEach(function (item) {
            subIDs.push(item);
            console.log("SUB ID: " + item);
        });
        if(subIDs.length > 0){
            //this array is not empty
            var query = "SELECT e.*, l.location_name FROM event e,location l WHERE (e.sport_id in("+ subIDs.join() + ")) AND (TIMESTAMP(e.event_date,e.event_time) > NOW()) AND (l.location_id = e.location_id) ORDER BY e.event_id DESC LIMIT 5";

        }else{
            //this array is empty
            var query = "SELECT e.*, l.location_name FROM event e,location l WHERE (TIMESTAMP(e.event_date,e.event_time) > NOW()) AND (l.location_id = e.location_id) ORDER BY e.event_id DESC LIMIT 5";

        }
       //var query = "SELECT e.*, l.location_name FROM event e,location l WHERE (e.sport_id in("+ subIDs.join() + ")) AND (TIMESTAMP(e.event_date,e.event_time) > NOW()) AND (l.location_id = e.location_id) ORDER BY e.event_id DESC LIMIT 5";
        var table = [];
        //var table = ["fXToGmox25Y6JZwXTr1CPNdCoho1"];
        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                res.json({"Error": true, "Message": "Error executing MySQL query"});
                console.log("Error : Fail: " + err);
                //res.send()
            } else {
                console.log(JSON.stringify(rows, null, 2));
                res.json({
                    "Error": false,
                    "Message": "Success",
                    "Event": rows
                });
            }
        });
    });


    router.post("/events/getLatest/bySoon", function (req, res) {
        var subIDs = [];
        req.body.item.forEach(function (item) {
            subIDs.push(item);
            console.log("SUB ID: " + item);
        });
        if(subIDs.length > 0){
            var query = "SELECT DISTINCT e.*, l.location_name FROM event e,location l WHERE (e.sport_id in("+ subIDs.join() + ")) AND (TIMESTAMP(e.event_date,e.event_time) > NOW()) AND (l.location_id = e.location_id)  AND (e.space_left >0)   ORDER by e.event_date ASC, e.event_time ASC LIMIT  5";

        }
        else{
            var query = "SELECT DISTINCT e.*, l.location_name FROM event e,location l WHERE (TIMESTAMP(e.event_date,e.event_time) > NOW()) AND (l.location_id = e.location_id)  AND (e.space_left >0)   ORDER by e.event_date ASC, e.event_time ASC LIMIT  5";

        }
        //var query = "SELECT DISTINCT e.*, l.location_name FROM event e,location l WHERE (e.sport_id in("+ subIDs.join() + ")) AND (TIMESTAMP(e.event_date,e.event_time) > NOW()) AND (l.location_id = e.location_id)  AND (e.space_left >0)   ORDER by e.event_date ASC, e.event_time ASC LIMIT  5";
        var table = [];
        //var table = ["fXToGmox25Y6JZwXTr1CPNdCoho1"];
        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                res.json({"Error": true, "Message": "Error executing MySQL query"});
                console.log("Error : Fail: " + err);
                //res.send()
            } else {
                console.log(JSON.stringify(rows, null, 2));
                res.json({
                    "Error": false,
                    "Message": "Success",
                    "Event": rows
                });
            }
        });
    });


    //SELECT * FROM event_attendee WHERE event_attendee_id = 93 AND `user_id` = "fXToGmox25Y6JZwXTr1CPNdCoho1"

    /********************************************************
     Reviews
     ********************************************************    */

    router.get("/review/getReview/", function (req, res) {
        console.log("getReview called");
        var query = "SELECT * FROM event_attendee WHERE event_id = ? AND user_id = ?;";
        //var query = "SELECT * FROM event_attendee WHERE event_id = 93 AND user_id = 'fXToGmox25Y6JZwXTr1CPNdCoho1'";
        var table = [req.query.event_id, req.query.user_id];
        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                res.json({"Error": true, "Message": "Error executing MySQL query"});
                console.log("Error : Fail: " + err);
            } else {
                console.log(JSON.stringify(rows, null, 2));
                res.json({
                    "Error": false,
                    "Message": "Success",
                    "Review": rows
                });
            }
        });
    });

    router.post("/review/updateReview/", function (req, res) {
            var query = "UPDATE event_attendee SET appearance=? WHERE event_id = ? AND user_id = ?";
            var table = [req.body.appearance,req.body.event_id, req.body.user_id];
            query = mysql.format(query, table);
            connection.query(query, function (err, rows) {
                if (err) {
                    res.json({"Error": true, "Message": "Error executing MySQL query"});
                    console.log("Error : Fail: " + err);
                    //res.send()
                } else {
                    res.json({
                        "Error": false,
                        "Message": "Review updated",
                    });
                }
            });
        });





    /********************************************************
     NOTIFICATIONS
     ********************************************************    */


    router.post("/group/sendInvite/", function (req, res) {
        var FCM = require('fcm-node');
        var serverKey = 'AAAApfXJUV0:APA91bF3Cc_d-j9QWEMk2hhnHdO7G788GxKsUajSsaiLYQxko3DlpqPnaJ7Os3HrMM-hgoX96JqiyKJ2ihBYFEYMqioYZFgH3G1zUmCheC7k4abPixX0WRHwEH91MQJtUPMiaOgevqiRQHeAfZOJcQVDz7_dhDQEkQ';
        var fcm = new FCM(serverKey);
        var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
            //to: 'du66GYaFm2w:APA91bFvqa_QPGWo5E6QXUZd5KLqY7gFUqCqPSY59WzBzT12ReW_3DGbZNsV1DpslFhmVbcW57TIxjLQNJZldKrrSbaAdaPwdQ74BqGJEdh-QhJ1Lb6ySISbEz2d0gvTAc60rgGZG9q1',
            registration_ids: req.body.group_data,
            //collapse_key: 'your_collapse_key',

            /*    notification: {
             title: 'SportsHub',
             body: 'Body of your push notification'
             },*/

            data: {  //you can send only notification or only data(or include both)
                message: req.body.fullUserName + " invites you to the following group: " + req.body.group_name,
                type: 'group_request',
                open_activity: 'Activity_Chat.class',
                group_id: req.body.group_id
            }
        };

        fcm.send(message, function (err, response) {
            if (err) {
                console.log("Something has gone wrong! " + err);
                res.json({"Error": true, "Message": "Request Failed"});
            } else {
                console.log("Successfully sent with response: ", response);
                res.json({"Error": true, "Message": "Friends Invited"});
            }
        });
    });









    router.post("/notification/chat_notification", function (req, res) {
        console.log("Sending to:  " + req.body.userToken);
        var FCM = require('fcm-node');
        var serverKey = 'AAAApfXJUV0:APA91bF3Cc_d-j9QWEMk2hhnHdO7G788GxKsUajSsaiLYQxko3DlpqPnaJ7Os3HrMM-hgoX96JqiyKJ2ihBYFEYMqioYZFgH3G1zUmCheC7k4abPixX0WRHwEH91MQJtUPMiaOgevqiRQHeAfZOJcQVDz7_dhDQEkQ';
        var fcm = new FCM(serverKey);
        var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
            //to: 'du66GYaFm2w:APA91bFvqa_QPGWo5E6QXUZd5KLqY7gFUqCqPSY59WzBzT12ReW_3DGbZNsV1DpslFhmVbcW57TIxjLQNJZldKrrSbaAdaPwdQ74BqGJEdh-QhJ1Lb6ySISbEz2d0gvTAc60rgGZG9q1',
            to: req.body.userToken,
            //collapse_key: 'your_collapse_key',

            /*    notification: {
             title: 'SportsHub',
             body: 'Body of your push notification'
             },*/

            data: {  //you can send only notification or only data(or include both)
                message: req.body.message,
                type: 'chat',
                open_activity: 'Activity_Chat.class',
                sender_id: req.body.sender_id
            }
        };

        fcm.send(message, function (err, response) {
            if (err) {
                console.log("Something has gone wrong! " + err);
                res.json({"Error": true, "Message": "Failed"});
            } else {
                console.log("Successfully sent with response: ", response);
                res.json({"Error": true, "Message": "Success"});
            }
        });
    });

    function sendFriendRequest(req, res, reqToUserID, reqFromUserId) {
        var userToken;
        var regFromUserName;
        var query = "SELECT userToken, userFullName FROM user where (user_id = ? or user_id = ?) ORDER BY (user_id = ?) DESC";
        var table = [reqToUserID, reqFromUserId, reqToUserID];
        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                console.log(err);
                //res.json({"Error" : true, "Message" : "Error executing MySQL query"});
            } else {
                console.log(err);
                console.log("UserTokens: " + rows[0].userToken);
                console.log("regFromUserName: " + rows[0].regFromUserName);

                userToken = rows[0].userToken;
                regFromUserName = rows[0].userFullName;

                var FCM = require('fcm-node');
                var serverKey = 'AAAApfXJUV0:APA91bF3Cc_d-j9QWEMk2hhnHdO7G788GxKsUajSsaiLYQxko3DlpqPnaJ7Os3HrMM-hgoX96JqiyKJ2ihBYFEYMqioYZFgH3G1zUmCheC7k4abPixX0WRHwEH91MQJtUPMiaOgevqiRQHeAfZOJcQVDz7_dhDQEkQ';
                var fcm = new FCM(serverKey);
                var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                    //to: 'du66GYaFm2w:APA91bFvqa_QPGWo5E6QXUZd5KLqY7gFUqCqPSY59WzBzT12ReW_3DGbZNsV1DpslFhmVbcW57TIxjLQNJZldKrrSbaAdaPwdQ74BqGJEdh-QhJ1Lb6ySISbEz2d0gvTAc60rgGZG9q1',
                    to: userToken,

                    //collapse_key: 'your_collapse_key',

                    /*    notification: {
                     title: 'SportsHub',
                     body: 'Body of your push notification'
                     },*/

                    data: {  //you can send only notification or only data(or include both)
                        message: "Friend request from: " + regFromUserName,
                        type: 'friend_request',
                        open_activity: 'Activity_Chat.class',
                        sender_id: reqFromUserId,
                    }
                };


                fcm.send(message, function (err, response) {
                    if (err) {
                        console.log("Something has gone wrong! " + err);
                        console.log("UserTokens1: " + userToken);
                        console.log("regFromUserName1: " + regFromUserName);
                        res.json({"Error": true, "Message": "Failed"});
                    } else {
                        console.log("Successfully sent with response: ", response);
                        console.log("UserTokens1: " + userToken);
                        console.log("regFromUserName1: " + regFromUserName);
                        res.json({"Error": true, "Message": "Success"});
                    }
                });
            }

        });
    }



    function sendEventRequest(req, res, reqFromUserId,userTokens, eventID) {

        var regFromUserName;
        var query = "SELECT userFullName FROM user where user_id = ?"; //Get the user name of users full name who created the event
        var table = [reqFromUserId];
        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                console.log(err);
                //res.json({"Error" : true, "Message" : "Error executing MySQL query"});
            } else {
                regFromUserName = rows[0].userFullName; //User name of the user who created in event.

                var FCM = require('fcm-node');
                var serverKey = 'AAAApfXJUV0:APA91bF3Cc_d-j9QWEMk2hhnHdO7G788GxKsUajSsaiLYQxko3DlpqPnaJ7Os3HrMM-hgoX96JqiyKJ2ihBYFEYMqioYZFgH3G1zUmCheC7k4abPixX0WRHwEH91MQJtUPMiaOgevqiRQHeAfZOJcQVDz7_dhDQEkQ';
                var fcm = new FCM(serverKey);
                var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)

                    registration_ids: userTokens,//This will send it to multiple devices.

                    data: {  //you can send only notification or only data(or include both)
                        message: "Event request from: " + regFromUserName,
                        type: 'event_request',
                        open_activity: 'Activity_Chat.class',
                        sender_id: reqFromUserId,
                        event_id: eventID,
                    }
                };

                fcm.send(message, function (err, response) {
                    if (err) {
                        console.log("Something has gone wrong! " + err);
                    } else {
                        console.log("Successfully sent with response: ", response);
                    }
                });
            }

        });
    }

    router.get('/crash', function () {
        process.nextTick(function () {
            throw new Error;
        });
    })

//SELECT * FROM event WHERE (sport_id in(3,4)) AND (event_date > CURRENT_DATE) AND (event_time > CURRENT_TIME) LIMIT 5
    /*CREATE VIEW view_user AS
     SELECT user.user_id,user.userFullName,user.userProfileUrl,
     (SELECT COUNT(*) FROM event_attendee WHERE user.user_id = event_attendee.user_id) as attendances,
     (SELECT COUNT(*) FROM event_attendee WHERE event_attendee.appearance=0 and user.user_id = event_attendee.user_id) as failed_attendances
     FROM event_attendee, user
     WHERE event_attendee.user_id = user.user_id OR event_attendee.user_id <> user.user_id
     GROUP BY user.user_id*/


    /*CREATE VIEW view_user1 AS
     SELECT user.user_id,user.userFullName,user.userProfileUrl,
     (SELECT COUNT(*) FROM event_attendee WHERE user.user_id = event_attendee.user_id) as attendances,
     (SELECT COUNT(*) FROM event_attendee WHERE event_attendee.appearance=0 and user.user_id = event_attendee.user_id) as failed_attendances,
     (SELECT COUNT(*) FROM event WHERE event.creator_user_id = user.user_id) as organized
     FROM event_attendee, user
     WHERE event_attendee.user_id = user.user_id OR event_attendee.user_id <> user.user_id
     GROUP BY user.user_id

     CREATE VIEW view_user1 AS
     SELECT user.user_id,user.userFullName,user.userProfileUrl, user.userToken,
     (SELECT COUNT(event_attendee.appearance) FROM event_attendee WHERE user.user_id = event_attendee.user_id AND event_attendee.appearance = 1) as attendances,
     (SELECT COUNT(*) FROM event_attendee WHERE event_attendee.appearance=0 and user.user_id = event_attendee.user_id) as failed_attendances,
     (SELECT COUNT(*) FROM event WHERE event.creator_user_id = user.user_id) as organized
     FROM event_attendee, user
     WHERE event_attendee.user_id = user.user_id OR event_attendee.user_id <> user.user_id
     GROUP BY user.user_id*/
//SELECT a.status, b.* FROM relationship a, user b WHERE (a.user_id = "rssrroIVfAW9v3ND4irDq7kCNKO2" and b.user_id = a.user_two_id) or (a.user_two_id = "rssrroIVfAW9v3ND4irDq7kCNKO2" and b.user_id = a.user_id)

    /*IF(SELECT * FROM relationship WHERE (relationship.user_id = "fXToGmox25Y6JZwXTr1CPNdCoho1" AND relationship.user_two_id = "UOm4tK3vTiMcmWqBFJNG9DENUkr2") OR (relationship.user_two_id = "fXToGmox25Y6JZwXTr1CPNdCoho1" AND relationship.user_id = "UOm4tK3vTiMcmWqBFJNG9DENUkr2") THEN
     BEGIN
     INSERT INTO relationship(`user_id`,`user_two_id`,`status`,`action_user_id`) VALUES (4,5,0,4)
     END
     */


}

module.exports = REST_ROUTER;


