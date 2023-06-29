const express = require("express");
const viewsController = require("../Controllers/ViewsController");
const authController = require("../Controllers/Auth");

const router = express.Router();

router.use(viewsController.alerts);

router.get("/", authController.isLoggedIn, viewsController.getOverview);
router.get("/lives/:liveId", authController.isLoggedIn, viewsController.getLive);
router.get("/login", authController.isLoggedIn, viewsController.getLoginForm);
router.get("/signup",authController.isLoggedIn, viewsController.getSignupForm);
router.get("/Me", authController.protect, viewsController.getAccout);
router.get("/share", authController.protect, viewsController.share);
router.get("/my-reviews", authController.protect, viewsController.getMyReviews);
router.post("/submit-user-data", authController.protect, viewsController.updateUser);

module.exports = router;