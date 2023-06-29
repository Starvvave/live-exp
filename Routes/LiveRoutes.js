const express = require("express");
const liveController = require("../Controllers/LiveController");
const authController = require("../Controllers/Auth");
const imageController = require("../utils/Images");
const reviewRouter = require("../Routes/ReviewRoutes");

const router = express.Router();

router
.route("/").get(liveController.getAllLives)
.post(authController.protect, liveController.createLive, 
    imageController.uploadLivePhotos, imageController.livePhoto);

router
.route("/:id").get(liveController.getLive)
.patch(authController.protect, imageController.uploadLivePhotos,
    imageController.livePhoto, liveController.updateLive)
.delete(authController.protect, authController.restrictTo("admin"), 
    liveController.deleteLive);

module.exports = router;    