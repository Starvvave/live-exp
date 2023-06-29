const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required:[true, "Please provide your name."]
    },
    email:{
        type: String,
        required:[true, "Please provide your Email."],
        unique: true,
        lowercase: true,
        validator: [validator.isEmail, "Please provide a valid Email."]
    },
    photo:{
        type: String,
        default: "default.jpg"
    },
    role:{
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    password:{
        type: String,
        required: [true, "Please provide your password."],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, "Please confirm your password."],
        validate: {
            validator: function(confirm) {
                return confirm === this.password;
            },
            message: "Passwords are not the same."
        }
    },
    passwordChanged: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
},
{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

userSchema.virtual("reviews", {
    ref: "Review",
    foreignField: "user",
    localField: "_id"
});

userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre("save", async function(next) {
    if (!this.isModified("password") || this.isNew) return next();

    this.passwordChange = Date.now() - 1000;
    next();
});

userSchema.methods.correctPassword = async function(enteredPass, userPass) {
    return await bcrypt.compare(enteredPass, userPass);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChanged) {
        const changedTimestamp = parseInt(
        this.passwordChanged.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};

userSchema.methods.createPasswordResetToken = async function() {
    const resetToken = crypto.randomBytes(32).toString("hex");

    this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;