const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const streamifier = require("streamifier");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();

const multerUpload = multer({
    storage,
    limits: {
        fileSize: 20 * 1024 * 1024,
    },
});

const uploadToCloudinary = (buffer, folder) => {
    return new Promise((resolve, reject) => {

        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "auto",
            },
            (error, result) => {

                if (error)
                    return reject(error);

                resolve(result);
            }
        );

        streamifier.createReadStream(buffer).pipe(stream);

    });
};

exports.upload = (folder) => {

    return {

        single(fieldName) {

            return async (req, res, next) => {

                multerUpload.single(fieldName)(req, res, async (err) => {

                    if (err)
                        return next(err);

                    if (!req.file)
                        return next();

                    try {

                        const result = await uploadToCloudinary(
                            req.file.buffer,
                            folder
                        );

                        req.file.location = result.secure_url;
                        req.file.key = result.public_id;

                        next();

                    } catch (e) {

                        next(e);

                    }

                });

            };

        },

        fields(fields) {

            return async (req, res, next) => {

                multerUpload.fields(fields)(req, res, async (err) => {

                    if (err)
                        return next(err);

                    try {

                        if (req.files) {

                            for (const field of Object.keys(req.files)) {

                                for (const file of req.files[field]) {

                                    const result =
                                        await uploadToCloudinary(
                                            file.buffer,
                                            folder
                                        );

                                    file.location = result.secure_url;
                                    file.key = result.public_id;
                                }

                            }

                        }

                        next();

                    } catch (e) {

                        next(e);

                    }

                });

            };

        },

    };

};