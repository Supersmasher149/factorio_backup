const time_diff = 1200000; // 20 minutes
// Load the AWS SDK for Node.js
var AWS = require("aws-sdk");
// Set the region
AWS.config.update({ region: "us-east-1" });
var fs = require("fs");
// Create S3 service object
var s3 = new AWS.S3();

const bucketParams = {
  Bucket: "3nacfactorio",
};

function uploadObject(bucketName, fileName) {
  var uploadParams = {
    Bucket: bucketName,
    Key: "",
    Body: "",
    Metadata: [],
  };

  // add metadata with the date the file was created
  let date = Date.parse(fs.statSync(fileName).birthtime).toString();
  uploadParams.Metadata = {
    "x-amz-meta-dateCreated": date,
  };

  var file = fileName;

  // Configure the file stream and obtain the upload parameters
  var fileStream = fs.createReadStream(file);
  fileStream.on("error", function (err) {
    console.log("File Error", err);
  });
  uploadParams.Body = fileStream;
  var path = require("path");
  let new_key = `${date}-${uuidv4()}_${path.basename(file)}`;
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function uploadObjectFolder(bucketName, folderName) {
  const fs = require("fs");
  for (const file of fs.readdirSync(folderName)) {
    uploadObject(bucketName, `${folderName}/${file}`);
  }
}

//create a uuid using the crypto module
function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getLocalFilesDates(folderName) {
  const fs = require("fs");
  let files = [];
  for (const file of fs.readdirSync(folderName)) {
    files.push({
      name: file,
      date: Date.parse(
        fs.statSync(`${folderName}/${file}`).birthtime
      ).toString(),
    });
  }
  return files;
}

// Use the listObjectsV2() function to retrieve the latest 10 objects

async function listObjects(bucketName) {
  var params = {
    Bucket: bucketName,
  };
  let files = [];
  try {
    const data = await s3.listObjectsV2(params).promise();
    data.Contents.forEach(function (content) {
      files.push({
        name: content.Key,
        date: content.Key.split("-")[0],
      });
    });
  } catch (err) {
    console.log("Error", err);
  }
  return files;
}

let remote_files = [];
let local_files = [];

async function main() {
  remote_files = await listObjects("3nacfactorio");
  local_files = getLocalFilesDates(
    "/Users/waltergibbons/Downloads/newsaves/saves/"
  );
  //console.log("remote_files", remote_files);
  //console.log("local_files", local_files);

  for (let i = 0; i < local_files.length; i++) {
    let local_file = local_files[i];
    let found = false;
    for (let j = 0; j < remote_files.length; j++) {
      let remote_file = remote_files[j];
      if (local_file.name == remote_file.name) {
        found = true;
        break;
      }
      if (local_file.date - remote_file.date < time_diff) {
        found = true;
        break;
      }
    }
    if (!found) {
      console.log("uploading", local_file.name);
      uploadObject(
        "3nacfactorio",
        `/Users/waltergibbons/Downloads/newsaves/saves/${local_file.name}`
      );
    }
  }
}

main();
