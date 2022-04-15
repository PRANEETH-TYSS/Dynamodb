require("dotenv/config");
const express = require("express");
const app = express();
const PORT = 5000;
const AWS = require("aws-sdk");
const multer = require("multer");
const { v4: uuid } = require("uuid");
const XLSX = require("xlsx");
// const dynamodb = new AWS.DynamoDB({
//   region: "ap-south-1",
//   accessKeyId: process.env.AWS_ID,
//   secretAccessKey: process.env.AWS_SECRET,
// });
AWS.config.update({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET,
});
const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: "ap-south-1",
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
    let myFile = req.file.originalname;
    if (myFile.slice(-5) == ".xlsx") {
      // const fileType = myFile[myFile.length - 1];
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${uuid()}.xlsx`,
        Body: req.file.buffer,
      };
      var s3 = await S3bucket.upload(params).promise();
      var Params = {
        TableName: userTable,
        Item: {
          id: `${uuid()}`,
          s3response: s3,
        },
      };
      function getBufferFromS3(file, callback) {
        const buffers = [];
        const s3 = new AWS.S3();
        const stream = s3
          .getObject({ Bucket: "praneethawsstoragefile", Key: file })
          .createReadStream();
        stream.on("data", data => buffers.push(data));
        stream.on("end", () => callback(null, Buffer.concat(buffers)));
        stream.on("error", error => callback(error));
      }

      // promisify read stream from s3
      function getBufferFromS3Promise(file) {
        return new Promise((resolve, reject) => {
          getBufferFromS3(file, (error, s3buffer) => {
            if (error) return reject(error);
            return resolve(s3buffer);
          });
        });
      }
      const buffer = await getBufferFromS3Promise(Params);
      const workbook = XLSX.read(buffer);
      console.log(workbook);
      res.send("result");
    } else {
      res.status(302).send("file extension does not support");
    }
  } catch (err) {
    console.error(err);
  }
});

app.listen(PORT, () => {
  console.log("server is logged in 5000 port");
});
