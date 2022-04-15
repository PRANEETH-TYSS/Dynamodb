// Load the AWS SDK for Node.js
var AWS = require("aws-sdk");
// Set the region
AWS.config.update({ region: "ap-south-1" });

// Create the DynamoDB service object
var ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });

// var params = {
//   TableName: "Multer_dynamoTable",
//   Item: {
//     id: "pinky",
//     CUSTOMER_NAME: { S: "Richard Roe" },
//   },
// };

// // Call DynamoDB to add the item to the table
// ddb.putItem(params, function (err, data) {
//   if (err) {
//     console.log("Error", err);
//   } else {
//     console.log("Success", data);
//   }
// });

/* This example adds a new item to the Music table. */

 var params = {
  Item: {
   "AlbumTitle": {
     S: "Somewhat Famous"
    }, 
   "Artist": {
     S: "No One You Know"
    }, 
   "SongTitle": {
     S: "Call Me Today"
    }
  }, 
  ReturnConsumedCapacity: "TOTAL", 
  TableName: "Music"
 };
 d.putItem(params, function(err, data) {
   if (err) console.log(err, err.stack); // an error occurred
   else     console.log(data);           // successful response
   /*
   data = {
    ConsumedCapacity: {
     CapacityUnits: 1, 
     TableName: "Music"
    }
   }
   */
 });