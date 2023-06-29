const User = require("../Models/UserModel");
const operations = require("./CRUDOperations");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

exports.getUser = operations.getOne(User);
exports.getUsers = operations.getAll(User);
exports.updateUser = operations.updateOne(User);

const filterObj = (obj, ...allowed) => {
    let newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowed.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

exports.updateMe = catchAsync(async(req, res, next) => {
    if (req.body.password || req.body.passwordconfirm) {
        return next(new AppError("This route is not for password update.", 400));
    }

    const filteredBody = filterObj(req.body, "name", "email");
    if (req.file) filteredBody.photo = req.file.filename;

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: "success",
        data: {
            user: updatedUser
        }
    });
});

