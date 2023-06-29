const express = require("express");
const authController = require("../Controllers/Auth");
const userController = require("../Controllers/UserController");
const imageController = require("../utils/Images");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/logout", authController.logout);

router.post("/forgetPassword", authController.forgetPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

router.use(authController.protect);

router.patch("/updatePassword", authController.updatePassword);
router.get("/getMe", userController.getMe, userController.getUser);
router.patch("/updateMe", imageController.uploadUserPhoto, 
imageController.resizePhoto, userController.updateMe);

router.use(authController.restrictTo("admin"));

router.route("/").get(userController.getUsers);
router.route("/id")
.get(userController.getUser)
.patch(userController.updateUser);

module.exports = router;