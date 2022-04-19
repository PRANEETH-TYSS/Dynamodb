require("dotenv/config");
const express = require("express");
const app = express();
const PORT = 5000;
const AWS = require("aws-sdk");
const multer = require("multer");
const csv = require("csvtojson");
const { v4: uuid } = require("uuid");
const s3res = new AWS.S3();
var documentClient = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "ap-south-1",
});
AWS.config.update({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET,
});

var userTable = process.env.TABLE_NAME;

//! aws instance
const S3bucket = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET,
});

// storage for multer]

const storage = multer.memoryStorage({
  destination: function (req, file, callback) {
    callback(null, "");
  },
});
const upload = multer({ storage }).single("image");

app.post("/upload", upload, async (req, res) => {
  try {
    if (
      req.file.mimetype.includes("excel") ||
      req.file.mimetype.includes("spreadsheetml")
    ) {
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${uuid()}.xlsx`,
        Body: req.file.buffer,
      };
      var s3 = await S3bucket.upload(params).promise();
      //converting to json
      const s3Stream = s3res.getObject(bucketParams).createReadStream();
      csv()
        .fromStream(s3Stream)
        .on("data", row => {
          let jsonContent = JSON.parse(row);
          console.log(JSON.stringify(jsonContent));
        });
      var bucketParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: params.Key,
      };
      S3bucket.getObject(bucketParams, function (err, data) {
        if (err) {
          console.log("Error", err);
        } else {
          let data2 = data.Body.buffer;
          var Params = {
            TableName: process.env.TABLE_NAME,
            Item: {
              id: params.Key,
              s3response: data2,
            },
          };
          documentClient.put(Params, (err, data) => {
            if (err) {
              console.log(err);
            } else {
              console.log("successfully added ");
              console.log(data);
            }
          });
        }
      });

      res.send("result");
    } else {
      res.status(302).send("please upload an excelsheet only");
    }
  } catch (err) {
    console.error(err);
  }
});

app.listen(PORT, () => {
  console.log("server is logged in 5000 port");
});
