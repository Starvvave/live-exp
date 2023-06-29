const multer = require("multer");
const sharp = require("sharp");
const catchAsync = require("./catchAsync");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        cb(null, true);
    } else {
    cb(new AppError("Please upload an image", 400), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single("photo");
exports.uploadLivePhotos = upload.array("images", 3);
exports.resizePhoto = catchAsync(async(req, res, next) => {
    if (!req.file) {return next();}
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer).resize(500, 500)
    .toFormat("jpeg")
    .toFile(`public/img/users/${req.file.filename}`);

    next();
});
exports.livePhoto = catchAsync(async(req, res, next) => {
    if (!req.files.images) return next();
    
    req.body.images = [];
    await Promise.all(req.files.images.map(async (file, i) => {
        const filename = `live-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

        await sharp(file.buffer)
        .toFormat("jpeg")
        .toFile(`public/img/lives/${filename}`);
        req.body.images.push(filename);
    }));

    next();
});
