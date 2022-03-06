const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path"); 

AWS.config.loadFromPath("./config.json");
const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

const bucketName = "rubiks.miltonjones.nl";


const uploadFilePromise = (
  filePath,
  fileRoot = "assets/holo/",
  onProgress,
  otherBucket
) =>
  new Promise((yes, no) => {
    const fileStream = fs.createReadStream(filePath);
    const uploadParams = { Bucket: otherBucket || bucketName };
    fileStream.on("error", function (err) {
      no({ "File Error": err });
    });
    uploadParams.Body = fileStream;
    uploadParams.Key = fileRoot + path.basename(filePath);

    // call S3 to retrieve upload file to specified bucket
    s3.upload(uploadParams, function (err, data) {
      if (err) {
        no({ Error: err });
      }
      if (data) {
        yes( data.Location );
      }
    }).on("httpUploadProgress", (progress) => {
      const percent = Math.round((progress.loaded / progress.total) * 100);
      onProgress && onProgress(percent);
      console.log({
        progress: progress.loaded + " of " + progress.total + `(${percent}%)`,
      });
    });
  });


  exports.upload = uploadFilePromise;


