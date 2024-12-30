// var aws = require("aws-sdk");
var multer = require("multer");
var multerS3 = require("multer-s3");

const { S3Client } = require("@aws-sdk/client-s3"); // AWS SDK v3 import

// Initialize the S3 client with AWS SDK v3
const s3Client = new S3Client({
  region: "ap-south-1", // Specify your desired AWS region (example: Mumbai)
  credentials: {
    accessKeyId: process.env.AccessKeyId, // Use environment variables for credentials
    secretAccessKey: process.env.SecretAccessKey, // or hardcoded values
  },
});

// Multer configuration to handle file uploads to S3
exports.upload = (folder) =>
  multer({
    storage: multerS3({
      s3: s3Client, // Use the AWS SDK v3 S3 client
      bucket: "", // Your S3 bucket name
      acl: "public-read", // Set the access control list (permissions) as needed
      metadata: function (req, file, cb) {
        // Store custom metadata (optional)
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req, file, cb) {
        // Generate a unique file name using timestamp and file extension
        let extension = file.originalname.split(".").pop();
        cb(null, `${folder}/${Date.now().toString()}.${extension}`);
      },
    }),
  });
