// Load the AWS SDK for Node.js
var AWS = require("aws-sdk");
// Set the region
AWS.config.update({ region: "us-east-1" });

// Create S3 service object
var s3 = new AWS.S3({ apiVersion: "2006-03-01" });

function uploadObject(bucketName, fileName) {
  var uploadParams = { Bucket: bucketName, Key: "", Body: "" };
  var file = fileName;

  // Configure the file stream and obtain the upload parameters
  var fs = require("fs");
  var fileStream = fs.createReadStream(file);
  fileStream.on("error", function (err) {
    console.log("File Error", err);
  });
  uploadParams.Body = fileStream;
  var path = require("path");
  let new_key = `${uuidv4()}_${path.basename(file)}`;
  //uploadParams.Key = path.basename(file);
  uploadParams.Key = new_key;

  // call S3 to retrieve upload file to specified bucket
  s3.upload(uploadParams, function (err, data) {
    if (err) {
      console.log("Error", err);
    }
    if (data) {
      console.log("Upload Success", data.Location);
    }
  });
}

function uploadObjectFolder(bucketName, folderName) {
  const fs = require("fs");
  for (const file of fs.readdirSync(folderName)) {
    uploadObject(bucketName, `${folderName}/${file}`);
  }
}
//uploadObjectFolder("3nacfactorio", "/Users/waltergibbons/Documents/awss3backup/saves")

//create a uuid using the crypto module
function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
//const bucketName = "3nacfactorio";
//uploadObject(bucketName, "_autosave10.zip")
