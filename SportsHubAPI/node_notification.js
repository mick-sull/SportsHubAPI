/*var gcm = require('node-gcm');

var message = new gcm.Message();

message.addData('hello', 'world');
message.addNotification('title', 'Hello');
message.addNotification('icon', 'ic_launcher');
message.addNotification('body', 'World');


//Add your mobile device registration tokens here
var regTokens = ['eyh3vx0Rf_4:APA91bHkzH69ZVz4YaP-LN9AINnSUj0sDhzYPHgxoYtzl1gS_sujE-Sr3NibsEXH8qjjDMlddQxWRV_GlggLIw5pGuzqPZTaO_nQI-T_Otp0WwHeukK80Zf9SdBiYBEUPfz8MaOEHVlv'];
//Replace your developer API key with GCM enabled here
var sender = new gcm.Sender('');

sender.send(message, regTokens, function (err, response) {
    if(err) {
      console.error("Err: " + err);
    } else {
      console.log("response: " + response);
    }
});*/




var FCM = require('fcm-node');

var serverKey = 'AAAApfXJUV0:APA91bF3Cc_d-j9QWEMk2hhnHdO7G788GxKsUajSsaiLYQxko3DlpqPnaJ7Os3HrMM-hgoX96JqiyKJ2ihBYFEYMqioYZFgH3G1zUmCheC7k4abPixX0WRHwEH91MQJtUPMiaOgevqiRQHeAfZOJcQVDz7_dhDQEkQ';
var fcm = new FCM(serverKey);

var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
    to: 'du66GYaFm2w:APA91bFvqa_QPGWo5E6QXUZd5KLqY7gFUqCqPSY59WzBzT12ReW_3DGbZNsV1DpslFhmVbcW57TIxjLQNJZldKrrSbaAdaPwdQ74BqGJEdh-QhJ1Lb6ySISbEz2d0gvTAc60rgGZG9q1', 
    //collapse_key: 'your_collapse_key',
    
/*    notification: {
        title: 'SportsHub', 
        body: 'Body of your push notification' 
    },*/
    
    data: {  //you can send only notification or only data(or include both)
        message: 'What time is the game?',
        type: 'chat',
       	open_activity: 'Activity_Chat.class',
       	sender_id: 'Q1MEmQt83eSyMgjhrFc7nRpDw1i1'
       
    }
};

fcm.send(message, function(err, response){
    if (err) {
        console.log("Something has gone wrong! " + err);
    } else {
        console.log("Successfully sent with response: ", response);
    }
});