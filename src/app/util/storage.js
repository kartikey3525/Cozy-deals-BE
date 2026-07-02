const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const streamifier = require("streamifier");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_FILE_SIZE = 20 * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  // Images
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",

  // Videos
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska",
  "video/webm",

  // Audio
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/aac",

  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

const multerUpload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: MAX_FILE_SIZE,
  },

  fileFilter(req, file, cb) {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(null, true);
    }

    cb(new Error(`Unsupported file type : ${file.mimetype}`));
  },
});

const uploadBuffer = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `serviceApplication/${folder}`,
        resource_type: "auto",
        overwrite: false,
        unique_filename: true,
      },
      (error, result) => {
        if (error) return reject(error);

        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

const decorateFile = (file, result) => {
  // Backward compatibility with old AWS S3 implementation
  file.location = result.secure_url;
  file.key = result.public_id;

  // Extra metadata
  file.public_id = result.public_id;
  file.url = result.secure_url;
  file.bytes = result.bytes;
  file.width = result.width;
  file.height = result.height;
  file.format = result.format;
  file.resource_type = result.resource_type;
  file.asset_id = result.asset_id;
  file.version = result.version;

  return file;
};

const uploadFiles = async (files, folder) => {
  await Promise.all(
    files.map(async (file) => {
      const result = await uploadBuffer(file.buffer, folder);
      decorateFile(file, result);
    })
  );
};

exports.upload = (folder) => ({
  single(fieldName) {
    return (req, res, next) => {
      multerUpload.single(fieldName)(req, res, async (err) => {
        if (err) return next(err);

        try {
          if (req.file) {
            const result = await uploadBuffer(req.file.buffer, folder);
            decorateFile(req.file, result);
          }

          next();
        } catch (error) {
          next(error);
        }
      });
    };
  },

  array(fieldName, maxCount = 20) {
    return (req, res, next) => {
      multerUpload.array(fieldName, maxCount)(req, res, async (err) => {
        if (err) return next(err);

        try {
          if (req.files?.length) {
            await uploadFiles(req.files, folder);
          }

          next();
        } catch (error) {
          next(error);
        }
      });
    };
  },

  fields(fields) {
    return (req, res, next) => {
      multerUpload.fields(fields)(req, res, async (err) => {
        if (err) return next(err);

        try {
          if (req.files) {
            const uploads = [];

            Object.keys(req.files).forEach((field) => {
              uploads.push(uploadFiles(req.files[field], folder));
            });

            await Promise.all(uploads);
          }

          next();
        } catch (error) {
          next(error);
        }
      });
    };
  },
});

exports.deleteFile = async (publicId) => {
  if (!publicId) return;

  return cloudinary.uploader.destroy(publicId, {
    resource_type: "auto",
  });
};

exports.cloudinary = cloudinary;